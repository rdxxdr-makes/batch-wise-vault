import { supabase } from "@/integrations/supabase/client";
import type { Resource } from "./useResources";
import { getPin } from "./session";
import { createUploadUrl, deleteResourceFn, getFileUrl, saveResourceFn } from "./resources.functions";

export async function listResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from("resources")
    .select(
      "id,title,year,batch,subject,teacher,type,description,contributor,notes_captured_by,file_path,file_name",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveResource(
  id: string | null,
  fields: Omit<
    Resource,
    "id" | "file_path" | "file_name" | "teacher" | "description" | "contributor" | "notes_captured_by"
  > & {
    teacher: string;
    description: string;
    contributor: string;
    notes_captured_by: string;
  },
  file: File | null,
) {
  const pin = getPin() ?? "";
  let filePath: string | null = null;
  if (file) {
    const { path, token } = await createUploadUrl({ data: { pin, fileName: file.name } });
    const { error } = await supabase.storage.from("resources").uploadToSignedUrl(path, token, file);
    if (error) throw new Error(error.message);
    filePath = path;
  }
  await saveResourceFn({ data: { pin, id, fields, filePath, fileName: file ? file.name : null } });
}

export async function deleteResource(id: string) {
  await deleteResourceFn({ data: { pin: getPin() ?? "", id } });
}

export async function openFile(id: string, download: boolean) {
  // Open a tab synchronously so mobile popup blockers allow it.
  const win = download ? null : window.open("", "_blank");
  try {
    const { url } = await getFileUrl({ data: { id, download } });
    if (win) win.location.href = url;
    else window.location.href = url;
  } catch {
    win?.close();
    alert("File not found.");
  }
}
