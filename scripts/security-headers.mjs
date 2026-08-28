/**
 * Emit security headers for the built site.
 *
 * WHY THIS IS GENERATED, NOT HAND-WRITTEN. The Content-Security-Policy has to
 * allow every inline <script> the built site actually contains — the JSON-LD
 * and PostHog loader on the main page, and now the mailto contact-form
 * handler that `site-shell.mjs` embeds on every legal and About page — and
 * the honest way to do that is a SHA-256 hash of each, not 'unsafe-inline'.
 *
 * EVERY GENERATED index.html IS SCANNED, not just the main one. The `_headers`
 * rule below is a single global policy (`/*`, matching every path), so a hash
 * missing from even one page is not a smaller problem on that page — it is
 * that page's inline script silently failing everywhere the policy applies,
 * which is exactly the bug this file is written to make impossible: this
 * script previously hashed only `frontend/build/index.html`, and the moment
 * the legal/About pages started carrying their own inline contact-form
 * script, every one of those forms would have been silently blocked under the
 * very policy meant to protect the site. Hashes are de-duplicated — the
 * form's script is byte-identical on every one of those pages, so it costs
 * one hash, not one per page.
 *
 * WHAT THE POLICY ALLOWS, and why each entry is there:
 *   script  self + the two hashes + eu-assets.i.posthog.com, which is where
 *           the PostHog loader fetches its real bundle from
 *   connect self + both PostHog origins (event ingestion)
 *   style   self + 'unsafe-inline' + fonts.googleapis.com. The inline part is
 *           unavoidable: the app sets element style attributes throughout
 *           (the engine, the reveals, the marquee), and CSP has no hash
 *           mechanism for style ATTRIBUTES. It is also the least dangerous of
 *           the inline allowances — a style attribute cannot execute.
 *   font    self + fonts.gstatic.com (Inter)
 *   img     self + data: + blob:, no third-party image hosts at all
 *   frame-ancestors 'none' — the site is never framed, which is what actually
 *           stops clickjacking; X-Frame-Options is kept alongside it only for
 *           browsers that predate CSP level 2.
 *   object-src 'none', base-uri 'self' — close off plugin embedding and base
 *           tag injection, both cheap and both real.
 *
 * FORMAT is Netlify / Cloudflare Pages `_headers`. A ready-to-paste nginx and
 * Apache version is written beside it, because the host is not decided yet and
 * a policy nobody can apply is worth nothing.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BUILD = join(process.cwd(), "frontend", "build");
const MAIN_HTML = join(BUILD, "index.html");

if (!existsSync(MAIN_HTML)) {
  console.error("security-headers: frontend/build/index.html not found — run the build first.");
  process.exit(1);
}

/** Every `index.html` under the build output, main page included. */
function findHtmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...findHtmlFiles(full));
    else if (entry === "index.html") out.push(full);
  }
  return out;
}

/* Every inline <script> body, on every generated page, hashed and
   de-duplicated. `type="application/ld+json"` is included deliberately:
   several browsers apply script-src to it regardless of type, and a hash
   costs nothing. */
const hashSet = new Set();
const re = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
for (const file of findHtmlFiles(BUILD)) {
  const html = readFileSync(file, "utf8");
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(html)) !== null) {
    /* NEWLINES MUST BE NORMALISED FIRST.
       These files are stored with CRLF. The HTML parser converts every CR LF
       (and every lone CR) to a single LF while preprocessing the input
       stream, so the text the browser hashes contains LF only. Hashing the
       raw bytes instead produces a digest that is self-consistent — the
       generator and any checker reading the same file agree with each other
       — but that the browser never matches, so the inline script is silently
       blocked. That is exactly how the analytics snippet once went missing
       with no visible error and a CSP that looked correct. */
    const body = m[1].replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const digest = createHash("sha256").update(body, "utf8").digest("base64");
    hashSet.add(`'sha256-${digest}'`);
  }
}
const hashes = [...hashSet];

const POSTHOG_API = "https://eu.i.posthog.com";
const POSTHOG_ASSETS = "https://eu-assets.i.posthog.com";

