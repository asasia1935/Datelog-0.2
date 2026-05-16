"use client";

import { FormEvent, useState } from "react";

type CoupleSetupProps = {
  createErrorMessage?: string;
  displayName?: string | null;
  isSigningOut?: boolean;
  joinErrorMessage?: string;
  onCreateCouple: (name: string) => Promise<void>;
  onJoinByInviteCode: (code: string) => Promise<void>;
  onSignOut: () => void;
};

export default function CoupleSetup({
  createErrorMessage = "",
  displayName = null,
  isSigningOut = false,
  joinErrorMessage = "",
  onCreateCouple,
  onJoinByInviteCode,
  onSignOut,
}: CoupleSetupProps) {
  const [coupleName, setCoupleName] = useState("우리의 DateLog");
  const [inviteCode, setInviteCode] = useState("");
  const [isCreatingCouple, setIsCreatingCouple] = useState(false);
  const [isJoiningCouple, setIsJoiningCouple] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingCouple(true);
    await onCreateCouple(coupleName);
    setIsCreatingCouple(false);
  };

  const handleJoinSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsJoiningCouple(true);
    await onJoinByInviteCode(inviteCode);
    setIsJoiningCouple(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7fb] px-4 py-8 text-[#3f2d37]">
      <section
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        style={{ "--datelog-theme": "#FF69B4" } as React.CSSProperties}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">
              {displayName ? `${displayName}님, 환영합니다.` : "DateLog 시작하기"}
            </p>
            <h1 className="mt-1 text-2xl text-[var(--datelog-theme)]">
              커플 공간 만들기
            </h1>
          </div>
          <button
            className="rounded-full px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-100 hover:text-[var(--datelog-theme)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSigningOut}
            onClick={onSignOut}
            type="button"
          >
            {isSigningOut ? "로그아웃 중" : "로그아웃"}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">커플 이름</span>
            <input
              className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-4 py-3 outline-[var(--datelog-theme)]"
              onChange={(event) => setCoupleName(event.target.value)}
              placeholder="예: 우리의 DateLog"
              required
              type="text"
              value={coupleName}
            />
          </label>

          {createErrorMessage ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
              {createErrorMessage}
            </p>
          ) : null}

          <button
            className="w-full rounded-xl bg-[var(--datelog-theme)] py-3 text-lg text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCreatingCouple}
            type="submit"
          >
            {isCreatingCouple ? "생성 중..." : "커플 공간 생성"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-300">
          <span className="h-px flex-1 bg-gray-100" />
          또는
          <span className="h-px flex-1 bg-gray-100" />
        </div>

        <form className="space-y-4" onSubmit={handleJoinSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">
              초대코드로 참여
            </span>
            <input
              className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-4 py-3 uppercase tracking-[0.2em] outline-[var(--datelog-theme)]"
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="예: ABC123"
              required
              type="text"
              value={inviteCode}
            />
          </label>

          {joinErrorMessage ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
              {joinErrorMessage}
            </p>
          ) : null}

          <button
            className="w-full rounded-xl bg-white py-3 text-lg text-[var(--datelog-theme)] shadow-sm ring-1 ring-pink-100 transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isJoiningCouple}
            type="submit"
          >
            {isJoiningCouple ? "참여 중..." : "초대코드로 참여"}
          </button>
        </form>
      </section>
    </main>
  );
}
