import type { User } from "@supabase/supabase-js";
import { supabase } from "./client";

export type Profile = {
  id: string;
  display_name: string | null;
};

export async function createOwnProfile(userId: string, displayName: string) {
  return supabase.from("profiles").insert({
    id: userId,
    display_name: displayName,
  });
}

export async function getOwnProfile(userId: string) {
  return supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", userId)
    .single<Profile>();
}

function getFallbackDisplayName(user: User) {
  const metadataDisplayName = user.user_metadata?.display_name;

  if (typeof metadataDisplayName === "string" && metadataDisplayName.trim()) {
    return metadataDisplayName.trim();
  }

  const emailName = user.email?.split("@")[0];

  if (emailName) {
    return emailName;
  }

  return "사용자";
}

export async function ensureOwnProfile(user: User) {
  const { data: profile, error: fetchError } = await getOwnProfile(user.id);

  if (profile) {
    return { data: profile, error: null };
  }

  if (fetchError && fetchError.code !== "PGRST116") {
    return { data: null, error: fetchError };
  }

  const displayName = getFallbackDisplayName(user);
  const { error: insertError } = await createOwnProfile(user.id, displayName);

  if (insertError) {
    return { data: null, error: insertError };
  }

  return getOwnProfile(user.id);
}