const csp = [
  "default-src 'self'",
  `script-src 'self' ${POSTHOG_ASSETS} ${hashes.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  `connect-src 'self' ${POSTHOG_API} ${POSTHOG_ASSETS}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "form-action 'self' mailto:",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const COMMON = {
  "Content-Security-Policy": csp,
  /* Two years, subdomains included, preload-eligible. Only meaningful once
     the site is actually served over HTTPS on its own domain. */
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  /* Nothing here needs a camera, a microphone, a location or a payment
     handler, so every one of them is switched off rather than left at the
     browser default. */
  "Permissions-Policy":
    "accelerometer=(), autoplay=(self), camera=(), display-capture=(), " +
    "encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), " +
    "magnetometer=(), microphone=(), midi=(), payment=(), usb=(), " +
    "xr-spatial-tracking=(), interest-cohort=()",
};

const headerLines = Object.entries(COMMON)
  .map(([k, v]) => `  ${k}: ${v}`)
  .join("\n");

const netlify = `# GENERATED by scripts/security-headers.mjs — do not hand-edit.
# The CSP script hashes are computed from the built index.html, so editing an
# inline script and rebuilding keeps them correct automatically.

/*
${headerLines}

# Vite fingerprints these filenames, so they can be cached hard and forever.
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# NO HTML MAY BE CACHED HARD, or a deploy does not reach anyone who has
# already visited. Every route that serves an index.html is listed — the
# subpages included. They were missing while only "/" and "/index.html" were
# here, so a returning visitor could have been served a stale About or legal
# page from disk cache indefinitely.
/
  Cache-Control: public, max-age=0, must-revalidate
/index.html
  Cache-Control: public, max-age=0, must-revalidate
/ueber-uns/*
  Cache-Control: public, max-age=0, must-revalidate
/impressum/*
  Cache-Control: public, max-age=0, must-revalidate
/datenschutz/*
  Cache-Control: public, max-age=0, must-revalidate
/agb/*
  Cache-Control: public, max-age=0, must-revalidate

# The dashboard is an internal surface. robots.txt already disallows it, but
# robots.txt is a request, not an instruction: it stops a well-behaved crawler
# from FETCHING the page, and does nothing about a URL discovered elsewhere.
# X-Robots-Tag is the enforceable half and keeps it out of an index even if it
# is linked from somewhere we do not control.
/dashboard/*
  X-Robots-Tag: noindex, nofollow, noarchive
  Cache-Control: public, max-age=0, must-revalidate
`;

writeFileSync(join(BUILD, "_headers"), netlify, "utf8");

const nginx = `# GENERATED by scripts/security-headers.mjs — for an nginx host.
# Paste inside the server block that serves frontend/build.
${Object.entries(COMMON)
  .map(([k, v]) => `add_header ${k} "${v.replace(/"/g, '\\"')}" always;`)
  .join("\n")}

location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable" always; }

# Every HTML response revalidates — see the note in the Netlify variant.
location ~* \\.html$ { add_header Cache-Control "public, max-age=0, must-revalidate" always; }
location = / { add_header Cache-Control "public, max-age=0, must-revalidate" always; }
location ~ ^/(ueber-uns|impressum|datenschutz|agb)/ {
  add_header Cache-Control "public, max-age=0, must-revalidate" always;
}

location /dashboard/ {
  add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
  add_header Cache-Control "public, max-age=0, must-revalidate" always;
}
`;
writeFileSync(join(BUILD, "security-headers.nginx.conf"), nginx, "utf8");

/* ---------------------------------------------------------------------
   APACHE / .htaccess — the one that actually ships to Hostpoint.

   `_headers` is Netlify/Cloudflare-Pages syntax and nginx.conf needs server
   config access; on Apache shared hosting neither does anything at all. This
   file IS the deploy target's config, so it is written straight into the
   build output as `.htaccess` and uploaded with everything else.

   `always` has no Apache equivalent — `Header set` applies to successful
   responses, and `Header always set` covers error responses too, which is
   what we want for the security headers so a 404 page is protected as well.
   --------------------------------------------------------------------- */
const apacheHeaders = Object.entries(COMMON)
  .map(([k, v]) => `    Header always set ${k} "${v.replace(/"/g, '\\"')}"`)
  .join("\n");

