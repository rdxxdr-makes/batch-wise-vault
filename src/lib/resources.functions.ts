import { createServerFn } from "@tanstack/react-start";

const ADMIN_PIN = "AMMA@4884";
const BUCKET = "resources";

function assertAdmin(pin: string) {
  if (pin !== ADMIN_PIN) throw new Error("Invalid admin PIN");
}

type ResourceFields = {
  title: string;
  year: string;
  batch: string;
  subject: string;
  teacher: string;
  type: string;
  description: string;
  contributor: string;
};

export const createUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; fileName: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safe = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${crypto.randomUUID()}-${safe}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

export const saveResource = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      pin: string;
      id?: string;
      fields: ResourceFields;
      filePath?: string;
      fileName?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    assertAdmin(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const patch: Record<string, unknown> = { ...data.fields };
      if (data.filePath && data.fileName) {
        patch['file_path'] = data.filePath;
        patch['file_name'] = data.fileName;
      }
      const { error } = await supabaseAdmin.from("resources").update(patch).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    if (!data.filePath || !data.fileName) throw new Error("A file is required");
    const { error } = await supabaseAdmin.from("resources").insert({
      ...data.fields,
      file_path: data.filePath,
      file_name: data.fileName,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteResource = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; id: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("resources")
      .select("file_path")
      .eq("id", data.id)
      .maybeSingle();
    if (row?.file_path) await supabaseAdmin.storage.from(BUCKET).remove([row.file_path]);
    const { error } = await supabaseAdmin.from("resources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getFileUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { path: string; download?: boolean; fileName?: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(data.path, 3600, data.download ? { download: data.fileName ?? true } : {});
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
