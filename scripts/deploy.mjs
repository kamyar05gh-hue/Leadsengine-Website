/**
 * Ship `frontend/build` to Hostpoint, then tell the answer engines it moved.
 *
 *     npm run deploy
 *
 * WHY THIS EXISTS AS A SCRIPT. Two reasons, and the second is the real one.
 *
 * 1. VISIBILITY-WORK-ORDER.md P5.3: "`scripts/indexnow.mjs` already exists.
 *    Wire it into the deploy so Bing and Yandex are pinged on every publish."
 *    A ping that has to be remembered is a ping that gets forgotten, and the
 *    whole diagnosis turned on the index being stale. It runs here, after the
 *    upload, automatically — and only if the upload succeeded, because
 *    announcing a page that did not actually change is worse than silence.
 *
 * 2. THE TARGET DIRECTORY IS DANGEROUS TO TYPE BY HAND. The web root for this
 *    site is `~/www/leadsengine.ch/`. The parent, `~/www/`, is the document
 *    root for EIGHT OTHER LIVE SITES on the same hosting account. A deploy
 *    that lands one level too high overwrites all of them, and `tar -x` gives
 *    no warning and no undo. That path should be written down exactly once,
 *    in a file under review, rather than retyped into a terminal every time.
 *
 * WHAT IT DOES NOT DO: delete. Files are overwritten in place, never removed,
 * which is deliberate — the remote root also holds host-managed files this
 * repo does not produce. A page that has been genuinely retired has to be
 * removed by hand, on purpose.
 *
 * PRECONDITIONS, all checked before a single byte is sent:
 *   · `frontend/build/index.html` exists,
 *   · it is PRERENDERED — `<div id="root">` is not empty. Shipping the
 *     un-prerendered shell is precisely the regression this whole work order
 *     was about, and it looks completely normal in a browser, so a human
 *     spot-check would not catch it. The build is the only place it shows.
 *   · `ssh hostpoint` resolves. The alias lives in `~/.ssh/config`; without
 *     it this would need a hostname and a key path in the repo, which is how
 *     credentials end up in git.
 *
 * Flags:
 *   --dry-run   run every check and print the command, send nothing
 *   --no-ping   upload without the IndexNow submission
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = join(ROOT, "frontend", "build");

/* The one line in this repo that must never gain or lose a path segment.
   `~/www/` alone is eight other live sites. */
const REMOTE = "~/www/leadsengine.ch";
const SSH_ALIAS = "hostpoint";

const argv = new Set(process.argv.slice(2));
const dryRun = argv.has("--dry-run");
const ping = !argv.has("--no-ping");

const die = (msg) => {
  console.error(`deploy: ${msg}`);
  process.exit(1);
};

/* ---- preconditions ---------------------------------------------------- */

const index = join(BUILD, "index.html");
if (!existsSync(index)) die(`no build at ${BUILD}. Run \`npm run build:all\` first.`);

/**
 * What sits inside `<div id="root">`, found by COUNTING `<div>`s rather than
 * matching to the next `</div>`. A regex cannot do this: the prerendered tree
 * is full of nested divs, so a non-greedy match closes on the first inner one
 * and reports an empty root for a build that is perfectly fine. This is the
 * same balanced scan `scripts/prerender.mjs` uses to fill the element.
 */
function rootContent(html) {
  const open = html.match(/<div id="root"[^>]*>/);
  if (!open) return null;
  const start = open.index + open[0].length;
  const tag = /<div\b[^>]*>|<\/div>/g;
  tag.lastIndex = start;
  let depth = 1;
  let m;
  while ((m = tag.exec(html))) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index);
  }
  return null;
}

const html = readFileSync(index, "utf8");
const root = rootContent(html);
if (root === null || root.trim().length < 500) {
  die(
    "frontend/build/index.html is not prerendered — <div id=\"root\"> is " +
    "empty or nearly so. This build would serve crawlers a blank page. " +
    "Run `npm run build:all` (which runs prerender), not `npm run build:frontend`.",
  );
}

try {
  execFileSync("ssh", ["-o", "BatchMode=yes", SSH_ALIAS, "true"], { stdio: "pipe" });
} catch {
  die(
    `\`ssh ${SSH_ALIAS}\` did not connect. Check the Host block in ` +
    "~/.ssh/config and that the key is present.",
  );
}

/* ---- upload ------------------------------------------------------------ */

/* tar over the pipe rather than scp/rsync: it is one round trip, it preserves
   the directory tree exactly, and it needs nothing installed on the far end
   that a shared host does not already have. */
/* No local shell: node runs both ends and joins the pipe itself. Handing the
   pipeline to `/bin/sh` failed on Windows, where there is no /bin/sh for node
   to find. tar and ssh both ship with Windows 10+, macOS and Linux. Forward
   slashes, because both Git Bash's GNU tar and Windows' bsdtar accept C:/...,
   and a backslash means something else to tools from the POSIX side. The
   remote half is one ssh argument, run by the far end's own shell, which is
   what expands the ~. */
const local = BUILD.split("\\").join("/");
const remoteCmd = `mkdir -p ${REMOTE} && tar -xzf - -C ${REMOTE}`;

console.log(`deploy: ${BUILD}\n     -> ${SSH_ALIAS}:${REMOTE}`);

if (dryRun) {
  console.log(
    `\n--dry-run, nothing sent. The upload would be:\n` +
    `  tar -czf - -C "${local}" . | ssh ${SSH_ALIAS} '${remoteCmd}'`,
  );
  process.exit(0);
}

/* Both exit codes count: a tar that dies halfway still leaves ssh to exit 0
   on a truncated archive, and that must not read as a successful deploy. */
const exited = (child) =>
  new Promise((ok) => {
    child.on("error", (e) => ok(`failed to start (${e.message})`));
    child.on("close", (code) => ok(code));
  });
const pack = spawn("tar", ["-czf", "-", "-C", local, "."], { stdio: ["ignore", "pipe", "inherit"] });
const send = spawn("ssh", [SSH_ALIAS, remoteCmd], { stdio: ["pipe", "inherit", "inherit"] });
pack.stdout.pipe(send.stdin);
const [tarCode, sshCode] = await Promise.all([exited(pack), exited(send)]);
if (tarCode !== 0 || sshCode !== 0) {
  die(`upload failed: local tar ${tarCode}, ssh ${sshCode}. Nothing was announced to IndexNow.`);
}
console.log("deploy: uploaded.");

/* ---- tell the engines -------------------------------------------------- */

/* AFTER the upload, and only on success — an IndexNow submission is a claim
   that the URL changed. Making that claim about a deploy that failed teaches
   the crawler to come back and find nothing new. */
if (ping) {
  execFileSync(process.execPath, [join(ROOT, "scripts", "indexnow.mjs")], {
    stdio: "inherit",
  });
}

console.log(
  "\nVerify: node scripts/crawlable-text.mjs   (reads the live site)",
);
