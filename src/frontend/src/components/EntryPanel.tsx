import { Filter, PenLine, Plus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { DiaryEntry } from "../backend";
import { useGetAllEntries, useGetEntriesByDate } from "../hooks/useQueries";
import EntryCard from "./EntryCard";

const MOODS = [
  { label: "Happy", emoji: "😊" },
  { label: "Sad", emoji: "😢" },
  { label: "Anxious", emoji: "😰" },
  { label: "Calm", emoji: "🧘" },
  { label: "Excited", emoji: "🎉" },
  { label: "Grateful", emoji: "🙏" },
  { label: "Angry", emoji: "😠" },
  { label: "Reflective", emoji: "🤔" },
];

function parseDateStr(dateStr: string): Date {
  const y = Number.parseInt(dateStr.slice(0, 4));
  const m = Number.parseInt(dateStr.slice(4, 6)) - 1;
  const d = Number.parseInt(dateStr.slice(6, 8));
  return new Date(y, m, d);
}

function friendlyDate(dateStr: string): string {
  const d = parseDateStr(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  selectedDate: string;
  filterMood: string;
  filterTag: string;
  onFilterMoodChange: (v: string) => void;
  onFilterTagChange: (v: string) => void;
  onNewEntry: () => void;
  onEditEntry: (entry: DiaryEntry) => void;
}

export default function EntryPanel({
  selectedDate,
  filterMood,
  filterTag,
  onFilterMoodChange,
  onFilterTagChange,
  onNewEntry,
  onEditEntry,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const isFiltering = !!filterMood || !!filterTag;

  const { data: dateEntries = [], isLoading: dateLoading } =
    useGetEntriesByDate(selectedDate);
  const { data: allEntries = [], isLoading: allLoading } = useGetAllEntries();

  const displayEntries: DiaryEntry[] = isFiltering
    ? allEntries.filter((e) => {
        const moodMatch = !filterMood || e.mood === filterMood;
        const tagMatch =
          !filterTag ||
          e.tags.some((t) => t.toLowerCase().includes(filterTag.toLowerCase()));
        return moodMatch && tagMatch;
      })
    : dateEntries;

  const isLoading = isFiltering ? allLoading : dateLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            {isFiltering ? (
              <>
                <h1 className="font-display text-xl font-bold text-foreground">
                  Filtered Entries
                </h1>
                <p className="text-sm text-muted-foreground">
                  {displayEntries.length} result
                  {displayEntries.length !== 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display text-xl font-bold text-foreground">
                  {friendlyDate(selectedDate)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {dateEntries.length === 0
                    ? "No entries yet"
                    : `${dateEntries.length} entr${dateEntries.length !== 1 ? "ies" : "y"}`}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="entries.filter.toggle"
              onClick={() => setShowFilters((v) => !v)}
              className={[
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                showFilters || isFiltering
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-muted-foreground",
              ].join(" ")}
              aria-label="Toggle filters"
            >
              <Filter size={16} />
            </button>
            <button
              type="button"
              data-ocid="entries.new_entry.button"
              onClick={onNewEntry}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus size={16} />
              New Entry
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-muted-foreground" />
                  <select
                    data-ocid="entries.mood.select"
                    value={filterMood}
                    onChange={(e) => onFilterMoodChange(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All moods</option>
                    {MOODS.map((m) => (
                      <option key={m.label} value={m.label}>
                        {m.emoji} {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  data-ocid="entries.tag.search_input"
                  type="text"
                  value={filterTag}
                  onChange={(e) => onFilterTagChange(e.target.value)}
                  placeholder="Filter by tag..."
                  className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-40"
                />
                {isFiltering && (
                  <button
                    type="button"
                    data-ocid="entries.clear_filters.button"
                    onClick={() => {
                      onFilterMoodChange("");
                      onFilterTagChange("");
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {isLoading ? (
          <div data-ocid="entries.loading_state" className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-5 shadow-card border border-border/50 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : displayEntries.length === 0 ? (
          <motion.div
            data-ocid="entries.empty_state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <PenLine size={24} className="text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              {isFiltering
                ? "No entries match your filters"
                : "No entries yet for this day"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {isFiltering
                ? "Try adjusting your mood or tag filters."
                : "Start writing to capture your thoughts, feelings, and memories."}
            </p>
            {!isFiltering && (
              <button
                type="button"
                data-ocid="entries.empty_state.new_entry.button"
                onClick={onNewEntry}
                className="mt-6 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Write your first entry
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {displayEntries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: idx * 0.05 }}
                data-ocid={`entries.item.${idx + 1}`}
              >
                <EntryCard
                  entry={entry}
                  onEdit={onEditEntry}
                  showDate={isFiltering}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div className="h-16" />
      </div>
    </div>
  );
}
