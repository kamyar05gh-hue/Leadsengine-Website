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

$ch = curl_init("{$host}/api/projects/{$conf['project_id']}/query/");
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 30,
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

if ($response === false) {
    error_log('posthog proxy: curl failed: ' . $err);
    fail(502, 'Upstream request failed');
}

http_response_code($status ?: 502);
echo $response;
