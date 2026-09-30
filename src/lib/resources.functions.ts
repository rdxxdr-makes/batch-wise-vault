import { createServerFn } from "@tanstack/react-start";

const ADMIN_PIN = "AMMA@4884";
const BUCKET = "resources";

type Fields = {
  title: string;
  year: string;
  batch: string;
  subject: string;
  teacher: string;
  type: string;
  description: string;
  contributor: string;
};

async function admin(pin: string) {
  if (pin !== ADMIN_PIN) throw new Error("Not allowed");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const createUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; fileName: string }) => d)
  .handler(async ({ data }) => {
    const sb = await admin(data.pin);
    const safe = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${crypto.randomUUID()}-${safe}`;
    const { data: u, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: u.token };
  });

export const saveResourceFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { pin: string; id: string | null; fields: Fields; filePath: string | null; fileName: string | null }) => d,
  )
  .handler(async ({ data }) => {
    const sb = await admin(data.pin);
    const f = data.fields;
    const row = {
      title: f.title,
      year: f.year,
      batch: f.batch,
      subject: f.subject,
      teacher: f.teacher || null,
      type: f.type,
      description: f.description || null,
      contributor: f.contributor || null,
    };
    if (data.id) {
      const { data: old } = await sb.from("resources").select("file_path").eq("id", data.id).single();
      const patch =
        data.filePath && data.fileName ? { ...row, file_path: data.filePath, file_name: data.fileName } : row;
      const { error } = await sb.from("resources").update(patch).eq("id", data.id);
      if (error) throw new Error(error.message);
      if (data.filePath && old?.file_path) await sb.storage.from(BUCKET).remove([old.file_path]);
    } else {
      if (!data.filePath || !data.fileName) throw new Error("A file is required");
      const { error } = await sb
        .from("resources")
        .insert({ ...row, file_path: data.filePath, file_name: data.fileName });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteResourceFn = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; id: string }) => d)
  .handler(async ({ data }) => {
    const sb = await admin(data.pin);
    const { data: old } = await sb.from("resources").select("file_path").eq("id", data.id).single();
    const { error } = await sb.from("resources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (old?.file_path) await sb.storage.from(BUCKET).remove([old.file_path]);
    return { ok: true };
  });

export const getFileUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; download: boolean }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: r } = await supabaseAdmin
      .from("resources")
      .select("file_path, file_name")
      .eq("id", data.id)
      .single();
    if (!r) throw new Error("File not found");
    const { data: s, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(r.file_path, 3600, data.download ? { download: r.file_name } : undefined);
    if (error) throw new Error(error.message);
    return { url: s.signedUrl };
  });
