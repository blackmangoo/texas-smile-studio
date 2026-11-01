"use client";

import React, { useState, useMemo, useCallback } from "react";

interface ElegantCalendarPickerProps {
  value: string; // ISO format "YYYY-MM-DD"
  onChange: (dateIso: string) => void;
  minDateIso?: string;
  maxMonthsAhead?: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIsoString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatPrettyDate(iso: string): string {
  try {
    const d = parseIso(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ElegantCalendarPicker({
  value,
  onChange,
  minDateIso,
  maxMonthsAhead = 5,
}: ElegantCalendarPickerProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minDate = useMemo(() => {
    if (minDateIso) {
      const d = parseIso(minDateIso);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const d = new Date(today);
    d.setDate(d.getDate() + 1); // Earliest is tomorrow
    return d;
  }, [minDateIso, today]);

  const initialViewDate = useMemo(() => {
    if (value) {
      const parsed = parseIso(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return minDate;
  }, [value, minDate]);

  const [viewYear, setViewYear] = useState<number>(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialViewDate.getMonth());

  // Limit back-navigation: cannot navigate earlier than minDate's month
  const canGoPrev = useMemo(() => {
    const currentViewStart = new Date(viewYear, viewMonth, 1);
    const minMonthStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    return currentViewStart > minMonthStart;
  }, [viewYear, viewMonth, minDate]);

  // Limit forward navigation
  const canGoNext = useMemo(() => {
    const currentViewStart = new Date(viewYear, viewMonth, 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + maxMonthsAhead, 1);
    return currentViewStart < maxDate;
  }, [viewYear, viewMonth, today, maxMonthsAhead]);

  const handlePrevMonth = useCallback(() => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [canGoPrev, viewMonth]);

  const handleNextMonth = useCallback(() => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [canGoNext, viewMonth]);

  // Calendar cells generation (Monday start)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday is 0, Sunday is 6
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

    const cells: {
      day: number | null;
      iso: string;
      isDisabled: boolean;
      isSunday: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Leading empty spacers
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({
        day: null,
        iso: `pad-${i}`,
        isDisabled: true,
        isSunday: false,
        isToday: false,
        isSelected: false,
      });
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(viewYear, viewMonth, day);
      cellDate.setHours(0, 0, 0, 0);

      const isSunday = cellDate.getDay() === 0;
      const isPastOrBlocked = cellDate < minDate;
      const isDisabled = isPastOrBlocked || isSunday; // Clinic closed on Sundays
      const iso = toIsoString(cellDate);
      const isToday = cellDate.getTime() === today.getTime();
      const isSelected = value === iso;

      cells.push({
        day,
        iso,
        isDisabled,
        isSunday,
        isToday,
        isSelected,
      });
    }

    return cells;
  }, [viewYear, viewMonth, minDate, today, value]);

  // Quick preset actions
  const selectQuickPreset = useCallback(
    (offsetDays: number) => {
      const target = new Date(today);
      target.setDate(target.getDate() + offsetDays);
      // If Sunday, push to Monday
      if (target.getDay() === 0) {
        target.setDate(target.getDate() + 1);
      }
      const iso = toIsoString(target);
      onChange(iso);
      setViewYear(target.getFullYear());
      setViewMonth(target.getMonth());
    },
    [today, onChange]
  );

  return (
    <div className="w-full rounded-2xl border border-[#E6E0D6] bg-[#FFFDFA] p-4 sm:p-5 shadow-xs select-none">
      {/* Quick Presets Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E0D6]/80 pb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A6631]">
          Select Studio Date
        </span>
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => selectQuickPreset(1)}
            className="rounded-full bg-[#F6F3EE] px-3 py-1 font-medium text-[#13232C] hover:bg-[#DCEFEC] hover:text-[#0F5F6E] transition-colors cursor-pointer"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => selectQuickPreset(3)}
            className="rounded-full bg-[#F6F3EE] px-3 py-1 font-medium text-[#13232C] hover:bg-[#DCEFEC] hover:text-[#0F5F6E] transition-colors cursor-pointer"
          >
            In 3 Days
          </button>
          <button
            type="button"
            onClick={() => selectQuickPreset(7)}
            className="rounded-full bg-[#F6F3EE] px-3 py-1 font-medium text-[#13232C] hover:bg-[#DCEFEC] hover:text-[#0F5F6E] transition-colors cursor-pointer hidden sm:inline-block"
          >
            Next Week
          </button>
        </div>
      </div>

      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="font-serif text-lg sm:text-xl font-normal tracking-tight text-[#13232C]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            aria-label="Previous Month"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E6E0D6] bg-[#F6F3EE] text-[#13232C] hover:bg-[#0F5F6E] hover:text-[#FFFDFA] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            aria-label="Next Month"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E6E0D6] bg-[#F6F3EE] text-[#13232C] hover:bg-[#0F5F6E] hover:text-[#FFFDFA] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAY_LABELS.map((d, i) => (
          <div
            key={d}
            className={`py-1 text-[11px] font-semibold uppercase tracking-wider ${
              i === 6 ? "text-[#A84A33]/70" : "text-[#4B5D66]"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((cell, idx) => {
          if (!cell.day) {
            return <div key={cell.iso} className="h-9 sm:h-10" aria-hidden="true" />;
          }

          if (cell.isDisabled) {
            return (
              <div
                key={cell.iso}
                className="flex h-9 sm:h-10 items-center justify-center text-xs text-[#13232C]/25 cursor-not-allowed"
                title={cell.isSunday ? "Studio closed on Sundays" : "Date unavailable"}
              >
                {cell.day}
              </div>
            );
          }

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onChange(cell.iso)}
              aria-label={`Select ${formatPrettyDate(cell.iso)}`}
              aria-pressed={cell.isSelected}
              className={`relative flex h-9 sm:h-10 w-full items-center justify-center rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                cell.isSelected
                  ? "bg-[#0F5F6E] text-[#FFFDFA] font-semibold shadow-sm ring-2 ring-[#C8A26B]/50 scale-[1.03]"
                  : "bg-[#F6F3EE]/50 text-[#13232C] hover:bg-[#DCEFEC] hover:text-[#0F5F6E]"
              }`}
            >
              <span>{cell.day}</span>
              {/* Subtle availability dot */}
              {!cell.isSelected && (
                <span
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-[#0F5F6E]/40"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Summary & Concierge Note */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-[#F6F3EE] p-2.5 sm:px-3.5 border border-[#E6E0D6]/80 text-xs">
        <div className="flex items-center gap-2 text-[#13232C]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F5F6E] text-[#FFFDFA] text-[10px] font-bold">
            ✓
          </span>
          <span className="font-medium">
            Selected:{" "}
            <span className="font-semibold text-[#0F5F6E]">
              {formatPrettyDate(value)}
            </span>
          </span>
        </div>
        <span className="text-[11px] text-[#4B5D66] sm:text-right">
          Suites reserved 1-at-a-time · Uptown Dallas
        </span>
      </div>
    </div>
  );
}
