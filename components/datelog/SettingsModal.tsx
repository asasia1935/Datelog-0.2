"use client";

import type { DateLogSettings } from "./types";

type SettingsModalProps = {
  open: boolean;
  settings: DateLogSettings;
  onClose: () => void;
};

export default function SettingsModal({
  open,
  settings,
  onClose,
}: SettingsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 border-b border-gray-100 pb-3 text-2xl">설정</h2>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">캘린더 제목</span>
            <input
              className="w-full rounded-lg border border-gray-200 p-2 text-lg outline-[var(--datelog-theme)]"
              defaultValue={settings.title}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">테마 색상</span>
            <div className="flex gap-2">
              <input
                className="h-10 w-10 cursor-pointer rounded border-0"
                defaultValue={settings.themeColor}
                type="color"
              />
              <input
                className="flex-1 rounded-lg border border-gray-200 p-2 text-sm uppercase outline-[var(--datelog-theme)]"
                defaultValue={settings.themeColor}
              />
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">내 이름</span>
              <input
                className="w-full rounded-lg border border-gray-200 p-2 outline-[var(--datelog-theme)]"
                defaultValue={settings.myName}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">파트너 이름</span>
              <input
                className="w-full rounded-lg border border-gray-200 p-2 outline-[var(--datelog-theme)]"
                defaultValue={settings.partnerName}
              />
            </label>
          </div>

          <section>
            <div className="mb-2 text-sm text-gray-500">커스텀 라벨</div>
            <div className="space-y-2">
              {settings.labels.map((label) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2 text-sm"
                  key={label.name}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                  </span>
                  <button className="text-red-400" type="button">
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="h-10 w-10 rounded border border-gray-200"
                defaultValue="#34D399"
                type="color"
              />
              <input
                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 outline-[var(--datelog-theme)]"
                placeholder="라벨 이름"
              />
              <button
                className="rounded-lg bg-gray-100 px-4 text-gray-600"
                type="button"
              >
                추가
              </button>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-xl px-4 py-2 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            취소
          </button>
          <button
            className="rounded-xl bg-[var(--datelog-theme)] px-5 py-2 text-white"
            onClick={onClose}
            type="button"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