/* Absolute path to the non-served directory holding the PostHog key and the
   htpasswd file. Overridable so this is not welded to one hosting account. */
const PRIVATE_DIR = process.env.LE_PRIVATE_DIR || "/home/facitova/private";

const apache = `# GENERATED by scripts/security-headers.mjs — do not hand-edit.
# Regenerated on every \`npm run build:all\`; the CSP hashes below are computed
# from the built HTML, so editing an inline script keeps them correct.
#
# Upload this file to the SAME directory as index.html (the web root).

# ---------------------------------------------------------------- headers
<IfModule mod_headers.c>
${apacheHeaders}

    # Hashed filenames — safe to cache forever.
    <FilesMatch "\\.(js|css|woff2|jpg|jpeg|png|svg|webp|avif|mp4)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>

    # HTML must always revalidate or a deploy never reaches a returning
    # visitor. This must come AFTER the block above so it wins for .html.
    <FilesMatch "\\.html$">
        Header set Cache-Control "public, max-age=0, must-revalidate"
    </FilesMatch>
</IfModule>

# The dashboard is an internal surface: keep it out of every index even if a
# URL to it leaks. robots.txt only asks; this enforces.
<IfModule mod_headers.c>
    <If "%{REQUEST_URI} =~ m#^/dashboard/#">
        Header always set X-Robots-Tag "noindex, nofollow, noarchive"
        Header set Cache-Control "public, max-age=0, must-revalidate"
    </If>
</IfModule>

# ------------------------------------------------------- private surfaces
# /api/posthog.php can run HogQL against the whole PostHog project, so it is
# password-protected. Without this it would be an open query endpoint for
# anyone on the internet — strictly worse than the leaked API key it exists
# to prevent. The dashboard itself is protected by its own .htaccess.
#
# AuthUserFile must be an ABSOLUTE path (Apache does not expand shell
# variables), and it points OUTSIDE the web root so it can never be served.
<Files "posthog.php">
    AuthType Basic
    AuthName "Leads Engine"
    AuthUserFile "${PRIVATE_DIR}/.htpasswd"
    Require valid-user
</Files>

# ------------------------------------------------------------ compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml
    AddOutputFilterByType DEFLATE application/javascript application/json
    AddOutputFilterByType DEFLATE application/xml image/svg+xml
</IfModule>

# ----------------------------------------------------------------- types
# Shared hosting often lacks a mapping for these, and a wrong Content-Type
# makes a browser refuse the file outright.
<IfModule mod_mime.c>
    AddType application/manifest+json .webmanifest
    AddType image/svg+xml .svg
    AddType video/mp4 .mp4
    AddType text/vtt .vtt
    AddType font/woff2 .woff2
</IfModule>

# -------------------------------------------------------------- rewrites
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Force HTTPS. HSTS above is meaningless without it, and Hostpoint serves
    # both schemes by default.
    RewriteCond %{HTTPS} !=on
    RewriteCond %{HTTP:X-Forwarded-Proto} !https
    RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

    # ONE HOSTNAME. www.leadsengine.ch was serving the entire site at 200 —
    # byte-identical to the apex, verified by hashing both responses. That is
    # the same content on two hostnames: every page competing with itself for
    # ranking, link equity split across two origins, and analytics counting
    # one visitor as two. The canonical tag pointed at the apex, which limits
    # the damage, but a canonical is a hint and a 301 is an instruction.
    #
    # It also matters for the HSTS preload above: that header carries
    # includeSubDomains, so the www host is already bound by it and ought
    # to resolve to the same place rather than to a second copy.
    # (No backticks anywhere in this template literal — one would end it.)
    RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
    RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

    # Old language-prefixed URLs. These were real pages for a while, so they
    # may be linked or indexed; language is a query param now.
    RewriteRule ^en/about/?$        /ueber-uns/?lang=en   [R=301,L]
    RewriteRule ^en/imprint/?$      /impressum/?lang=en   [R=301,L]
    RewriteRule ^en/privacy/?$      /datenschutz/?lang=en [R=301,L]
    RewriteRule ^en/terms/?$        /agb/?lang=en         [R=301,L]
    RewriteRule ^en/?$              /?lang=en             [R=301,L]
</IfModule>

# ------------------------------------------------------------- compression
# JAVASCRIPT WAS BEING SERVED UNCOMPRESSED. Measured against the live site:
# HTML came back gzipped, CSS came back gzipped, and the 239KB entry chunk
# came back with no Content-Encoding at all — 244,790 bytes on the wire where
# gzip gives about 78KB. Across the entry chunk, the second bundle and the
# dozen lazy sections that is roughly a quarter of a megabyte of pure waste on
# every first visit, and it is the largest single item on the critical path.
#
# The cause is a MIME-type list, not a missing module: compression is
# obviously enabled (HTML and CSS arrive gzipped), but the host's default
# AddOutputFilterByType list predates text/javascript becoming the standard
# type for scripts. Vite serves exactly that type, so the filter never
# matched. Naming every modern type explicitly fixes it without touching the
# host's own configuration.
#
# Images, video and fonts are deliberately absent: webp, mp4 and woff2 are
# already compressed, and running deflate over them costs CPU to make the
# file marginally bigger.
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE module/javascript
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE application/manifest+json
    AddOutputFilterByType DEFLATE application/ld+json
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE image/x-icon
</IfModule>

# Brotli where the host has it — roughly another 15-20% over gzip on JS, and
# harmless where the module is absent because the whole block is skipped.
<IfModule mod_brotli.c>
    AddOutputFilterByType BROTLI_COMPRESS text/javascript
    AddOutputFilterByType BROTLI_COMPRESS application/javascript
    AddOutputFilterByType BROTLI_COMPRESS text/css
    AddOutputFilterByType BROTLI_COMPRESS text/html
    AddOutputFilterByType BROTLI_COMPRESS application/json
    AddOutputFilterByType BROTLI_COMPRESS image/svg+xml
</IfModule>

# ---------------------------------------------------------------- hygiene
Options -Indexes
ServerSignature Off

<FilesMatch "^\\.">
    Require all denied
</FilesMatch>

# BUILD ARTEFACTS THAT ARE NOT FOR THE PUBLIC. _headers (Netlify/Cloudflare)
# and the nginx conf are written into the build so they can be picked up by
# whichever host is used; on Apache they are dead weight that was being served
# at 200. They publish the whole security configuration in one fetch —
# directive by directive, including which paths are behind auth — which is
# free reconnaissance for anyone looking for a gap. They stay in the build
# because another host may need them; they are simply not readable over HTTP.
<FilesMatch "^(_headers|_redirects)$|\\.(nginx\\.conf|conf|map|log|bak|orig|tmp)$">
    Require all denied
</FilesMatch>
`;
writeFileSync(join(BUILD, ".htaccess"), apache, "utf8");

