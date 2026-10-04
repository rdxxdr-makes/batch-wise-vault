import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useResources } from "@/lib/useResources";
import { ResourceCard } from "@/components/ResourceCard";
import { ALL_SUBJECTS, BATCHES, TYPES, YEARS, belongsToBatch, parseBatches, subjectsFor } from "@/lib/constants";
import { clearSession } from "@/lib/session";
import { ANNOUNCEMENT_TYPE, isSpecialType, MAX_ANNOUNCEMENTS, TIMETABLE_IMAGE_TYPE } from "@/lib/timetable";
import { EmptyState, TimetableImage } from "@/components/Board";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — College Resource Portal" },
      {
        name: "description",
        content: "Browse and download notes, homework, PPTs and class overviews by year and batch.",
      },
      { property: "og:title", content: "Resources — College Resource Portal" },
      {
        property: "og:description",
        content: "Search and filter class resources by year, batch, subject and type.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

const selectCls =
  "rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function ResourcesPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useResources();
  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const [batch, setBatch] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");

  const batchOptions = year ? (BATCHES[year] ?? []) : Array.from(new Set(Object.values(BATCHES).flat()));
  const subjectOptions = year && batch ? subjectsFor(year, batch) : ALL_SUBJECTS;

  const resources = useMemo(() => (data ?? []).filter((r) => !isSpecialType(r.type)), [data]);
  const timetable = (data ?? []).find((r) => r.type === TIMETABLE_IMAGE_TYPE);
  const announcements = (data ?? []).filter((r) => r.type === ANNOUNCEMENT_TYPE).slice(0, MAX_ANNOUNCEMENTS);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return resources.filter(
      (r) =>
        (!year || r.year === year) &&
        belongsToBatch(r.batch, batch) &&
        (!subject || r.subject === subject) &&
        (!type || r.type === type) &&
        (!term ||
          [r.title, r.subject, r.teacher, r.contributor, r.description]
            .some((value) => typeof value === "string" && value.toLowerCase().includes(term))),
    );
  }, [resources, q, year, batch, subject, type]);

  return (
    <main className="min-h-screen bg-background">
      <header className="page-header shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <h1 className="text-lg font-bold tracking-tight">Resources</h1>
          <button
            onClick={() => {
              clearSession();
              navigate({ to: "/" });
            }}
            className="btn-ondark rounded-lg px-3 py-1.5 text-sm font-semibold"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <section aria-labelledby="today-heading" className="lg:col-span-2">
            <h2 id="today-heading" className="section-title mb-3 text-lg font-semibold text-foreground">Today’s Timetable</h2>
            {timetable ? <TimetableImage resource={timetable} /> : <EmptyState>No timetable added for today.</EmptyState>}
          </section>
          <section aria-labelledby="ann-heading">
            <h2 id="ann-heading" className="section-title mb-3 text-lg font-semibold text-foreground">Announcements</h2>
            {announcements.length === 0 ? (
              <EmptyState>No announcements yet.</EmptyState>
            ) : (
              <ul className="space-y-3">
                {announcements.map((a) => (
                  <li key={a.id} className="rounded-xl border-l-4 border-accent bg-card p-4 text-sm shadow-sm whitespace-pre-wrap">
                    {a.description}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section aria-labelledby="resources-heading" className="mt-8 border-t border-border pt-7">
          <h2 id="resources-heading" className="section-title mb-4 text-lg font-semibold text-foreground">Study resources</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, subject, teacher or contributor"
          className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <select
            className={selectCls}
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setBatch("");
              setSubject("");
            }}
          >
            <option value="">All years</option>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
          <select
            className={selectCls}
            value={batch}
            onChange={(e) => {
              setBatch(e.target.value);
              setSubject("");
            }}
          >
            <option value="">All batches</option>
            {batchOptions.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select className={selectCls} value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">All subjects</option>
            {subjectOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading resources…</p>}
        {error && <p className="mt-8 text-sm text-destructive">Could not load resources.</p>}
        {!isLoading && list.length === 0 && (
          <div className="empty-state mt-6 rounded-xl px-4 py-10 text-center text-sm">
            No resources match your search and filters.
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
        </section>
      </div>
    </main>
  );
}
