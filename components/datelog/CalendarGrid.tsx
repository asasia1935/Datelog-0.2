"use client";

import type { Label, LogEntry, Schedule } from "./types";

type CalendarGridProps = {
  monthDate: Date;
  selectedDate: string;
  schedules: Schedule[];
  logs: LogEntry[];
  labels: Label[];
  onSelectDate: (dateKey: string) => void;
};

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

export default function CalendarGrid({
  monthDate,
  selectedDate,
  schedules,
  logs,
  labels,
  onSelectDate,
}: CalendarGridProps) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + lastDate }, (_, index) => {
    if (index < firstDay) return null;
    return index - firstDay + 1;
  });

  const labelColor = (labelName: string) =>
    labels.find((label) => label.name === labelName)?.color ?? "#D1D5DB";

  return (
    <section aria-label="데이트 캘린더">
      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-sm text-gray-400">
        {weekDays.map((day, index) => (
          <div
            className={
              index === 0
                ? "text-red-400"
                : index === 6
                  ? "text-sky-400"
                  : undefined
            }
            key={day}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) {
            return <div className="aspect-square" key={`empty-${index}`} />;
          }

          const dateKey = formatDateKey(year, month, day);
          const daySchedules = schedules.filter((item) => item.date === dateKey);
          const hasLog = logs.some((item) => item.date === dateKey);
          const isSelected = selectedDate === dateKey;

          return (
            <button
              className={`flex aspect-square flex-col items-center rounded-lg border p-1 text-left transition ${
                isSelected
                  ? "border-[var(--datelog-theme)] bg-[var(--datelog-theme)] text-white shadow-md"
                  : "border-pink-50 bg-white text-gray-700 hover:bg-pink-50"
              }`}
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              type="button"
            >
              <span className="text-base leading-5">{day}</span>
              <span className="mt-auto flex max-w-full flex-wrap justify-center gap-0.5">
                {hasLog ? (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-[var(--datelog-theme)]"
                    }`}
                  />
                ) : null}
                {daySchedules.slice(0, 3).map((schedule) => (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    key={schedule.id}
                    style={{ backgroundColor: labelColor(schedule.label) }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