/* A SECOND .htaccess, inside the dashboard directory.
   Directory-scoped auth cannot be expressed from the root file — .htaccess
   has no <Directory> — so the dashboard gets its own. Written after
   `assemble` has copied the dashboard build in, or it would be overwritten. */
const dashboardDir = join(BUILD, "dashboard");
if (existsSync(dashboardDir)) {
  writeFileSync(
    join(dashboardDir, ".htaccess"),
    `# GENERATED by scripts/security-headers.mjs — do not hand-edit.
# The dashboard exposes business analytics and must not be public. The
# password file lives outside the web root; create it once on the server:
#   mkdir -p ${PRIVATE_DIR} && htpasswd -c ${PRIVATE_DIR}/.htpasswd leadsengine
AuthType Basic
AuthName "Leads Engine Dashboard"
AuthUserFile "${PRIVATE_DIR}/.htpasswd"
Require valid-user

<IfModule mod_headers.c>
    Header always set X-Robots-Tag "noindex, nofollow, noarchive"
</IfModule>
`,
    "utf8",
  );
  console.log(`  -> frontend/build/dashboard/.htaccess          (Basic auth)`);
}

console.log(`Security headers: ${hashes.length} inline script hash(es) pinned`);
console.log(`  -> frontend/build/_headers                    (Netlify / Cloudflare Pages)`);
console.log(`  -> frontend/build/security-headers.nginx.conf (nginx)`);
console.log(`  -> frontend/build/.htaccess                   (Apache / Hostpoint)`);
