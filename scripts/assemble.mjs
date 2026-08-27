// Assemble the deployable bundle: the dashboard build is mounted under the
// marketing site's build output at /dashboard/ (matches the dashboard's Vite
// `base` and the Disallow rule in frontend/public/robots.txt).
import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const frontendBuild = `${root}frontend/build`;
const dashboardDist = `${root}dashboard/dist`;
const target = `${frontendBuild}/dashboard`;

if (!existsSync(frontendBuild)) {
  console.error('frontend/build not found — run `npm run build:frontend` first.');
  process.exit(1);
}
if (!existsSync(dashboardDist)) {
  console.error('dashboard/dist not found — run `npm run build:dashboard` first.');
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
cpSync(dashboardDist, target, { recursive: true });
console.log(`Assembled: dashboard/dist → frontend/build/dashboard`);
console.log('Deploy the frontend/build directory to the static host.');
