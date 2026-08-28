<?php
/**
 * Free-analysis request handler.
 *
 * WHAT IT IS FOR. The page at /analyse/ collects five fields and a consent
 * tick. This turns that into an email to the two inboxes that act on it, and
 * — just as importantly — writes every submission to a file first.
 *
 * WHY THE FILE COMES FIRST, AND WHY IT IS NOT OPTIONAL.
 * leadsengine.ch has its MX, SPF and DKIM at Migadu. Mail handed to PHP on
 * the Hostpoint web server does NOT leave from a Migadu host, so it can fail
 * SPF alignment and be filed as spam or dropped outright — and `mail()`
 * returning true only means the message reached the local queue, never that
 * it was delivered. A lead is the most valuable thing this site produces; it
 * must not depend on a mail path nobody is monitoring. So the record is
 * appended to disk BEFORE the send is attempted, and the browser is told the
 * request succeeded as soon as that write does. If mail ever silently stops
 * working, every lead is still sitting in the file, in order, with timestamps.
 *
 * NO USER INPUT EVER REACHES A HEADER. Every value that goes into a header
 * (Reply-To in particular) has CR and LF stripped first. Without that, a
 * newline inside the email field lets a submitter append headers of their own
 * and turn this endpoint into an open relay — the single classic bug in every
 * PHP contact form ever written.
 *
 * The recipients are HARD-CODED. Nothing the caller sends can redirect where
 * this mail goes.
 */

declare(strict_types=1);

const RECIPIENTS = ['info@leadsengine.ch', 'info@future-media.ch'];
const FROM       = 'Leads Engine <info@leadsengine.ch>';
const ORIGIN     = 'https://leadsengine.ch';

/* Outside the web root, next to the PostHog config — no URL can reach it. */
$STORE = dirname(__DIR__, 3) . '/private/leads';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function fail(int $status, string $message): never {
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

/** Anything destined for a mail header. Strips the injection vector. */
function header_safe(string $v): string {
    return trim(str_replace(["\r", "\n", "\0"], '', $v));
}

/** Collapse to a single line and cap, so one field cannot flood the store. */
function clean(mixed $v, int $max = 300): string {
    if (!is_string($v)) return '';
    $v = str_replace(["\r\n", "\r", "\n"], ' ', $v);
    $v = preg_replace('/\s+/u', ' ', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'POST only');
}

/* Same-origin only. Not a security boundary on its own — a header is trivial
   to forge — but it turns away the drive-by scripts that POST to every
   *.php they find, before any work is done. */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && stripos($origin, ORIGIN) !== 0) {
    fail(403, 'Bad origin');
}

$body = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($body)) {
    fail(400, 'Expected JSON');
}

/* The honeypot. A field no human can see, let alone fill in. Answer 200 so
   the bot believes it succeeded and does not retry with a variation. */
if (clean($body['company_website_url'] ?? '') !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$name    = clean($body['name'] ?? '', 120);
$email   = clean($body['email'] ?? '', 160);
$phone   = clean($body['phone'] ?? '', 60);
$role    = clean($body['role'] ?? '', 120);
$website = clean($body['website'] ?? '', 200);
$consent = !empty($body['consent']);
$lang    = clean($body['lang'] ?? '', 8);

/* Validated again here, not only in the browser. Client-side validation is a
   convenience for the visitor; it is not a check, because nothing stops a
   caller posting straight to this URL. */
$missing = [];
foreach (['name' => $name, 'email' => $email, 'phone' => $phone, 'role' => $role, 'website' => $website] as $k => $v) {
    if ($v === '') $missing[] = $k;
}
if ($missing)                                    fail(422, 'Missing: ' . implode(', ', $missing));
if (!filter_var($email, FILTER_VALIDATE_EMAIL))  fail(422, 'Invalid email');
if (!$consent)                                   fail(422, 'Consent required');

/* Coarse per-IP rate limit. Not a defence against a determined attacker, just
   a ceiling so a loop cannot fill the mailbox or the disk in a minute. */
$ip  = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
$rl  = sys_get_temp_dir() . '/le-lead-' . sha1($ip);
$now = time();
$hits = is_readable($rl) ? array_filter(array_map('intval', explode(',', (string) file_get_contents($rl))), fn($t) => $t > $now - 3600) : [];
if (count($hits) >= 5) {
    fail(429, 'Too many requests');
}
$hits[] = $now;
@file_put_contents($rl, implode(',', $hits), LOCK_EX);

/* ---------------------------------------------------------------- store */
$record = [
    'at'      => gmdate('c'),
    'name'    => $name,
    'email'   => $email,
    'phone'   => $phone,
    'role'    => $role,
    'website' => $website,
    'lang'    => $lang,
    'ip'      => $ip,
    'ua'      => clean($_SERVER['HTTP_USER_AGENT'] ?? '', 200),
];

$stored = false;
if (!is_dir($STORE)) {
    @mkdir($STORE, 0700, true);
}
if (is_dir($STORE) && is_writable($STORE)) {
    $line = json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
    $stored = @file_put_contents($STORE . '/leads.jsonl', $line, FILE_APPEND | LOCK_EX) !== false;
}
if (!$stored) {
    error_log('lead.php: could not write the lead store at ' . $STORE);
}

/* ----------------------------------------------------------------- mail */
$subject = 'Neue KI-Analyse-Anfrage: ' . $name;
$lines = [
    'Neue Anfrage über leadsengine.ch/analyse/',
    '',
    'Name:     ' . $name,
    'E-Mail:   ' . $email,
    'Telefon:  ' . $phone,
    'Rolle:    ' . $role,
    'Website:  ' . $website,
    '',
    'Sprache:  ' . ($lang ?: 'de'),
    'Zeit:     ' . gmdate('Y-m-d H:i:s') . ' UTC',
    'Einwilligung Datenschutz: ja',
];
$message = implode("\r\n", $lines) . "\r\n";

$headers = implode("\r\n", [
    'From: ' . FROM,
    /* Replying to the notification reaches the person who asked. */
    'Reply-To: ' . header_safe($name) . ' <' . header_safe($email) . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'MIME-Version: 1.0',
    'X-Mailer: leadsengine-lead-form',
]);

$sent = 0;
foreach (RECIPIENTS as $to) {
    /* `-f` sets the envelope sender, which is what a receiving server checks
       for SPF — leaving it to the server default is the usual reason these
       land in spam. */
    if (@mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $message, $headers, '-finfo@leadsengine.ch')) {
        $sent++;
    } else {
        error_log('lead.php: mail() failed for ' . $to);
    }
}

/* THE STORE IS THE SOURCE OF TRUTH, so a mail failure is not a failure for
   the visitor — the lead is safe and we can see it. Reporting an error here
   would make them submit again and produce a duplicate. It is logged instead. */
if ($stored || $sent > 0) {
    echo json_encode(['ok' => true]);
    exit;
}

error_log('lead.php: BOTH the store and every mail attempt failed');
fail(500, 'Could not record the request');
