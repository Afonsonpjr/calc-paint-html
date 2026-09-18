# Cloudflare Workers deployment

This app is configured as a React SPA plus a Worker API.

## Build settings

The repository supports both Cloudflare root-directory layouts.

### Recommended for the existing `calc-paint-html` service

Keep the Cloudflare **Root directory empty / repository root** and use:

- Node.js: `24`
- Build command: `npm run build`
- Deploy command: `npm run deploy`

The root `package.json` delegates the Vite build to `web/`, and the root `wrangler.jsonc` publishes `web/dist/`.

### Alternative

If Cloudflare is explicitly configured with **Root directory = `web`**:

- Node.js: `24`
- Build command: `npm ci && npm run build`
- Deploy command: `npx wrangler@4.38.0 deploy`

The `web/wrangler.jsonc` publishes `dist/`.

Both configurations serve the React app as static assets, fall back to `index.html` for React Router, and invoke the Worker first only for `/ai/*`.

Do not mix the two layouts (for example, Root directory `web` with the root-level deploy command), because that can deploy the Worker without the expected Vite output and result in an empty/blank application shell.

## Required Worker secrets / variables

Set these in Cloudflare, never in `VITE_*` variables:

- `GEMINI_API_KEY` — secret
- `ALLOWED_HD` — comma-separated Google Workspace domains allowed to use the paid scan reader
- `GEMINI_MODEL` — optional; defaults to `gemini-3.1-flash-lite`

The scan endpoint intentionally fails closed when `GEMINI_API_KEY` exists but `ALLOWED_HD` is empty.

Client-side Google variables such as the Google OAuth client id remain build-time `VITE_*` values as documented by the existing project.

## Production safety

Do not point the production service at this branch until CI passes. Preview the branch first, verify:
- direct navigation to `/projects`
- sign-in and Drive-backed project opening
- `/ai/parse-schedule` returns 501 if no Gemini secret is configured
- unauthorized Google accounts receive 403 when the scan reader is configured
- language choice persists after reload
