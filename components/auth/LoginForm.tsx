"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (session) {
        router.replace("/");
        return;
      }

      setIsCheckingSession(false);
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setNoticeMessage("");

    if (password.length < 6) {
      setErrorMessage("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (mode === "signup") {
      setNoticeMessage("회원가입이 완료되었습니다. 가입 확인 메일이 필요할 수 있습니다.");
      return;
    }

    router.replace("/");
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage("");
    setNoticeMessage("");
  };

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7fb] px-4 text-[#3f2d37]">
        <div className="rounded-3xl bg-white px-6 py-5 text-center shadow-xl">
          <p className="text-lg text-[var(--datelog-theme)]">
            로그인 상태를 확인하고 있습니다...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7fb] px-4 py-8 text-[#3f2d37]">
      <section
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        style={{ "--datelog-theme": "#FF69B4" } as React.CSSProperties}
      >
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-400">커플 데이트 기록 서비스</p>
          <h1 className="mt-1 text-3xl text-[var(--datelog-theme)]">DateLog</h1>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-pink-50 p-1">
          <button
            className={`rounded-xl py-2 text-sm transition ${
              mode === "login"
                ? "bg-white text-[var(--datelog-theme)] shadow-sm"
                : "text-gray-400"
            }`}
            onClick={() => switchMode("login")}
            type="button"
          >
            로그인
          </button>
          <button
            className={`rounded-xl py-2 text-sm transition ${
              mode === "signup"
                ? "bg-white text-[var(--datelog-theme)] shadow-sm"
                : "text-gray-400"
            }`}
            onClick={() => switchMode("signup")}
            type="button"
          >
            회원가입
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">이메일</span>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-4 py-3 outline-[var(--datelog-theme)]"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">비밀번호</span>
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-4 py-3 outline-[var(--datelog-theme)]"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="최소 6자 이상"
              required
              type="password"
              value={password}
            />
            <span className="mt-1 block text-xs text-gray-400">
              비밀번호는 최소 6자 이상이어야 합니다.
            </span>
          </label>

          {errorMessage ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
              {errorMessage}
            </p>
          ) : null}

          {noticeMessage ? (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
              {noticeMessage}
            </p>
          ) : null}

          <button
            className="w-full rounded-xl bg-[var(--datelog-theme)] py-3 text-lg text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "처리 중..."
              : mode === "login"
                ? "로그인"
                : "회원가입"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-400">
          v1에서는 이메일/비밀번호 로그인만 지원합니다.
        </p>
      </section>
    </main>
  );
}
