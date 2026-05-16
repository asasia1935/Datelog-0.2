import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function requirePublicEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} 환경변수가 설정되지 않았습니다. `.concat(
        ".env.local.example을 참고해 .env.local에 값을 추가해주세요.",
      ),
    );
  }

  return value;
}

export const supabase = createClient(
  requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
  requirePublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey),
);
