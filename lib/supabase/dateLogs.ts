import type { LogEntry } from "@/components/datelog/types";
import { supabase } from "./client";

type DateLogRow = {
  id: string;
  content: string | null;
  log_date: string;
  rating_user_1: number | null;
  rating_user_2: number | null;
  title: string;
};

export async function getDateLogsByCoupleId(coupleId: string) {
  const { data, error } = await supabase
    .from("date_logs")
    .select("id, log_date, title, content, rating_user_1, rating_user_2")
    .eq("couple_id", coupleId)
    .order("log_date", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<DateLogRow[]>();

  if (error) {
    return { data: null, error };
  }

  const logs: LogEntry[] = (data ?? []).map((row) => ({
    id: row.id,
    date: row.log_date,
    photos: [],
    ratingMy: row.rating_user_1 ?? 0,
    ratingPartner: row.rating_user_2 ?? 0,
    reviewMy: row.content ?? "",
    reviewPartner: "",
    title: row.title,
  }));

  return { data: logs, error: null };
}
