"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

function getAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes("email rate limit exceeded")) {
    return "인증 메일 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  }

  return "인증 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
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

    if (mode === "signup" && !displayName.trim()) {
      setErrorMessage("회원가입 시 표시 이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setIsSubmitting(false);

      if (error) {
        console.error("Supabase signInWithPassword failed:", error);
        setErrorMessage(getAuthErrorMessage(error.message));
        return;
      }

      router.replace("/");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
      },
    });
    setIsSubmitting(false);

    if (signUpError) {
      console.error("Supabase signUp failed:", signUpError);
      setErrorMessage(getAuthErrorMessage(signUpError.message));
      return;
    }

    setNoticeMessage(
      "인증 메일을 보냈습니다. 이메일 인증을 완료한 뒤 로그인해주세요.",
    );
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
          {mode === "signup" ? (
            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">표시 이름</span>
              <input
                autoComplete="name"
                className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-4 py-3 outline-[var(--datelog-theme)]"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="DateLog에서 사용할 이름"
                required
                type="text"
                value={displayName}
              />
            </label>
          ) : null}

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
