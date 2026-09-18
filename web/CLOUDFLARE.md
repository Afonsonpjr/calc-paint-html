# Cloudflare Workers deployment

This app is configured as a React SPA plus a Worker API.

## Build settings

- Root directory: `web`
- Node.js: `24`
- Build command: `npm ci && npm run build`
- Deploy command: `npx wrangler deploy`

`wrangler.jsonc` serves `dist/` as static assets, falls back to `index.html` for React Router, and invokes the Worker first only for `/ai/*`.

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
