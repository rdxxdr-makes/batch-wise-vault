# Today’s Timetable and Combined Batches

## What will change
- Add a student-only “Today’s Timetable” section above the existing resource search and filters, with a clear empty state.
- Add a compact timetable form and edit/delete controls to the existing admin page.
- Allow admins to select multiple 1st-year batches for resources and timetable entries; display combined batches with ` + `.
- Update student filtering so selecting one batch includes resources shared with that batch.
- Make small spacing, alignment, mobile, and empty-state improvements without changing the visual direction.

## Safe data approach
- Reuse the existing `resources` records and private file storage; no database, column, policy, environment, or storage configuration changes.
- Store timetable entries as a reserved resource type using the existing title, year, batch, subject, teacher, and description fields.
- Create a tiny internal PDF attachment for each timetable entry so the existing upload/save/delete flow remains unchanged.
- Hide timetable records from the normal resource grid and file actions.

## Technical details
- Add batch parsing/joining helpers so old single-batch records remain compatible.
- Store timetable date and class time in the existing description field using an internal marker; only entries matching the device’s local date appear to students.
- Keep existing PIN redirects, resource upload behavior, search, filters, cards, auto-refresh, and mobile layout.
- Verify the relevant screens and current build health after implementation.
