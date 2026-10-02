import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResources, type Resource } from "@/lib/useResources";
import { ResourceCard } from "@/components/ResourceCard";
import { BATCHES, TYPES, YEARS, subjectsFor, teacherFor } from "@/lib/constants";
import { clearSession, getRole } from "@/lib/session";
import { deleteResource, saveResource } from "@/lib/store";
import { SiteFooter } from "@/components/SiteFooter";

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
  notes_captured_by: "",
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

  useEffect(() => {
    if (getRole() !== "admin") navigate({ to: "/" });
  }, [navigate]);

  function set(k: keyof typeof emptyForm, v: string) {
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === "subject" ? { teacher: teacherFor(f.year, f.batch, v) } : {}),
      ...(k === "year" ? { batch: "", subject: "", teacher: "" } : {}),
      ...(k === "batch" ? { subject: "", teacher: "" } : {}),
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
      notes_captured_by: r.notes_captured_by ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!confirm("Delete this resource?")) return;
    await deleteResource(id);
    await qc.invalidateQueries({ queryKey: ["resources"] });
  }

  const batchOptions = BATCHES[form.year] ?? [];

  return (
    <main className="flex min-h-screen flex-col bg-background">
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

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
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
          <select className={inputCls} value={form.batch} onChange={(e) => set("batch", e.target.value)}>
            <option value="">Select batch / branch</option>
            {batchOptions.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select
            className={inputCls}
            value={form.subject}
            disabled={!form.batch}
            onChange={(e) => set("subject", e.target.value)}
          >
            <option value="">{form.batch ? "Select subject" : "Select batch first"}</option>
            {subjectsFor(form.year, form.batch).map((s) => (
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
            value={form.notes_captured_by}
            onChange={(e) => set("notes_captured_by", e.target.value)}
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((r) => (
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
      </div>
      <SiteFooter />
    </main>
  );
}
