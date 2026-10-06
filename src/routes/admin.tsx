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
import {
  ANNOUNCEMENT_TYPE,
  EXAM_TIMETABLE_TYPE,
  isSpecialType,
  MAX_ANNOUNCEMENTS,
  placeholderAttachment,
  specialFields,
  TIMETABLE_IMAGE_TYPE,
} from "@/lib/timetable";
import { EmptyState, ExamTimetableFile, TimetableImage } from "@/components/Board";

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

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useResources();
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ttFile, setTtFile] = useState<File | null>(null);
  const [ttBusy, setTtBusy] = useState(false);
  const [ttMsg, setTtMsg] = useState("");
  const [examHeading, setExamHeading] = useState("");
  const [examFile, setExamFile] = useState<File | null>(null);
  const [examBusy, setExamBusy] = useState(false);
  const [examMsg, setExamMsg] = useState("");
  const [annText, setAnnText] = useState("");
  const [annEditingId, setAnnEditingId] = useState<string | null>(null);
  const [annBusy, setAnnBusy] = useState(false);
  const [annMsg, setAnnMsg] = useState("");

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
    if (!(await deleteResource(id))) return;
    await qc.invalidateQueries({ queryKey: ["resources"] });
  }

  const all = data ?? [];
  const timetable = all.find((r) => r.type === TIMETABLE_IMAGE_TYPE);
  const examTimetable = all.find((r) => r.type === EXAM_TIMETABLE_TYPE);
  const announcements = all.filter((r) => r.type === ANNOUNCEMENT_TYPE);

  useEffect(() => {
    setExamHeading(examTimetable?.title ?? "");
  }, [examTimetable?.id, examTimetable?.title]);

  async function uploadTimetable() {
    setTtMsg("");
    if (!ttFile) return setTtMsg("Choose an image first.");
    setTtBusy(true);
    try {
      await saveResource(timetable?.id ?? null, specialFields(TIMETABLE_IMAGE_TYPE, "Timetable", ""), ttFile);
      await qc.invalidateQueries({ queryKey: ["resources"] });
      setTtFile(null);
      setTtMsg("Timetable saved.");
    } catch (err) {
      setTtMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setTtBusy(false);
    }
  }

  async function saveExamTimetable() {
    setExamMsg("");
    const heading = examHeading.trim();
    if (!heading) return setExamMsg("Enter a heading first.");
    if (!examTimetable && !examFile) return setExamMsg("Choose an image or PDF to upload.");
    setExamBusy(true);
    try {
      await saveResource(
        examTimetable?.id ?? null,
        specialFields(EXAM_TIMETABLE_TYPE, heading, ""),
        examFile,
      );
      await qc.invalidateQueries({ queryKey: ["resources"] });
      setExamFile(null);
      setExamMsg("Exam timetable saved.");
    } catch (err) {
      setExamMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setExamBusy(false);
    }
  }

  async function removeExamTimetable() {
    if (!examTimetable || !(await deleteResource(examTimetable.id))) return;
    await qc.invalidateQueries({ queryKey: ["resources"] });
    setExamHeading("");
    setExamFile(null);
  }

  async function saveAnnouncement() {
    setAnnMsg("");
    const text = annText.trim();
    if (!text) return setAnnMsg("Write something first.");
    if (!annEditingId && announcements.length >= MAX_ANNOUNCEMENTS)
      return setAnnMsg(`Maximum ${MAX_ANNOUNCEMENTS} announcements. Delete one first.`);
    setAnnBusy(true);
    try {
      await saveResource(
        annEditingId,
        specialFields(ANNOUNCEMENT_TYPE, text.slice(0, 80), text),
        annEditingId ? null : placeholderAttachment("announcement"),
      );
      await qc.invalidateQueries({ queryKey: ["resources"] });
      setAnnText("");
      setAnnEditingId(null);
      setAnnMsg("Saved.");
    } catch (err) {
      setAnnMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAnnBusy(false);
    }
  }

  const batchOptions = BATCHES[form.year] ?? [];
  const selectedBatches = parseBatches(form.batch);
  const regularResources = all.filter((resource) => !isSpecialType(resource.type));

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

        <div className="grid gap-6 border-t border-border pt-8 lg:grid-cols-2">
          <section aria-labelledby="exam-timetable-admin-heading" className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 id="exam-timetable-admin-heading" className="text-base font-semibold">Exam timetable</h2>
            <input
              className={inputCls}
              placeholder="Exam timetable heading"
              value={examHeading}
              onChange={(e) => setExamHeading(e.target.value)}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="file"
                accept="image/*,application/pdf,.pdf"
                onChange={(e) => setExamFile(e.target.files?.[0] ?? null)}
                className={inputCls}
              />
              <button type="button" disabled={examBusy} onClick={saveExamTimetable} className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {examBusy ? "Saving…" : examTimetable ? "Save / Replace" : "Upload"}
              </button>
            </div>
            {examMsg && <p className="text-sm text-muted-foreground">{examMsg}</p>}
            {examTimetable ? (
              <>
                <p className="text-sm font-medium">{examTimetable.title}</p>
                <ExamTimetableFile
                  resource={examTimetable}
                  actions={<button type="button" onClick={removeExamTimetable} className="rounded-lg px-4 py-2 text-sm font-medium text-destructive hover:bg-secondary">Delete</button>}
                />
              </>
            ) : (
              <EmptyState>No exam timetable uploaded.</EmptyState>
            )}
          </section>

          <section aria-labelledby="timetable-admin-heading" className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 id="timetable-admin-heading" className="text-base font-semibold">Today’s timetable image</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input type="file" accept="image/*" onChange={(e) => setTtFile(e.target.files?.[0] ?? null)} className={inputCls} />
              <button type="button" disabled={ttBusy} onClick={uploadTimetable} className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {ttBusy ? "Uploading…" : timetable ? "Replace" : "Upload"}
              </button>
            </div>
            {ttMsg && <p className="text-sm text-muted-foreground">{ttMsg}</p>}
            {timetable ? (
              <TimetableImage
                resource={timetable}
                actions={<button onClick={() => remove(timetable.id)} className="rounded-lg px-4 py-2 text-sm font-medium text-destructive hover:bg-secondary">Delete</button>}
              />
            ) : (
              <EmptyState>No timetable image uploaded.</EmptyState>
            )}
          </section>

          <section aria-labelledby="ann-admin-heading" className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 id="ann-admin-heading" className="text-base font-semibold">
              Announcements <span className="text-sm font-normal text-muted-foreground">({announcements.length}/{MAX_ANNOUNCEMENTS})</span>
            </h2>
            <textarea className={inputCls} rows={3} placeholder="Write an announcement" value={annText} onChange={(e) => setAnnText(e.target.value)} />
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={annBusy} onClick={saveAnnouncement} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {annBusy ? "Saving…" : annEditingId ? "Save changes" : "Add announcement"}
              </button>
              {annEditingId && (
                <button type="button" onClick={() => { setAnnEditingId(null); setAnnText(""); }} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
              )}
              {annMsg && <span className="text-sm text-muted-foreground">{annMsg}</span>}
            </div>
            {announcements.length === 0 ? (
              <EmptyState>No announcements yet.</EmptyState>
            ) : (
              <ul className="space-y-2">
                {announcements.map((a) => (
                  <li key={a.id} className="rounded-lg border border-border p-3">
                    <p className="whitespace-pre-wrap text-sm">{a.description}</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => { setAnnEditingId(a.id); setAnnText(a.description ?? ""); }} className="rounded-lg border border-input px-3 py-1 text-sm hover:bg-secondary">Edit</button>
                      <button type="button" onClick={() => remove(a.id)} className="rounded-lg px-3 py-1 text-sm font-medium text-destructive hover:bg-secondary">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

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
