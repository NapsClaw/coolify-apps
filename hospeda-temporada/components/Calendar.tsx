"use client";

import { useState, useMemo } from "react";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface CalendarProps {
  blockedDates: Set<string>;
  pendingDates?: Set<string>;
  selectedStart: string | null;
  selectedEnd: string | null;
  onSelectDay: (dateStr: string) => void;
  mode?: "select" | "view";
}

function formatDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function isInRange(
  dateStr: string,
  start: string | null,
  end: string | null
): boolean {
  if (!start || !end) return false;
  return dateStr > start && dateStr < end;
}

export default function Calendar({
  blockedDates,
  pendingDates = new Set(),
  selectedStart,
  selectedEnd,
  onSelectDay,
  mode = "select",
}: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayStr = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  function getDayClass(day: number): string {
    const dateStr = formatDate(viewYear, viewMonth, day);
    const isPast = dateStr < todayStr;
    const isBlocked = blockedDates.has(dateStr);
    const isPending = pendingDates.has(dateStr);
    const isStart = dateStr === selectedStart;
    const isEnd = dateStr === selectedEnd;
    const isRange = isInRange(dateStr, selectedStart, selectedEnd);

    const base =
      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-sans transition-all";

    if (isPast) {
      return `${base} text-[#d4c9b8] line-through cursor-default`;
    }
    if (isBlocked) {
      return `${base} bg-[#ef4444]/15 text-[#ef4444] line-through cursor-not-allowed`;
    }
    if (isPending) {
      return `${base} bg-yellow-100 text-yellow-700 cursor-default`;
    }
    if (isStart || isEnd) {
      return `${base} bg-[#AC4747] text-white font-bold cursor-pointer`;
    }
    if (isRange) {
      return `${base} bg-[#AC4747]/15 text-[#AC4747] cursor-pointer`;
    }
    // Free day
    if (mode === "select") {
      return `${base} hover:bg-[#AC4747]/10 text-[#1a1410] cursor-pointer`;
    }
    return `${base} text-[#1a1410] cursor-default`;
  }

  function handleDayClick(day: number) {
    if (mode !== "select") return;
    const dateStr = formatDate(viewYear, viewMonth, day);
    if (dateStr < todayStr) return;
    if (blockedDates.has(dateStr)) return;
    if (pendingDates.has(dateStr)) return;
    onSelectDay(dateStr);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F7F2EB] text-[#5a4f45] transition-colors"
          aria-label="Mês anterior"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-serif text-lg text-[#1a1410]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F7F2EB] text-[#5a4f45] transition-colors"
          aria-label="Próximo mês"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-sans font-semibold text-[#5a4f45] py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <div key={day} className="flex items-center justify-center">
              <button
                onClick={() => handleDayClick(day)}
                className={getDayClass(day)}
                disabled={
                  mode !== "select" ||
                  formatDate(viewYear, viewMonth, day) < todayStr ||
                  blockedDates.has(formatDate(viewYear, viewMonth, day)) ||
                  pendingDates.has(formatDate(viewYear, viewMonth, day))
                }
              >
                {day}
              </button>
            </div>
          )
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 text-xs font-sans text-[#5a4f45]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          Livre
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          Reservado
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#AC4747]" />
          Selecionado
        </div>
      </div>
    </div>
  );
}
