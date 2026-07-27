import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@db/seed/env";
import { createClient } from "@supabase/supabase-js";
import mime from "mime-types";

// Initialize a Supabase client with the service role key to bypass RLS during seeding
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export const ensureBucket = async (bucket: string): Promise<void> => {
  const { data: existing } = await supabase.storage.getBucket(bucket);
  if (!existing) {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error) throw new Error(`Failed to create bucket "${bucket}": ${error.message}`);
    console.log(`  Created storage bucket: ${bucket}`);
  }
};

export const uploadMediaFile = async (
  bucket: string,
  storagePath: string,
  localFilePath: string
): Promise<string> => {
  const absolutePath = path.resolve(localFilePath);
  const fileBuffer = await readFile(absolutePath);

  // Use mime-types or fallback to octet-stream
  const contentType = mime.lookup(absolutePath) || "application/octet-stream";

  const { error } = await supabase.storage.from(bucket).upload(storagePath, fileBuffer, {
    upsert: true,
    contentType,
  });

  if (error) {
    throw new Error(`Failed to upload ${localFilePath}: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return urlData.publicUrl;
};
