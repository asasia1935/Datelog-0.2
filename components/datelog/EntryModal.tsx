"use client";

import { FormEvent, useState } from "react";
import type { DateLogSettings } from "./types";

type DateLogInput = {
  content: string;
  logDate: string;
  ratingUser1: number;
  ratingUser2: number;
  title: string;
};

type EntryModalProps = {
  open: boolean;
  selectedDate: string;
  settings: DateLogSettings;
  onClose: () => void;
  onSaveDateLog?: (input: DateLogInput) => Promise<{ ok: boolean }>;
};

function Stars({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className="flex gap-1 text-3xl leading-none" style={{ fontFamily: "sans-serif" }}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;

        return (
          <button
            className={starValue <= value ? "text-yellow-300" : "text-gray-200"}
            key={starValue}
            onClick={() => onChange(starValue)}
            type="button"
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function EntryModal({
  open,
  selectedDate,
  settings,
  onClose,
  onSaveDateLog,
}: EntryModalProps) {
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [logDate, setLogDate] = useState(selectedDate);
  const [ratingUser1, setRatingUser1] = useState(5);
  const [ratingUser2, setRatingUser2] = useState(5);
  const [title, setTitle] = useState("");

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!onSaveDateLog) {
      setErrorMessage("데이트 기록을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsSaving(true);
    const result = await onSaveDateLog({
      content: content.trim(),
      logDate,
      ratingUser1,
      ratingUser2,
      title: title.trim(),
    });
    setIsSaving(false);

    if (!result.ok) {
      setErrorMessage("데이트 기록을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setContent("");
    setTitle("");
    onClose();
  };

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto rounded-3xl bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{logDate}</p>
          <h2 className="text-xl text-[var(--datelog-theme)]">새 기록 추가</h2>
        </div>
        <button
          className="rounded-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
      </div>

      <div className="mb-5 flex border-b border-gray-100">
        <button
          className="flex-1 border-b-2 border-[var(--datelog-theme)] py-3 text-[var(--datelog-theme)]"
          type="button"
        >
          데이트 로그
        </button>
        <button className="flex-1 py-3 text-gray-400" disabled type="button">
          일정
        </button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-lg text-gray-700">기록 날짜</span>
            <input
              className="w-full rounded-xl bg-gray-50 p-3 outline-[var(--datelog-theme)]"
              onChange={(event) => setLogDate(event.target.value)}
              required
              type="date"
              value={logDate}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-lg text-gray-700">제목</span>
            <input
              className="w-full rounded-xl bg-gray-50 p-3 outline-[var(--datelog-theme)]"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 성수동 저녁 데이트"
              required
              type="text"
              value={title}
            />
          </label>
        </section>

        <section className="rounded-2xl bg-gray-50 p-4">
          <label className="mb-1 block text-sm text-gray-500">
            {settings.myName}의 만족도
          </label>
          <Stars onChange={setRatingUser1} value={ratingUser1} />
          <label className="mb-1 mt-4 block text-sm text-gray-500">
            {settings.partnerName}의 만족도
          </label>
          <Stars onChange={setRatingUser2} value={ratingUser2} />
        </section>

        <section>
          <label className="mb-2 block text-lg text-gray-700">오늘의 한 줄 평</label>
          <textarea
            className="min-h-28 w-full resize-none rounded-xl bg-gray-50 p-3 outline-[var(--datelog-theme)]"
            onChange={(event) => setContent(event.target.value)}
            placeholder={`${settings.myName}의 한마디...`}
            value={content}
          />
        </section>

        <section>
          <label className="mb-2 block text-lg text-gray-700">
            사진 및 추억 (최대 10장)
          </label>
          <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/40 p-4 text-sm text-gray-400">
            사진 기능은 준비 중입니다. 이번 단계에서는 데이트 기록만 저장됩니다.
          </div>
        </section>

        {errorMessage ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            {errorMessage}
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-[var(--datelog-theme)] py-4 text-xl text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </div>
  );
}
