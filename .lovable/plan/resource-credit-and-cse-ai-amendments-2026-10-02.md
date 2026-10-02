# Resource credit and CSE(AI) amendments

## Changes
- Add a nullable “Notes captured by” value to each resource while keeping existing records valid.
- Rename the existing contributor label to “Notes provided by” in the admin form and resource cards.
- Add both credit values to resource loading, upload/edit saving, search, and cards.
- Replace the 1st Year CSE(AI) subjects and teachers with the supplied mapping; keep its existing batch option and dependent dropdown behavior.
- Add the supplied app manager and builder credits in a simple shared footer without changing page styling or behavior.

## Technical details
- Apply one additive database migration for the new nullable field; no storage, access policy, PIN, deployment, or upload-flow changes.
- Update the existing typed resource model and server function payload to carry the new value.
- Verify the app build and check the affected screens at desktop and mobile widths.
