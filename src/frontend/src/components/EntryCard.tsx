import {
  ChevronDown,
  ChevronUp,
  Clock,
  Music,
  Pencil,
  Trash2,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DiaryEntry } from "../backend";
import { usePhotoStorage } from "../hooks/usePhotoStorage";
import { useDeleteEntry } from "../hooks/useQueries";

interface Props {
  entry: DiaryEntry;
  onEdit: (entry: DiaryEntry) => void;
  showDate?: boolean;
}

function formatTime(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDateFromStr(dateStr: string): string {
  const y = Number.parseInt(dateStr.slice(0, 4));
  const m = Number.parseInt(dateStr.slice(4, 6)) - 1;
  const d = Number.parseInt(dateStr.slice(6, 8));
  return new Date(y, m, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EntryCard({ entry, onEdit, showDate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: deleteEntry, isPending: isDeleting } = useDeleteEntry();
  const { getPhotoUrl } = usePhotoStorage();

  const isLong = entry.content.length > 200;
  const displayContent =
    expanded || !isLong ? entry.content : `${entry.content.slice(0, 200)}...`;

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteEntry(
      { entryId: entry.id, date: entry.date },
      {
        onSuccess: () => toast.success("Entry deleted"),
        onError: () => toast.error("Failed to delete entry"),
      },
    );
  };

  return (
    <article className="bg-card rounded-2xl shadow-card border border-border/50 p-5 space-y-3 hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>{formatTime(entry.timestamp)}</span>
          </div>
          {showDate && (
            <span className="text-xs text-muted-foreground">
              {formatDateFromStr(entry.date)}
            </span>
          )}
          {entry.mood && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <span>{entry.moodEmoji}</span>
              <span>{entry.mood}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            data-ocid="entries.edit_button"
            onClick={() => onEdit(entry)}
            className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Edit entry"
          >
            <Pencil size={13} className="text-muted-foreground" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                data-ocid="entries.delete_confirm.button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 py-1 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isDeleting ? "..." : "Delete"}
              </button>
              <button
                type="button"
                data-ocid="entries.delete_cancel.button"
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-ocid="entries.delete_button"
              onClick={handleDelete}
              className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors"
              aria-label="Delete entry"
            >
              <Trash2
                size={13}
                className="text-muted-foreground hover:text-destructive"
              />
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-medium border border-accent/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {displayContent}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Photos */}
      {entry.photoBlobIds.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {entry.photoBlobIds.map((blobId) => {
            const url = getPhotoUrl(blobId);
            return url ? (
              <a
                key={blobId}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={url}
                  alt="Diary entry attachment"
                  className="w-full h-24 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              </a>
            ) : null;
          })}
        </div>
      )}

      {/* Videos */}
      {entry.videoBlobIds.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Video size={12} />
            <span>Videos</span>
          </div>
          {entry.videoBlobIds.map((blobId) => {
            const url = getPhotoUrl(blobId);
            return url ? (
              // biome-ignore lint/a11y/useMediaCaption: user-uploaded personal video, captions not applicable
              <video
                key={blobId}
                controls
                className="w-full rounded-lg border border-border bg-black/5"
                src={url}
              />
            ) : null;
          })}
        </div>
      )}

      {/* Audio */}
      {entry.audioBlobIds.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Music size={12} />
            <span>Audio</span>
          </div>
          {entry.audioBlobIds.map((blobId, idx) => {
            const url = getPhotoUrl(blobId);
            return url ? (
              <div
                key={blobId}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-background/50"
              >
                <Music
                  size={14}
                  className="text-muted-foreground flex-shrink-0"
                />
                {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded personal audio, captions not applicable */}
                <audio controls className="flex-1 h-8 min-w-0" src={url} />
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  #{idx + 1}
                </span>
              </div>
            ) : null;
          })}
        </div>
      )}
    </article>
  );
}
