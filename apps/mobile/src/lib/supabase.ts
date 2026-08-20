import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system";
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
export function generateUUID(): string {
  const s = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, "0");
  return `${s()}${s()}-${s()}-4${s().slice(1)}-${s().slice(0, 2)}${s().slice(2)}-${s()}${s()}${s()}`;
}

export const uploadMedia = async (
  file: { uri: string; name: string; type: string },
  path: string
) => {
  const base64 = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: file.type });

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
