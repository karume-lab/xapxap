import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { env } from "@/lib/env";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: Platform.OS === "web" ? undefined : ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === "web",
    },
  }
);

// Storage Utilities
export const uploadMedia = async (
  file: { uri: string; name: string; type: string },
  path: string
) => {
  const response = await fetch(file.uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage.from("media").upload(path, blob, {
    contentType: file.type,
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
