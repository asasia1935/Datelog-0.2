"use client";

import type { LogEntry } from "./types";

type DateLogDetailModalProps = {
  log: LogEntry;
  myName: string;
  partnerName: string;
  onClose: () => void;
};

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-1 text-2xl leading-none" style={{ fontFamily: "sans-serif" }}>
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

function formatDetailDate(dateKey: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
  }).format(new Date(`${dateKey}T00:00:00`));
}

export default function DateLogDetailModal({
  log,
  myName,
  partnerName,
  onClose,
}: DateLogDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 py-4 sm:items-center">
      <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
        <header className="mb-5 flex items-start justify-between gap-4 border-b border-pink-100 pb-4">
          <div>
            <p className="text-sm text-gray-400">{formatDetailDate(log.date)}</p>
            <h2 className="mt-1 text-2xl text-[var(--datelog-theme)]">
              {log.title || "데이트 기록"}
            </h2>
          </div>
          <button
            className="rounded-full px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-100 hover:text-[var(--datelog-theme)]"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </header>

        <div className="space-y-5">
          <section className="rounded-2xl bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm text-gray-500">{myName}의 만족도</p>
                <StarRating value={log.ratingMy} />
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-500">{partnerName}의 만족도</p>
                <StarRating value={log.ratingPartner} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-lg text-gray-700">오늘의 한 줄 평</h3>
            <div className="space-y-2">
              <div className="rounded-2xl bg-pink-50/60 p-4">
                <p className="mb-1 text-sm text-gray-400">{myName}</p>
                <p className="text-sm leading-6 text-gray-700">
                  {log.reviewMy || "아직 나의 한 줄 평이 없습니다."}
                </p>
              </div>
              <div className="rounded-2xl bg-sky-50/70 p-4">
                <p className="mb-1 text-sm text-gray-400">{partnerName}</p>
                <p className="text-sm leading-6 text-gray-500">
                  {log.reviewPartner || "아직 파트너의 한 줄 평이 없습니다."}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3">
              <h3 className="text-lg text-gray-700">사진 및 추억</h3>
              <p className="mt-1 text-xs text-gray-400">
                MVP에서는 최소 5장 지원을 목표로 하며, 최대 10장까지 등록할 수 있습니다.
              </p>
            </div>

            {log.photos.length ? (
              <div className="space-y-4">
                {log.photos.map((photo, index) => (
                  <article
                    className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm"
                    key={photo.id}
                  >
                    <div className="border-b border-pink-50 bg-pink-50/50 px-4 py-3">
                      <p className="text-sm text-[var(--datelog-theme)]">
                        사진 {index + 1}
                      </p>
                      {photo.location ? (
                        <p className="mt-1 text-xs text-gray-400">
                          {photo.location}
                        </p>
                      ) : null}
                    </div>
                    <div className="bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={photo.location || `데이트 사진 ${index + 1}`}
                        className="h-56 w-full object-cover"
                        src={photo.url}
                      />
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="rounded-2xl bg-pink-50/60 p-3">
                        <p className="mb-1 text-xs text-gray-400">
                          {myName}의 사진 코멘트
                        </p>
                        <p className="text-sm leading-6 text-gray-700">
                          {photo.myComment || "아직 나의 사진 코멘트가 없습니다."}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-sky-50/70 p-3">
                        <p className="mb-1 text-xs text-gray-400">
                          {partnerName}의 사진 코멘트
                        </p>
                        <p className="text-sm leading-6 text-gray-600">
                          {photo.partnerComment ||
                            "아직 연인의 사진 코멘트가 없습니다."}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/40 p-5">
                <p className="text-sm text-gray-600">
                  아직 등록된 사진이 없습니다.
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-400">
                  사진 기능이 추가되면 최대 10장의 사진과 서로의 코멘트를
                  남길 수 있습니다.
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white/80 p-4">
                    <div className="mb-3 flex h-36 items-center justify-center rounded-xl border border-dashed border-pink-200 bg-white text-sm text-gray-300">
                      사진 이미지 영역
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-xl bg-pink-50/70 px-3 py-2 text-xs text-gray-400">
                        나의 사진 코멘트가 여기에 표시됩니다.
                      </div>
                      <div className="rounded-xl bg-sky-50/70 px-3 py-2 text-xs text-gray-400">
                        연인의 사진 코멘트가 여기에 표시됩니다.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
