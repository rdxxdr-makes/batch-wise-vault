import type { Resource } from "./useResources";

export const TIMETABLE_TYPE = "__TIMETABLE__";

export type TimetableDetails = {
  date: string;
  startTime: string;
  endTime: string;
};

const PREFIX = "TIMETABLE:";

export function todayValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function encodeTimetable(details: TimetableDetails) {
  return `${PREFIX}${JSON.stringify(details)}`;
}

export function decodeTimetable(resource: Resource): TimetableDetails | null {
  if (resource.type !== TIMETABLE_TYPE || !resource.description?.startsWith(PREFIX)) return null;

  try {
    const details = JSON.parse(resource.description.slice(PREFIX.length)) as Partial<TimetableDetails>;
    if (!details.date || !details.startTime || !details.endTime) return null;
    return { date: details.date, startTime: details.startTime, endTime: details.endTime };
  } catch {
    return null;
  }
}

export function timetableAttachment(date: string) {
  const content = "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
  return new File([content], `timetable-${date}.pdf`, { type: "application/pdf" });
}