<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Resource records live in the `resources` table; files live in the private `resources` storage bucket. Files are reached only through short-lived signed links, because public buckets are blocked on this workspace.
- All writes (upload, edit, delete) go through server functions in `src/lib/resources.functions.ts`, which require a signed, expiring server-issued admin session before using the service role. The browser database role has public read access only; keep direct writes denied by RLS.
- Shared option lists (years, batches, subjects, teachers, types) live in `src/lib/constants.ts`.
- The browser session may store only the signed admin session token, never the admin PIN; admin credentials and signing keys are runtime secrets checked server-side.
- Portal-only content reuses `resources` rows with reserved types, avoiding schema changes while preserving the existing secured write path.
