import { Image, Loader2, Plus, Tag, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { DiaryEntry } from "../backend";
import { usePhotoStorage } from "../hooks/usePhotoStorage";
import { useCreateEntry, useUpdateEntry } from "../hooks/useQueries";

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

function formatDateInput(dateStr: string): string {
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

function parseDateInput(inputVal: string): string {
  return inputVal.replace(/-/g, "");
}

interface Props {
  editingEntry: DiaryEntry | null;
  defaultDate: string;
  onClose: () => void;
}

export default function EntryFormModal({
  editingEntry,
  defaultDate,
  onClose,
}: Props) {
  const [date, setDate] = useState(editingEntry?.date ?? defaultDate);
  const [content, setContent] = useState(editingEntry?.content ?? "");
  const [selectedMood, setSelectedMood] = useState(editingEntry?.mood ?? "");
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState(
    editingEntry?.moodEmoji ?? "",
  );
  const [tags, setTags] = useState<string[]>(editingEntry?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [photoBlobIds, setPhotoBlobIds] = useState<string[]>(
    editingEntry?.photoBlobIds ?? [],
  );
  const [uploadingPhotos, setUploadingPhotos] = useState<
    { name: string; progress: number }[]
  >([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<
    { blobId: string; previewUrl: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createEntry, isPending: isCreating } = useCreateEntry();
  const { mutate: updateEntry, isPending: isUpdating } = useUpdateEntry();
  const { uploadPhoto, getPhotoUrl } = usePhotoStorage();

  const isSaving = isCreating || isUpdating;

  const handleMoodSelect = (mood: { label: string; emoji: string }) => {
    if (selectedMood === mood.label) {
      setSelectedMood("");
      setSelectedMoodEmoji("");
    } else {
      setSelectedMood(mood.label);
      setSelectedMoodEmoji(mood.emoji);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#+/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handlePhotoUpload = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const uploadEntry = { name: file.name, progress: 0 };
        setUploadingPhotos((prev) => [...prev, uploadEntry]);
        const previewUrl = URL.createObjectURL(file);
        try {
          const hash = await uploadPhoto(file, (pct) => {
            setUploadingPhotos((prev) =>
              prev.map((u) =>
                u.name === file.name ? { ...u, progress: pct } : u,
              ),
            );
          });
          setPhotoBlobIds((prev) => [...prev, hash]);
          setPhotoPreviewUrls((prev) => [
            ...prev,
            { blobId: hash, previewUrl },
          ]);
          toast.success("Attachment uploaded");
        } catch {
          toast.error(`Failed to upload ${file.name}`);
          URL.revokeObjectURL(previewUrl);
        } finally {
          setUploadingPhotos((prev) =>
            prev.filter((u) => u.name !== file.name),
          );
        }
      }
    },
    [uploadPhoto],
  );

  const handleRemovePhoto = (blobId: string) => {
    setPhotoBlobIds((prev) => prev.filter((id) => id !== blobId));
    const preview = photoPreviewUrls.find((p) => p.blobId === blobId);
    if (preview) URL.revokeObjectURL(preview.previewUrl);
    setPhotoPreviewUrls((prev) => prev.filter((p) => p.blobId !== blobId));
  };

  const handleSave = () => {
    if (!content.trim()) {
      toast.error("Please write something before saving.");
      return;
    }
    const entryDate = parseDateInput(date) || defaultDate;
    const timestamp = BigInt(Date.now()) * BigInt(1_000_000);

    if (editingEntry) {
      const updated: DiaryEntry = {
        ...editingEntry,
        content: content.trim(),
        date: entryDate,
        mood: selectedMood,
        moodEmoji: selectedMoodEmoji,
        tags,
        photoBlobIds,
      };
      updateEntry(updated, {
        onSuccess: () => {
          toast.success("Entry updated!");
          onClose();
        },
        onError: (err: Error) =>
          toast.error(err.message || "Failed to update entry"),
      });
    } else {
      const newEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        content: content.trim(),
        date: entryDate,
        mood: selectedMood,
        moodEmoji: selectedMoodEmoji,
        tags,
        photoBlobIds,
        timestamp,
      };
      createEntry(newEntry, {
        onSuccess: () => {
          toast.success("Entry saved!");
          onClose();
        },
        onError: (err: Error) =>
          toast.error(err.message || "Failed to save entry"),
      });
    }
  };

  const fieldClass =
    "text-xs font-semibold text-muted-foreground uppercase tracking-wide";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          data-ocid="entry_form.modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-card rounded-3xl shadow-card-hover border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display text-lg font-bold text-foreground">
              {editingEntry ? "Edit Entry" : "New Entry"}
            </h2>
            <button
              type="button"
              data-ocid="entry_form.close_button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="entry-date" className={fieldClass}>
                Date
              </label>
              <input
                id="entry-date"
                data-ocid="entry_form.date.input"
                type="date"
                value={formatDateInput(date)}
                onChange={(e) => setDate(parseDateInput(e.target.value))}
                className="w-full border border-border rounded-xl px-4 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label htmlFor="entry-content" className={fieldClass}>
                Your thoughts
              </label>
              <textarea
                id="entry-content"
                data-ocid="entry_form.content.textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today?"
                rows={6}
                className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Mood picker */}
            <div className="space-y-2">
              <p className={fieldClass}>How are you feeling?</p>
              <div className="grid grid-cols-4 gap-2">
                {MOODS.map((mood) => (
                  <button
                    type="button"
                    key={mood.label}
                    data-ocid="entry_form.mood.button"
                    onClick={() => handleMoodSelect(mood)}
                    aria-pressed={selectedMood === mood.label}
                    className={[
                      "flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-xs font-medium transition-all",
                      selectedMood === mood.label
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-secondary text-foreground",
                    ].join(" ")}
                  >
                    <span className="text-xl">{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <p className={`${fieldClass} flex items-center gap-1`}>
                <Tag size={12} />
                Tags
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-medium border border-accent/20"
                  >
                    #{tag}
                    <button
                      type="button"
                      data-ocid="entry_form.tag.remove.button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="hover:text-destructive transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <label htmlFor="entry-tag" className="sr-only">
                  Add tag
                </label>
                <input
                  id="entry-tag"
                  data-ocid="entry_form.tag.input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 border border-border rounded-xl px-4 py-2 bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  data-ocid="entry_form.tag.add.button"
                  onClick={handleAddTag}
                  aria-label="Add tag"
                  className="px-3 py-2 rounded-xl border border-border bg-secondary hover:bg-muted transition-colors"
                >
                  <Plus size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <p className={`${fieldClass} flex items-center gap-1`}>
                <Image size={12} />
                Attachments
              </p>

              {photoBlobIds.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {photoBlobIds.map((blobId) => {
                    const preview = photoPreviewUrls.find(
                      (p) => p.blobId === blobId,
                    );
                    const url = preview?.previewUrl || getPhotoUrl(blobId);
                    return url ? (
                      <div key={blobId} className="relative group">
                        <img
                          src={url}
                          alt="Attached media"
                          className="w-full h-20 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          data-ocid="entry_form.photo.remove.button"
                          onClick={() => handleRemovePhoto(blobId)}
                          aria-label="Remove attachment"
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {uploadingPhotos.map((u) => (
                <div
                  key={u.name}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Loader2 size={12} className="animate-spin" />
                  <span>{u.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-all"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                  <span>{u.progress}%</span>
                </div>
              ))}

              <button
                type="button"
                data-ocid="entry_form.photo.upload_button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Upload size={20} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to attach media
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, GIF up to 10MB each
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                aria-label="Upload attachments"
                onChange={(e) => {
                  if (e.target.files) handlePhotoUpload(e.target.files);
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
            <button
              type="button"
              data-ocid="entry_form.cancel.button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-border bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              data-ocid="entry_form.save.submit_button"
              onClick={handleSave}
              disabled={isSaving || uploadingPhotos.length > 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isSaving
                ? "Saving..."
                : editingEntry
                  ? "Save Changes"
                  : "Save Entry"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
