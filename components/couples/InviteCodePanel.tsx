"use client";

import { useState } from "react";

type InviteCodePanelProps = {
  code?: string | null;
  errorMessage?: string;
  isCreating?: boolean;
  onCreateInvite: () => Promise<void>;
};

export default function InviteCodePanel({
  code = null,
  errorMessage = "",
  isCreating = false,
  onCreateInvite,
}: InviteCodePanelProps) {
  const [copyMessage, setCopyMessage] = useState("");

  const handleCopy = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopyMessage("복사되었습니다.");
    } catch (error) {
      console.error("Invite code copy failed:", error);
      setCopyMessage("복사하지 못했습니다.");
    }
  };

  return (
    <section className="mb-5 rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg text-[var(--datelog-theme)]">초대코드</h2>
          <p className="mt-1 text-xs text-gray-400">
            상대방에게 코드를 전달해 커플 공간에 초대할 수 있습니다.
          </p>
        </div>
        {!code ? (
          <button
            className="shrink-0 rounded-xl bg-[var(--datelog-theme)] px-4 py-2 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCreating}
            onClick={onCreateInvite}
            type="button"
          >
            {isCreating ? "생성 중" : "코드 생성"}
          </button>
        ) : null}
      </div>

      {code ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-2xl tracking-[0.25em] text-gray-800 shadow-sm">
            {code}
          </div>
          <button
            className="rounded-xl bg-white px-4 py-3 text-sm text-gray-500 shadow-sm transition hover:text-[var(--datelog-theme)]"
            onClick={handleCopy}
            type="button"
          >
            복사
          </button>
        </div>
      ) : (
        <p className="rounded-xl bg-white px-4 py-3 text-sm text-gray-400">
          아직 활성 초대코드가 없습니다.
        </p>
      )}

      {copyMessage ? (
        <p className="mt-2 text-xs text-gray-400">{copyMessage}</p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
