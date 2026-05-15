"use client";

import { useMemo, useState } from "react";
import CalendarGrid from "./CalendarGrid";
import EntryModal from "./EntryModal";
import SettingsModal from "./SettingsModal";
import {
  logs as mockLogs,
  schedules as mockSchedules,
  settings as mockSettings,
} from "./mock-data";

const initialDate = "2026-05-15";

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function formatReadableDate(dateKey: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function StarLine({ value }: { value: number }) {
  return (
    <span className="text-sm" style={{ fontFamily: "sans-serif" }}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          className={index < value ? "text-yellow-300" : "text-gray-200"}
          key={index}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function DateLogApp() {
  const [monthDate, setMonthDate] = useState(new Date(2026, 4, 1));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [entryOpen, setEntryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedSchedules = useMemo(
    () => mockSchedules.filter((schedule) => schedule.date === selectedDate),
    [selectedDate],
  );
  const selectedLogs = useMemo(
    () => mockLogs.filter((log) => log.date === selectedDate),
    [selectedDate],
  );
  const todaySchedules = mockSchedules.filter(
    (schedule) => schedule.date === initialDate,
  );

  const changeMonth = (amount: number) => {
    setMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  return (
    <main className="min-h-screen bg-[#fff7fb] px-4 py-5 text-[#3f2d37] sm:px-6">
      <div
        className="relative mx-auto flex min-h-[calc(100vh-40px)] max-w-2xl flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-xl sm:min-h-[82vh] sm:p-6"
        style={
          {
            "--datelog-theme": mockSettings.themeColor,
          } as React.CSSProperties
        }
      >
        <header className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl text-[var(--datelog-theme)]">
            ❤️ {mockSettings.title}
          </h1>
          <div className="flex gap-1">
            <button
              aria-label="홈으로"
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[var(--datelog-theme)]"
              onClick={() => setSelectedDate(initialDate)}
              type="button"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
            <button
              aria-label="설정"
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[var(--datelog-theme)]"
              onClick={() => setSettingsOpen(true)}
              type="button"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10.3 4.3a1.8 1.8 0 013.4 0l.2.9a1.8 1.8 0 002.5 1l.8-.4a1.8 1.8 0 012.4 2.4l-.4.8a1.8 1.8 0 001 2.5l.9.2a1.8 1.8 0 010 3.4l-.9.2a1.8 1.8 0 00-1 2.5l.4.8a1.8 1.8 0 01-2.4 2.4l-.8-.4a1.8 1.8 0 00-2.5 1l-.2.9a1.8 1.8 0 01-3.4 0l-.2-.9a1.8 1.8 0 00-2.5-1l-.8.4a1.8 1.8 0 01-2.4-2.4l.4-.8a1.8 1.8 0 00-1-2.5l-.9-.2a1.8 1.8 0 010-3.4l.9-.2a1.8 1.8 0 001-2.5l-.4-.8a1.8 1.8 0 012.4-2.4l.8.4a1.8 1.8 0 002.5-1l.2-.9z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </header>

        <section className="mb-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <button
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => changeMonth(-1)}
              type="button"
            >
              ◀
            </button>
            <h2 className="text-2xl text-gray-800">{formatMonth(monthDate)}</h2>
            <button
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => changeMonth(1)}
              type="button"
            >
              ▶
            </button>
          </div>
          <CalendarGrid
            labels={mockSettings.labels}
            logs={mockLogs}
            monthDate={monthDate}
            onSelectDate={setSelectedDate}
            schedules={mockSchedules}
            selectedDate={selectedDate}
          />
        </section>

        <section className="mb-5 rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
          <h2 className="mb-2 text-lg text-yellow-700">📅 오늘의 일정</h2>
          <div className="space-y-1 text-sm text-gray-600">
            {todaySchedules.length ? (
              todaySchedules.map((schedule) => (
                <div className="flex items-center gap-2" key={schedule.id}>
                  <span className="h-2 w-2 rounded-full bg-[var(--datelog-theme)]" />
                  <span>
                    {schedule.time} {schedule.title}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">오늘 등록된 일정이 없습니다.</p>
            )}
          </div>
        </section>

        <section className="flex-1 rounded-2xl border border-pink-100 bg-pink-50/40 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl">{formatReadableDate(selectedDate)}의 기록</h2>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--datelog-theme)] text-3xl leading-none text-white shadow-lg transition hover:scale-105"
              onClick={() => setEntryOpen(true)}
              type="button"
            >
              +
            </button>
          </div>

          <div className="space-y-4">
            {selectedSchedules.map((schedule) => (
              <article
                className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                key={schedule.id}
              >
                <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  {schedule.time} · {schedule.label}
                </div>
                <h3 className="text-lg text-gray-800">{schedule.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{schedule.memo}</p>
              </article>
            ))}

            {selectedLogs.map((log) => (
              <article
                className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                key={log.id}
              >
                <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">{mockSettings.myName}</p>
                    <StarLine value={log.ratingMy} />
                  </div>
                  <div>
                    <p className="text-gray-400">{mockSettings.partnerName}</p>
                    <StarLine value={log.ratingPartner} />
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{log.reviewMy}</p>
                  <p>{log.reviewPartner}</p>
                </div>
                {log.photos.length ? (
                  <div className="mt-4 space-y-3">
                    {log.photos.map((photo) => (
                      <div className="overflow-hidden rounded-2xl bg-gray-50" key={photo.id}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={photo.location}
                          className="h-44 w-full object-cover"
                          src={photo.url}
                        />
                        <div className="space-y-1 p-3 text-sm text-gray-600">
                          <p className="text-gray-400">📍 {photo.location}</p>
                          <p>{photo.myComment}</p>
                          <p>{photo.partnerComment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {!selectedSchedules.length && !selectedLogs.length ? (
              <div className="rounded-2xl border border-dashed border-pink-200 bg-white/70 p-6 text-center text-sm text-gray-400">
                아직 이 날의 일정이나 기록이 없습니다.
              </div>
            ) : null}
          </div>
        </section>

        <EntryModal
          labels={mockSettings.labels}
          onClose={() => setEntryOpen(false)}
          open={entryOpen}
          selectedDate={selectedDate}
          settings={mockSettings}
        />
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          open={settingsOpen}
          settings={mockSettings}
        />
      </div>
    </main>
  );
}
