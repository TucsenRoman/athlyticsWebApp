# Athlytics to-do

Temporary list. Once tasks have a more stable home (a Notion database, for example), move the open items there, point `CLAUDE.md` at it, and delete this file.

## Monorepo switch-over (do these together)
- [ ] Set the Vercel project `athlytics` Root Directory to `apps/web`.
- [ ] Merge `monorepo` into `dev`, check the preview deploy, then merge `dev` into `main`.
- [ ] Optionally rename the GitHub repo `athlyticsWebApp` to `athlytics` (GitHub redirects the old URL; re-check the Vercel Git connection afterwards).

## Next
- [ ] Decide whether the landing page (`apps/landing`) replaces the web app at athlyticshq.com or gets its own domain/subdomain, then add a Vercel project for it.
- [ ] Start `apps/native` (likely Expo) and `apps/desktop`.
- [ ] Consider npm workspaces and a shared package for types, Supabase client and design tokens once there's more than one app sharing code.
