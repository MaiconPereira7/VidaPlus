import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toISODate, daysInMonth, firstWeekdayOfMonth, todayISO } from "../lib/dates";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
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

export default function MiniCalendar({ selectedDate, onSelectDate, colorsByDate }) {
  const [cursor, setCursor] = useState(() => {
    const [y, m] = selectedDate.split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  const today = todayISO();
  const numDays = daysInMonth(cursor.year, cursor.month);
  const firstWeekday = firstWeekdayOfMonth(cursor.year, cursor.month);

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= numDays; day++) cells.push(day);

  function changeMonth(delta) {
    setCursor((c) => {
      let month = c.month + delta;
      let year = c.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  }

  function dateForDay(day) {
    return toISODate(new Date(cursor.year, cursor.month, day));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          className="rounded-lg p-1.5 text-text-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <span className="text-base font-semibold text-text-primary">
          {MONTHS[cursor.month]} {cursor.year}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="rounded-lg p-1.5 text-text-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          aria-label="Próximo mês"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center md:gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const iso = dateForDay(day);
          const isSelected = iso === selectedDate;
          const isToday = iso === today;
          const colors = colorsByDate?.get(iso) || [];
          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              className={`relative flex h-9 items-center justify-center rounded-xl text-sm font-medium transition-colors md:h-12 ${
                isSelected
                  ? "bg-accent text-white"
                  : isToday
                  ? "text-accent ring-2 ring-accent/30"
                  : "text-text-primary hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              }`}
              style={
                colors.length > 0 && !isSelected
                  ? { boxShadow: `inset 0 -2px 0 0 ${colors[0]}` }
                  : undefined
              }
            >
              {day}
              {colors.length > 1 && (
                <span className="absolute bottom-1 flex items-center gap-0.5">
                  {colors.slice(1, 3).map((c, idx) => (
                    <span
                      key={idx}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: isSelected ? "#fff" : c }}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
