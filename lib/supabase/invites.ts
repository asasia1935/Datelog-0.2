import { supabase } from "./client";

export type CoupleInvite = {
  id: string;
  couple_id: string;
  code: string;
  created_by: string;
  expires_at: string | null;
  used_at: string | null;
};

export async function getActiveInviteByCoupleId(coupleId: string) {
  return supabase
    .from("couple_invites")
    .select("id, couple_id, code, created_by, expires_at, used_at")
    .eq("couple_id", coupleId)
    .is("used_at", null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<CoupleInvite>();
}

export function generateInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codeLength = 6;

  return Array.from({ length: codeLength }, () =>
    alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
  ).join("");
}

export async function createInviteCode(coupleId: string, userId: string) {
  const code = generateInviteCode();

  return supabase
    .from("couple_invites")
    .insert({
      couple_id: coupleId,
      code,
      created_by: userId,
    })
    .select("id, couple_id, code, created_by, expires_at, used_at")
    .single<CoupleInvite>();
}
