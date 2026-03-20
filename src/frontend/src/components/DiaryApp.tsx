import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import type { DiaryEntry } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import CalendarSidebar from "./CalendarSidebar";
import EntryFormModal from "./EntryFormModal";
import EntryPanel from "./EntryPanel";

function formatDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export default function DiaryApp() {
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatDateString(new Date()),
  );
  const [filterMood, setFilterMood] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "";

  return (
    <div className="flex h-screen bg-background paper-texture overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 xl:w-80 flex-shrink-0 border-r border-border flex flex-col bg-sidebar overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <img
            src="/assets/generated/tree-icon-transparent.dim_80x80.png"
            alt="Heartwood"
            className="w-8 h-8 object-contain"
          />
          <span className="font-display text-lg font-semibold text-foreground">
            Heartwood
          </span>
        </div>

        <div className="flex-1 p-4">
          <CalendarSidebar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p
                className="text-sm font-medium text-foreground truncate"
                title={principal}
              >
                {shortPrincipal || "Anonymous"}
              </p>
            </div>
            <button
              type="button"
              data-ocid="user.logout.button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Connection loading notice */}
        {!actor && isFetching && (
          <div className="mx-4 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <RefreshCw size={14} className="flex-shrink-0 animate-spin" />
            <span>Connecting to your journal...</span>
          </div>
        )}
        <EntryPanel
          selectedDate={selectedDate}
          filterMood={filterMood}
          filterTag={filterTag}
          onFilterMoodChange={setFilterMood}
          onFilterTagChange={setFilterTag}
          onNewEntry={handleNewEntry}
          onEditEntry={handleEditEntry}
        />
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-10">
        <div className="max-w-6xl mx-auto px-6 pb-3 flex justify-end">
          <p className="text-xs text-muted-foreground pointer-events-auto">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      {isFormOpen && (
        <EntryFormModal
          editingEntry={editingEntry}
          defaultDate={selectedDate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
