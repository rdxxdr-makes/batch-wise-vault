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
- All writes (upload, edit, delete) go through server functions in `src/lib/resources.functions.ts`, which check the admin PIN server-side. The database only allows public reading, so the browser can never write directly.
- Shared option lists (years, batches, subjects, teachers, types) live in `src/lib/constants.ts`.
- Shared page credits render through one footer component so wording stays consistent across screens.
- The signed-in role and PIN are kept in the browser session via `src/lib/session.ts`.
