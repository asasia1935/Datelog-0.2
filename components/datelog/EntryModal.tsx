"use client";

import type { DateLogSettings, Label } from "./types";

type EntryModalProps = {
  open: boolean;
  selectedDate: string;
  settings: DateLogSettings;
  labels: Label[];
  onClose: () => void;
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-1 text-3xl leading-none" style={{ fontFamily: "sans-serif" }}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          className={index < value ? "text-yellow-300" : "text-gray-200"}
          key={index}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function EntryModal({
  open,
  selectedDate,
  settings,
  labels,
  onClose,
}: EntryModalProps) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto rounded-3xl bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{selectedDate}</p>
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
        <button className="flex-1 py-3 text-gray-400" type="button">
          일정
        </button>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl bg-gray-50 p-4">
          <label className="mb-1 block text-sm text-gray-500">
            {settings.myName}의 만족도
          </label>
          <Stars value={5} />
          <label className="mb-1 mt-4 block text-sm text-gray-500">
            {settings.partnerName}의 만족도
          </label>
          <Stars value={4} />
        </section>

        <section>
          <label className="mb-2 block text-lg text-gray-700">오늘의 한 줄 평</label>
          <div className="space-y-2">
            <textarea
              className="min-h-20 w-full resize-none rounded-xl bg-gray-50 p-3 outline-[var(--datelog-theme)]"
              placeholder={`${settings.myName}의 한마디...`}
            />
            <textarea
              className="min-h-20 w-full resize-none rounded-xl bg-gray-50 p-3 outline-[var(--datelog-theme)]"
              placeholder={`${settings.partnerName}의 한마디...`}
            />
          </div>
        </section>

        <section>
          <label className="mb-2 block text-lg text-gray-700">
            사진 및 추억 (최대 10장)
          </label>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex gap-3">
              <div className="h-20 w-20 shrink-0 rounded-lg border bg-white" />
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-[var(--datelog-theme)]"
                  placeholder="이미지 URL 입력..."
                />
                <textarea
                  className="min-h-14 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-[var(--datelog-theme)]"
                  placeholder="사진에 대한 코멘트"
                />
              </div>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              className="flex-1 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500"
              type="button"
            >
              + URL로 추가
            </button>
            <button
              className="flex-1 rounded-xl bg-gray-100 py-3 text-sm text-gray-600"
              type="button"
            >
              + 내 기기에서 선택
            </button>
          </div>
        </section>

        <button
          className="w-full rounded-xl bg-[var(--datelog-theme)] py-4 text-xl text-white shadow-md"
          type="button"
        >
          저장하기
        </button>
      </div>

      <div className="mt-8 border-t border-gray-100 pt-5">
        <h3 className="mb-4 text-xl text-gray-700">일정 저장</h3>
        <div className="space-y-4">
          <input
            className="w-full rounded-xl bg-gray-50 p-3 outline-[var(--datelog-theme)]"
            placeholder="일정 제목"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-xl bg-gray-50 p-3 outline-[var(--datelog-theme)]"
              type="time"
            />
            <select className="rounded-xl bg-gray-50 p-3 outline-[var(--datelog-theme)]">
              <option>기본</option>
              {labels.map((label) => (
                <option key={label.name}>{label.name}</option>
              ))}
            </select>
          </div>
          <textarea
            className="h-28 w-full resize-none rounded-xl bg-gray-50 p-3 outline-[var(--datelog-theme)]"
            placeholder="메모"
          />
          <button
            className="w-full rounded-xl bg-[var(--datelog-theme)] py-4 text-xl text-white shadow-md"
            type="button"
          >
            일정 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
