import { supabase } from "@/lib/supabase/client";

export type ContentSourceFormat = "csv" | "json" | "markdown" | "pdf";

export async function createContentProcessingJob(file: File, format: ContentSourceFormat) {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Admin authentication is required.");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: storageError } = await supabase.storage.from("question-imports").upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (storageError) throw storageError;

  const { data: upload, error: uploadError } = await supabase
    .from("content_uploads")
    .insert({
      uploaded_by: user.id,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      source_format: format,
      status: "uploaded",
    })
    .select("id")
    .single();
  if (uploadError) throw uploadError;

  const { data: job, error: jobError } = await supabase
    .from("ai_processing_jobs")
    .insert({
      upload_id: upload.id,
      requested_by: user.id,
      stage: "queued",
      status: "queued",
      progress: 0,
    })
    .select("id,status")
    .single();
  if (jobError) throw jobError;
  return job;
}

export async function reviewGeneratedVariant(id: string, status: "approved" | "rejected") {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Admin authentication is required.");
  const { error } = await supabase
    .from("question_variants")
    .update({
      review_status: status,
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}
