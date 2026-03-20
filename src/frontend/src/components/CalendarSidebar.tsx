import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useGetAllDatesWithEntries } from "../hooks/useQueries";

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
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
];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}${String(month + 1).padStart(2, "0")}${String(day).padStart(2, "0")}`;
}

function todayStr(): string {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function CalendarSidebar({ selectedDate, onSelectDate }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const { data: datesWithEntries = [] } = useGetAllDatesWithEntries();
  const entryDateSet = new Set(datesWithEntries);
  const todayDateStr = todayStr();

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-ocid="calendar.pagination_prev"
          onClick={prevMonth}
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} className="text-muted-foreground" />
        </button>
        <h2 className="font-display text-sm font-semibold text-foreground">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h2>
        <button
          type="button"
          data-ocid="calendar.pagination_next"
          onClick={nextMonth}
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, idx) => {
          if (day === null) {
            // biome-ignore lint/suspicious/noArrayIndexKey: empty cells have no better key
            return <div key={`empty-${idx}`} />;
          }
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayDateStr;
          const hasEntries = entryDateSet.has(dateStr);

          return (
            <button
              type="button"
              key={dateStr}
              data-ocid="calendar.day.button"
              onClick={() => onSelectDate(dateStr)}
              className={[
                "relative flex flex-col items-center justify-center w-full aspect-square rounded-full text-xs font-medium transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isToday
                    ? "bg-muted text-foreground font-semibold"
                    : "hover:bg-secondary text-foreground",
              ].join(" ")}
            >
              <span>{day}</span>
              {hasEntries && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
              {hasEntries && isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Today button */}
      <button
        type="button"
        data-ocid="calendar.today.button"
        onClick={() => {
          const d = new Date();
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
          onSelectDate(todayDateStr);
        }}
        className="w-full text-xs font-medium text-primary hover:text-primary/80 py-1 transition-colors"
      >
        Go to today
      </button>
    </div>
  );
}
