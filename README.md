# Polaris

An outreach CRM for tracking local prospects from first research through to a completed sale. Prospects are stored in Supabase, and each one moves through six pipeline stages.

## Stack

- React 19, Vite 8, TypeScript 5.7
- Tailwind CSS v4
- Supabase (Postgres, Google sign-in, row-level security)

## Setup

1. Install dependencies with pnpm (the version is pinned in `.mise.toml`):
   ```
   pnpm install
   ```
2. Create `.env.local` in the project root:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
   The app throws on startup if either value is missing. Keep this file out of git.
3. Set up Google sign-in in Supabase by following [OAUTH_SETUP.md](OAUTH_SETUP.md).
4. Create the tables by running [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor.
5. Start the dev server:
   ```
   pnpm dev
   ```
   It runs on port 8443 by default, or on `$PORT` if set.

## Loading the starter list

The seed data (57 Isleworth prospects and the guide text) is loaded once, into empty tables:

1. Sign in to the app.
2. Open the browser console and run `await exportSeedData()`.

It refuses to run if either table already has rows, so it cannot duplicate data.

## Scripts

| Command        | What it does                          |
| -------------- | ------------------------------------- |
| `pnpm dev`     | Start the Vite dev server             |
| `pnpm build`   | Bundle the app to `dist/`             |
| `pnpm preview` | Serve the production build locally    |
| `pnpm format`  | Format the code with oxfmt            |

## Project layout

- `src/App.tsx` - the main UI: Home, Call list, Pipeline, Read me, and the client and guide editors
- `src/Login.tsx` - the Google sign-in screen
- `src/data.ts` - all Supabase reads and writes, and the mapping between database columns and the app's `Client` type
- `src/exportSeed.ts` - the one-time seed loader
- `src/seedData.ts` - the seed prospects and guide text
- `supabase/schema.sql` - the database schema and row-level security policies
