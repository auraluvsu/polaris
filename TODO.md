# TODO

## Security

- [ ] RLS policies in `supabase/schema.sql` let any authenticated user read and write every client and readme item. Restrict to an allowlisted owner, and check that Google sign-ups are restricted in Supabase
- [ ] `.env.local` (Supabase URL and anon key) is tracked in git (added in `20b6ea3`, kept in `f4bdd4d`). Run `git rm --cached`, add it to `.gitignore`, and rotate the key if the repo has been shared
- [ ] Deleting a client (CallList trash button, ClientModal "Delete client") and deleting a comment have no confirmation step

## Bugs

- [ ] `Login.tsx`: `signInWithOAuth` returns `{ error }` and does not throw, so the `catch` never runs. Sign-in errors are never shown, and the spinner stays on if the call fails
- [ ] `vite.config.ts:6` imports `./.figma/make/site.json`, which was deleted in `de32de8`. `pnpm build` and `tsc --noEmit` both fail on it
- [ ] `ClientModal` saves the whole row from a snapshot taken when it opened, including pipeline and `running_comments`. Saving can revert stage changes or comments made in another tab or since the modal opened. Save only the editable columns
- [ ] Lost updates: `updateStage`, `addComment` and `deleteComment` compute the new value from local state and write it back (all six stage columns, or the whole `running_comments` array). Two quick changes before `refreshData` finishes can drop one. Comments are also deleted by array index, so a stale list deletes the wrong entry. Give comments ids and update per field in the database
- [ ] `fetchClients` has no range or limit. PostgREST returns at most 1000 rows by default, and the list would be cut off silently past that
- [ ] `supabaseClient.ts` throws at import when the env vars are missing, so the app shows a blank page instead of a message
- [ ] Stage order is enforced only in the UI (Pipeline locked select, `updateStage` reset). The database accepts any combination of stage states, so enforce it in the database or add a check
- [ ] `index.html` has `<!-- figma:* -->` placeholders and `lang="<!-- figma:lang -->"`, which only the removed Figma plugin filled in. Without the plugin, `<html lang>` is invalid and the `<title>` is empty until React sets it

## Data consistency across screens

- [ ] "Calls made" differs between screens. Home (`App.tsx` ~529) counts `called === "yes"` OR `pipeline.coldCall` done. CallList (`App.tsx` ~680) counts only `called === "yes"`. Pick one definition
- [ ] "Sold" differs between screens. Home (`App.tsx` ~533) counts `pipeline.sold` done OR outcome "Sold". Pipeline (`App.tsx` ~969) and its "Clients sold" card count only `pipeline.sold`. "Total money made" and CallList "Revenue" are the same sum, shown twice
- [ ] `CellStatus` (`App.tsx` ~829) picks the colour with regexes (`/yes|checked|done|no site/`, `/wrong|no$/`). "No answer" is neutral and "No" is negative. Map the known `called` and `outcome` values explicitly

## UX

- [ ] Escape does not close the modals, and there is no focus trap. CallList rows are `<tr onClick>` and cannot be reached by keyboard. The CallList Edit button has no `onClick` and relies on the row click bubbling up
- [ ] Every write re-fetches all clients and readme items (`runWrite` calls `refreshData`). Fine for 57 rows; update local state directly if the list grows

## Dead code

- [ ] Remove the Figma Make scaffolding from `vite.config.ts` (`figmaSiteConfiguration`, `figmaErrorOverlayReplay`, `figmaReactRefreshBoundaryFallback`, `figmaMakeKitPlugin`, the `FIGMA_PUBLIC_URL` base, and the `.figma` watch ignore). They are inert or broken now
- [ ] `dist/index.html`, `dist/favicon.svg` and `dist/robots.txt` are tracked even though `dist/` is in `.gitignore`. `dist/index.html` is a stale build titled "Figma Make App". Untrack `dist/` and delete the copies
- [ ] Two lockfiles are tracked, `package-lock.json` and `pnpm-lock.yaml`, and `.mise.toml` pins pnpm. Keep `pnpm-lock.yaml` and delete `package-lock.json`
- [ ] Two formatter configs, `.prettierrc` and `.prettierignore`, sit alongside oxfmt (the `format` script). Keep one
- [ ] `.gitattributes` is the generic Git LFS template. Nothing in the repo is tracked with LFS, so remove it unless LFS is wanted

## Inconsistencies

- [ ] `package.json` name and `CLAUDE.md` still say "figma-make-app", and `CLAUDE.md` says the app runs inside Figma Make. Rename and update
- [ ] `README.md` still documents `OAUTH_SETUP.md` (deleted in `cc6c4c7`), the `exportSeedData` console step, and `src/exportSeed.ts` and `src/seedData.ts` (deleted in `d3f147f`). Remove those steps and layout entries
- [ ] `supabase/schema.sql` header still says "before exporting the seed data". The clients primary key is named `calls_pkey`, a leftover from an earlier table name. `running_comments` is defined twice (in `create table` and in a later `alter`)
- [ ] Formatting differs between files. `App.tsx`, `Login.tsx` and `main.tsx` use 4 spaces and double quotes. `supabaseClient.ts` uses single quotes with no semicolons. `index.css` and `vite.config.ts` use 2 spaces and single quotes. `App.tsx:456` is missing a space (`&&<Home`). Run `pnpm format` once the config is settled
- [ ] `CLAUDE.md` says components are default exports, but App.tsx's sub-components are not exported and `data.ts` uses named exports. Decide which rule applies and update `CLAUDE.md`
- [ ] "Isleworth" is hard-coded in the topbar, the Read me copy and the Call list copy. Move it to one constant if the app is reused for another area

## Types

- [ ] The database columns `called`, `outcome` and `priority` are free text, and the app's string types match. `fromRow` casts stage values with `as StageState` without checking them. Use a check constraint in the schema and a shared union type

## Hosting and tooling

- [ ] No deployment config, CI or hosting notes are tracked (no `vercel.json`, no workflow files). Document where the app is hosted, the env vars to set there, and the Supabase OAuth redirect URLs that must allow that origin (`Login.tsx` sends `window.location.origin`)
- [ ] `package.json` has no typecheck or test script, and the build is currently broken (see the `vite.config.ts` item). Add a typecheck script (`tsc --noEmit`) and a build check
