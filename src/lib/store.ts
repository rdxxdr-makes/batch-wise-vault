import { supabase } from "@/integrations/supabase/client";
import type { Resource } from "./useResources";
import { getAdminToken } from "./session";
import { createUploadUrl, deleteResourceFn, getFileUrl, saveResourceFn } from "./resources.functions";

export async function listResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("id,title,year,batch,subject,teacher,type,description,contributor,captured_by,file_path,file_name,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveResource(
  id: string | null,
  fields: Omit<Resource, "id" | "file_path" | "file_name" | "created_at" | "teacher" | "description" | "contributor" | "captured_by"> & {
    teacher: string;
    description: string;
    contributor: string;
    captured_by: string;
  },
  file: File | null,
) {
    let filePath: string | null = null;
    let fileName: string | null = null;

    if (file) {
      fileName = file.name;
      const ext = file.name.split('.').pop();
      filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);
    }

    if (id) {
      const { error } = await supabase
        .from("resources")
        .update({
          ...fields,
          ...(filePath ? { file_path: filePath, file_name: fileName } : {}),
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("resources")
        .insert([{
          ...fields,
          file_path: filePath,
          file_name: fileName,
        }]);
      if (error) throw new Error(error.message);
    }
  }

/** Asks for the delete PIN; returns true only when deleted. */
export async function deleteResource(id: string) {
  const deletePin = window.prompt("Enter delete PIN");
  if (deletePin === null) return false;
  try {
    await deleteResourceFn({ data: { token: getAdminToken(), id, deletePin } });
    return true;
  } catch (err) {
    alert(err instanceof Error ? err.message : "Delete failed.");
    return false;
  }
}

export async function openFile(id: string, download: boolean) {
  // Open a tab synchronously so mobile popup blockers allow it.
  const win = download ? null : window.open("", "_blank");
  try {
    const { url } = await getFileUrl({ data: { id, download } });
    if (win) win.location.replace(url);
    else window.location.href = url;
  } catch {
    win?.close();
    alert("File not found.");
  }
}
