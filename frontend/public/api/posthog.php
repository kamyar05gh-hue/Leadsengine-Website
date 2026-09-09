<?php
/**
 * PostHog query proxy.
 *
 * WHY THIS EXISTS. The dashboard needs a PostHog *personal* API key, which
 * grants full read/write access to the whole project. Vite inlines anything
 * named `VITE_*` into the client bundle, so putting that key in the frontend
 * env publishes it: anyone opening /dashboard/ and viewing source would have
 * it. This file keeps the key on the server. The browser sends only a HogQL
 * string; the key is attached here and never leaves the host.
 *
 * THE KEY IS NOT IN THIS FILE, AND NOT IN THE REPOSITORY. It is read from a
 * JSON file OUTSIDE the web root (see $CONFIG below), so it cannot be served
 * even if Apache stops executing PHP — a real failure mode, and the reason
 * "just put it in a .php in the docroot" is not good enough.
 *
 * ACCESS CONTROL IS NOT OPTIONAL. Without it this endpoint would let anyone
 * on the internet run arbitrary HogQL against the project — strictly worse
 * than the leaked key it replaces. It is protected by HTTP Basic auth in
 * `.htaccess`, alongside /dashboard/ itself.
 */

declare(strict_types=1);

/* Outside the web root on purpose. `~/www` is the served tree; this sits
   next to it, where no URL can reach it. */
$CONFIG = dirname(__DIR__, 3) . '/private/leadsengine-posthog.json';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function fail(int $status, string $message): never {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'POST only');
}

if (!is_readable($CONFIG)) {
    /* Deliberately vague to the client, specific in the server log — the
       path of a secrets file is not something to hand to a caller. */
    error_log('posthog proxy: config not readable at ' . $CONFIG);
    fail(500, 'Proxy not configured');
}

$conf = json_decode((string) file_get_contents($CONFIG), true);
if (!is_array($conf) || empty($conf['personal_key']) || empty($conf['project_id'])) {
    error_log('posthog proxy: config missing personal_key/project_id');
    fail(500, 'Proxy not configured');
}

$host = rtrim((string) ($conf['host'] ?? 'https://eu.posthog.com'), '/');
$body = json_decode((string) file_get_contents('php://input'), true);

/* Only a HogQL query is forwarded. The proxy is not a general pass-through
   to the PostHog API: it accepts one shape and rebuilds the request from
   scratch, so a caller cannot reach other endpoints or smuggle extra fields. */
$sql = $body['query']['query'] ?? null;
if (!is_string($sql) || $sql === '') {
    fail(400, 'Expected {"query":{"kind":"HogQLQuery","query":"..."}}');
}

/* ---------------------------------------------------------------- cache
 * WHY THERE IS A CACHE HERE.
 *
 * Measured on the live dashboard: the Overview tab alone fires SEVEN HogQL
 * queries in parallel, and the app re-fires every visible tab's queries on a
 * 30-second timer. Two of those queries are genuinely heavy — 2.7 s and 4.5 s
 * when the project is idle. Put six tabs and a couple of open browsers on
 * that schedule and the requests queue upstream; one was measured at
 * 30,031 ms, which is exactly the cURL timeout below. On timeout this file
 * returned 502, the dashboard turned that into a PosthogError, and the panel
 * that owned the query rendered nothing. That is the "tabs not fully
 * loading" symptom: not an auth problem and not a broken query, just the
 * slowest one of seven losing a race against a 30-second ceiling.
 *
 * The dashboard cannot show anything fresher than its own 30-second refresh,
 * so a cache entry that lives 45 seconds costs the reader nothing and takes
 * almost every one of those queries off the upstream entirely.
 *
 * STALE IS BETTER THAN EMPTY. If the upstream does fail or time out, a stale
 * entry is served instead of the 502, with a header saying so. A panel
 * showing figures from four minutes ago is honest and useful; a panel
 * showing nothing tells the reader their dashboard is broken.
 *
 * The cache directory sits OUTSIDE the web root, next to the config, because
 * the responses contain analytics data for the whole project. Entries are
 * keyed by a hash of the SQL, so two different queries can never collide.
 */
const CACHE_TTL   = 45;     // seconds an entry is served without asking upstream
const CACHE_STALE = 900;    // seconds an entry may still be served on failure

$cacheDir = dirname(__DIR__, 3) . '/private/posthog-cache';
$cacheKey = hash('sha256', $sql);
$cacheFile = $cacheDir . '/' . $cacheKey . '.json';

$cachedAt = is_readable($cacheFile) ? (int) filemtime($cacheFile) : 0;
$age = $cachedAt ? time() - $cachedAt : PHP_INT_MAX;

if ($age <= CACHE_TTL) {
    header('X-Proxy-Cache: hit');
    header('X-Proxy-Age: ' . $age);
    readfile($cacheFile);
    exit;
}

$ch = curl_init("{$host}/api/projects/{$conf['project_id']}/query/");
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    /* 30 s was the ceiling every timed-out query hit. The queries that
       matter finish in under five; the ones that do not are queued upstream,
       and giving them another 20 s is what turns a dead panel into a slow
       one. CONNECTTIMEOUT stays short so a genuinely unreachable host fails
       fast instead of burning the whole budget on the handshake. */
    CURLOPT_TIMEOUT        => 50,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $conf['personal_key'],
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'query' => ['kind' => 'HogQLQuery', 'query' => $sql],
    ]),
]);

$response = curl_exec($ch);
$status   = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$err      = curl_error($ch);
curl_close($ch);

/** Last good answer for this exact query, if it is not too old to be honest. */
function serveStale(string $file, int $age, string $why): bool {
    if ($age > CACHE_STALE || !is_readable($file)) {
        return false;
    }
    error_log('posthog proxy: serving stale (' . $age . 's) after ' . $why);
    header('X-Proxy-Cache: stale');
    header('X-Proxy-Age: ' . $age);
    readfile($file);
    return true;
}

if ($response === false) {
    error_log('posthog proxy: curl failed: ' . $err);
    if (serveStale($cacheFile, $age, 'curl error: ' . $err)) {
        exit;
    }
    fail(504, 'Upstream request timed out');
}

if ($status === 200) {
    /* Written via a temp file and renamed, so a second request can never
       read a half-written entry. Failure to cache is not failure to answer. */
    if (is_dir($cacheDir) || @mkdir($cacheDir, 0700, true)) {
        $tmp = $cacheFile . '.' . getmypid() . '.tmp';
        if (@file_put_contents($tmp, $response) !== false) {
            @rename($tmp, $cacheFile);
        }
    }
    header('X-Proxy-Cache: miss');
    echo $response;
    exit;
}

/* Upstream answered, but not with success — rate limiting, most often. The
   last good answer beats handing the dashboard an error it can only render
   as an empty panel. */
if (serveStale($cacheFile, $age, 'upstream HTTP ' . $status)) {
    exit;
}

http_response_code($status ?: 502);
echo $response;
