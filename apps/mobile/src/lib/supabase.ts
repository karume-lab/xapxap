import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { File } from "expo-file-system";
import { env } from "@/lib/env";

export const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Storage Utilities
export function generateUUID(): string {
  const s = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, "0");
  return `${s()}${s()}-${s()}-4${s().slice(1)}-${s().slice(0, 2)}${s().slice(2)}-${s()}${s()}${s()}`;
}

export const uploadMedia = async (
  fileParams: { uri: string; name: string; type: string },
  path: string
) => {
  const file = new File(fileParams.uri);
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: fileParams.type });

  const { data, error } = await supabase.storage.from("media").upload(path, blob, {
    contentType: fileParams.type,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getMediaUrl = (path: string) => {
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
};
