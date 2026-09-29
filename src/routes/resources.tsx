import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useResources } from "@/lib/useResources";
import { ResourceCard } from "@/components/ResourceCard";
import { ALL_SUBJECTS, BATCHES, TYPES, YEARS, subjectsFor } from "@/lib/constants";
import { clearSession } from "@/lib/session";

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

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (r) =>
        (!year || r.year === year) &&
        (!batch || r.batch === batch) &&
        (!subject || r.subject === subject) &&
        (!type || r.type === type) &&
        (!term ||
          [r.title, r.subject, r.teacher, r.contributor, r.description]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(term))),
    );
  }, [data, q, year, batch, subject, type]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-lg font-semibold">Resources</h1>
          <button
            onClick={() => {
              clearSession();
              navigate({ to: "/" });
            }}
            className="rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-secondary"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
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
            }}
          >
            <option value="">All years</option>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
          <select className={selectCls} value={batch} onChange={(e) => setBatch(e.target.value)}>
            <option value="">All batches</option>
            {batchOptions.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select className={selectCls} value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => (
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
          <p className="mt-8 text-sm text-muted-foreground">No resources found.</p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </div>
    </main>
  );
}
