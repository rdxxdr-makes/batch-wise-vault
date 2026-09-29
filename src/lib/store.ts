import type { Resource } from "./useResources";

type Row = Resource & { created_at: number; blob?: Blob };

function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open("portal", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("resources", { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) {
  const d = await db();
  return new Promise<T>((res, rej) => {
    const q = fn(d.transaction("resources", mode).objectStore("resources"));
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
}

export async function listResources(): Promise<Resource[]> {
  const rows = await tx<Row[]>("readonly", (s) => s.getAll() as IDBRequest<Row[]>);
  return rows.sort((a, b) => b.created_at - a.created_at);
}

export async function saveResource(
  id: string | null,
  fields: Omit<Resource, "id" | "file_path" | "file_name">,
  file: File | null,
) {
  const old = id ? await tx<Row | undefined>("readonly", (s) => s.get(id)) : undefined;
  if (!old && !file) throw new Error("A file is required");
  const row: Row = {
    ...(old as Row),
    ...fields,
    id: id ?? crypto.randomUUID(),
    created_at: old?.created_at ?? Date.now(),
    file_path: "",
    file_name: file ? file.name : old!.file_name,
    blob: file ?? old!.blob,
  } as Row;
  await tx("readwrite", (s) => s.put(row));
}

export async function deleteResource(id: string) {
  await tx("readwrite", (s) => s.delete(id));
}

export async function openFile(id: string, download: boolean) {
  const row = await tx<Row | undefined>("readonly", (s) => s.get(id));
  if (!row?.blob) return alert("File not found.");
  const url = URL.createObjectURL(row.blob);
  if (download) {
    const a = document.createElement("a");
    a.href = url;
    a.download = row.file_name;
    a.click();
  } else window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
