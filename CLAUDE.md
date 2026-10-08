# Athlytics

Platform for managing athletic programs and performance data. Repo `TucsenRoman/athlyticsWebApp`. Goal: one monorepo with a web app, a native app and desktop software.

- `apps/web`: the product. Vite + React + TypeScript, shadcn/ui (Radix), Tailwind, Supabase (`apps/web/supabase/`). Env vars in `apps/web/.env` (gitignored). Deployed by the Vercel project `athlytics` to **athlyticshq.com** (live).
- `apps/landing`: marketing landing page, Next.js. Not deployed yet.
- `apps/native`, `apps/desktop`: planned, not started.

No npm workspaces yet: install and run inside each app folder.

## Branches and deploys

- `main` is production on Vercel; `dev` gets preview deploys.
- The monorepo layout lives on the `monorepo` branch until the Vercel switch-over in [TODO.md](TODO.md). Until then, don't merge it into `main` or `dev`: Vercel still builds from the repo root and those builds would fail.

## Commands

```bash
cd apps/web && npm run dev        # web app (Vite)
cd apps/web && npm run build      # production build
cd apps/web && npm run lint
cd apps/landing && npm run dev    # landing page (Next.js)
```

## Verifying a change

Run the app's dev server and check the screen in the browser preview. For the web app, also run `npm run build` before merging, since that's what Vercel runs.
