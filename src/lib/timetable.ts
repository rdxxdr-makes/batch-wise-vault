// Reserved resource types reuse the existing resources table without schema changes.
export const TIMETABLE_TYPE = "__TIMETABLE__"; // legacy class entries (hidden)
export const TIMETABLE_IMAGE_TYPE = "__TIMETABLE_IMAGE__";
export const EXAM_TIMETABLE_TYPE = "__EXAM_TIMETABLE__";
export const ANNOUNCEMENT_TYPE = "__ANNOUNCEMENT__";
export const MAX_ANNOUNCEMENTS = 10;

export function isSpecialType(type: string) {
  return type.startsWith("__");
}

export function placeholderAttachment(name: string) {
  const content = "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
  return new File([content], `${name}.pdf`, { type: "application/pdf" });
}

export function specialFields(type: string, title: string, description: string) {
  return {
    title,
    year: "All",
    batch: "All",
    subject: "General",
    teacher: "",
    type,
    description,
    contributor: "",
    captured_by: "",
  };
}
