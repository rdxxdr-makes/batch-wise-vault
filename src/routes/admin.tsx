import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResources, type Resource } from "@/lib/useResources";
import { ResourceCard } from "@/components/ResourceCard";
import {
  BATCHES,
  TYPES,
  YEARS,
  joinBatches,
  parseBatches,
  subjectsForBatches,
  teacherForBatches,
} from "@/lib/constants";
import { clearSession, getRole } from "@/lib/session";
import { deleteResource, saveResource } from "@/lib/store";
import { decodeTimetable, encodeTimetable, timetableAttachment, TIMETABLE_TYPE, todayValue } from "@/lib/timetable";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — College Resource Portal" },
      { name: "description", content: "Upload, edit and delete class resources for students." },
      { property: "og:title", content: "Admin — College Resource Portal" },
      { property: "og:description", content: "Manage the notes, homework and PPTs students see." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

const emptyForm = {
  title: "",
  year: YEARS[0] as string,
  batch: "",
  subject: "",
  teacher: "",
  type: TYPES[0] as string,
  description: "",
  contributor: "",
  captured_by: "",
};

const emptyTimetable = {
  date: todayValue(),
  startTime: "09:00",
  endTime: "10:00",
  subject: "",
  teacher: "",
  batches: [] as string[],
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useResources();
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [timetableForm, setTimetableForm] = useState(emptyTimetable);
  const [timetableEditingId, setTimetableEditingId] = useState<string | null>(null);
  const [timetableBusy, setTimetableBusy] = useState(false);
  const [timetableMsg, setTimetableMsg] = useState("");

  useEffect(() => {
    if (getRole() !== "admin") navigate({ to: "/" });
  }, [navigate]);

  function set(k: keyof typeof emptyForm, v: string) {
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === "subject" ? { teacher: teacherForBatches(f.year, parseBatches(f.batch), v) } : {}),
      ...(k === "year" ? { batch: "", subject: "", teacher: "" } : {}),
      ...(k === "batch" ? { subject: "", teacher: "" } : {}),
    }));
  }

  function toggleBatch(batch: string) {
    setForm((current) => {
      const selected = parseBatches(current.batch);
      const next = selected.includes(batch) ? selected.filter((item) => item !== batch) : [...selected, batch];
      return { ...current, batch: joinBatches(current.year, next), subject: "", teacher: "" };
    });
  }

  function toggleTimetableBatch(batch: string) {
    setTimetableForm((current) => ({
      ...current,
      batches: current.batches.includes(batch)
        ? current.batches.filter((item) => item !== batch)
        : [...current.batches, batch],
    }));
  }

  function reset() {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!form.title || !form.batch || !form.subject) {
      setMsg("Title, batch and subject are required.");
      return;
    }
    if (!editingId && !file) {
      setMsg("Please choose a PDF or PPT file.");
      return;
    }
    setBusy(true);
    try {
      await saveResource(editingId, form, file);
      await qc.invalidateQueries({ queryKey: ["resources"] });
      reset();
      setMsg("Saved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function edit(r: Resource) {
    setEditingId(r.id);
    setFile(null);
    setForm({
      title: r.title,
      year: r.year,
      batch: r.batch,
      subject: r.subject,
      teacher: r.teacher ?? "",
      type: r.type,
      description: r.description ?? "",
      contributor: r.contributor ?? "",
      captured_by: r.captured_by ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!confirm("Delete this resource?")) return;
    await deleteResource(id);
    await qc.invalidateQueries({ queryKey: ["resources"] });
  }

  async function submitTimetable(e: React.FormEvent) {
    e.preventDefault();
    setTimetableMsg("");
    if (!timetableForm.subject || timetableForm.batches.length === 0) {
      setTimetableMsg("Subject and at least one batch are required.");
      return;
    }
    if (timetableForm.endTime <= timetableForm.startTime) {
      setTimetableMsg("End time must be after start time.");
      return;
    }
    setTimetableBusy(true);
    try {
      await saveResource(
        timetableEditingId,
        {
          title: timetableForm.subject,
          year: "1st Year",
          batch: joinBatches("1st Year", timetableForm.batches),
          subject: timetableForm.subject,
          teacher: timetableForm.teacher,
          type: TIMETABLE_TYPE,
          description: encodeTimetable(timetableForm),
          contributor: "",
          captured_by: "",
        },
        timetableEditingId ? null : timetableAttachment(timetableForm.date),
      );
      await qc.invalidateQueries({ queryKey: ["resources"] });
      setTimetableForm({ ...emptyTimetable, date: todayValue(), batches: [] });
      setTimetableEditingId(null);
      setTimetableMsg("Saved.");
    } catch (err) {
      setTimetableMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setTimetableBusy(false);
    }
  }

  function editTimetable(resource: Resource) {
    const details = decodeTimetable(resource);
    if (!details) return;
    setTimetableEditingId(resource.id);
    setTimetableForm({
      ...details,
      subject: resource.subject,
      teacher: resource.teacher ?? "",
      batches: parseBatches(resource.batch),
    });
  }

  const batchOptions = BATCHES[form.year] ?? [];
  const selectedBatches = parseBatches(form.batch);
  const regularResources = (data ?? []).filter((resource) => resource.type !== TIMETABLE_TYPE);
  const timetableEntries = (data ?? [])
    .map((resource) => ({ resource, details: decodeTimetable(resource) }))
    .filter(({ details }) => details !== null)
    .sort((a, b) => `${a.details?.date}${a.details?.startTime}`.localeCompare(`${b.details?.date}${b.details?.startTime}`));

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-lg font-semibold">Admin dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate({ to: "/resources" })}
              className="rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-secondary"
            >
              Student view
            </button>
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
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:py-8">
        <form
          onSubmit={submit}
          className="grid gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2"
        >
          <h2 className="text-base font-semibold sm:col-span-2">
            {editingId ? "Edit resource" : "Upload resource"}
          </h2>
          <input
            className={inputCls}
            placeholder="Title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          <select className={inputCls} value={form.year} onChange={(e) => set("year", e.target.value)}>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
          <fieldset className="rounded-lg border border-input bg-card p-3 sm:col-span-2">
            <legend className="px-1 text-sm font-medium">Batches / branches</legend>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {batchOptions.map((batch) => (
                <label key={batch} className="flex min-h-10 items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
                  <input type="checkbox" checked={selectedBatches.includes(batch)} onChange={() => toggleBatch(batch)} />
                  <span>{batch}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <select
            className={inputCls}
            value={form.subject}
            disabled={selectedBatches.length === 0}
            onChange={(e) => set("subject", e.target.value)}
          >
            <option value="">{selectedBatches.length ? "Select subject" : "Select batch first"}</option>
            {subjectsForBatches(form.year, selectedBatches).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            className={inputCls}
            placeholder="Teacher"
            value={form.teacher}
            onChange={(e) => set("teacher", e.target.value)}
          />
          <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            className={inputCls}
            placeholder="Notes provided by"
            value={form.contributor}
            onChange={(e) => set("contributor", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Notes captured by"
            value={form.captured_by}
            onChange={(e) => set("captured_by", e.target.value)}
          />
          <input
            type="file"
            accept=".pdf,.ppt,.pptx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={inputCls}
          />
          <textarea
            className={`${inputCls} sm:col-span-2`}
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Saving…" : editingId ? "Save changes" : "Upload"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-secondary"
              >
                Cancel
              </button>
            )}
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </form>

        <section className="border-t border-border pt-8" aria-labelledby="timetable-admin-heading">
          <form onSubmit={submitTimetable} className="grid gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <h2 id="timetable-admin-heading" className="text-base font-semibold">
                {timetableEditingId ? "Edit timetable entry" : "Add timetable entry"}
              </h2>
            </div>
            <input aria-label="Class date" type="date" className={inputCls} value={timetableForm.date} onChange={(e) => setTimetableForm((current) => ({ ...current, date: e.target.value }))} />
            <input aria-label="Start time" type="time" className={inputCls} value={timetableForm.startTime} onChange={(e) => setTimetableForm((current) => ({ ...current, startTime: e.target.value }))} />
            <input aria-label="End time" type="time" className={inputCls} value={timetableForm.endTime} onChange={(e) => setTimetableForm((current) => ({ ...current, endTime: e.target.value }))} />
            <input aria-label="Timetable subject" className={inputCls} placeholder="Subject / class" value={timetableForm.subject} onChange={(e) => setTimetableForm((current) => ({ ...current, subject: e.target.value }))} />
            <input aria-label="Timetable teacher" className={`${inputCls} sm:col-span-2 lg:col-span-4`} placeholder="Teacher" value={timetableForm.teacher} onChange={(e) => setTimetableForm((current) => ({ ...current, teacher: e.target.value }))} />
            <fieldset className="rounded-lg border border-input p-3 sm:col-span-2 lg:col-span-4">
              <legend className="px-1 text-sm font-medium">Batches / branches</legend>
              <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {BATCHES["1st Year"].map((batch) => (
                  <label key={batch} className="flex min-h-10 items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
                    <input type="checkbox" checked={timetableForm.batches.includes(batch)} onChange={() => toggleTimetableBatch(batch)} />
                    <span>{batch}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
              <button type="submit" disabled={timetableBusy} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {timetableBusy ? "Saving…" : timetableEditingId ? "Save changes" : "Add class"}
              </button>
              {timetableEditingId && (
                <button type="button" onClick={() => { setTimetableEditingId(null); setTimetableForm({ ...emptyTimetable, date: todayValue(), batches: [] }); }} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
              )}
              {timetableMsg && <span className="text-sm text-muted-foreground">{timetableMsg}</span>}
            </div>
          </form>

          {timetableEntries.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">No timetable entries added.</div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {timetableEntries.map(({ resource, details }) => (
                <article key={resource.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <h3 className="font-semibold">{resource.subject}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{details?.date} · {details?.startTime}–{details?.endTime}</p>
                  <p className="mt-2 text-sm">{resource.batch}</p>
                  <p className="text-sm text-muted-foreground">{resource.teacher}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => editTimetable(resource)} className="rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-secondary">Edit</button>
                    <button type="button" onClick={() => remove(resource.id)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-destructive hover:bg-secondary">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-border pt-8" aria-labelledby="resource-list-heading">
          <h2 id="resource-list-heading" className="mb-4 text-base font-semibold">Uploaded resources</h2>
          {regularResources.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">No resources uploaded yet.</div>
          )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regularResources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              actions={
                <>
                  <button
                    onClick={() => edit(r)}
                    className="rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-destructive hover:bg-secondary"
                  >
                    Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
        </section>
      </div>
    </main>
  );
}
