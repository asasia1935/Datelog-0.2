import { supabase } from "./client";

export type CoupleMember = {
  id: string;
  couple_id: string;
  user_id: string;
  role: "owner" | "member";
};

export async function getOwnCoupleMember(userId: string) {
  return supabase
    .from("couple_members")
    .select("id, couple_id, user_id, role")
    .eq("user_id", userId)
    .maybeSingle<CoupleMember>();
}

export async function createCoupleWithOwner(userId: string, name: string) {
  const coupleId = crypto.randomUUID();
  const coupleName = name.trim() || "우리의 DateLog";

  const { error: coupleError } = await supabase.from("couples").insert({
    id: coupleId,
    name: coupleName,
    created_by: userId,
  });

  if (coupleError) {
    return { data: null, error: coupleError };
  }

  const { error: memberError } = await supabase.from("couple_members").insert({
    couple_id: coupleId,
    user_id: userId,
    role: "owner",
  });

  if (memberError) {
    return { data: null, error: memberError };
  }

  return getOwnCoupleMember(userId);
}
