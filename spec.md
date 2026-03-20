# Heartwood Journal

## Current State
New project with no existing application files.

## Requested Changes (Diff)

### Add
- Multi-user authentication so each user has their own private diary
- Diary entry model: text content, date, mood (emoji + label), tags (array of strings), photo attachments
- Calendar view for navigating entries by date; dates with entries are highlighted, empty dates are blank
- Multiple entries per date shown in chronological order
- Entry creation form with: text editor, mood picker, tag input, photo upload
- Entry detail/view per selected date
- Filter/browse entries by mood or tag
- Photo attachment storage for diary images

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan
1. Select `authorization` and `blob-storage` components
2. Generate Motoko backend with:
   - User-scoped diary entries stored per principal
   - Entry type: id, date (YYYYMMDD text), timestamp, text content, mood (label + emoji), tags, photo blob IDs
   - CRUD operations: createEntry, getEntriesByDate, getAllEntries, updateEntry, deleteEntry
   - Entries are private per user (filtered by caller principal)
3. Frontend:
   - Auth login/register gate
   - Main layout: sidebar calendar + entry panel
   - Calendar: monthly grid, highlight days with entries, click to select date
   - Entry list: chronological list for selected date
   - New entry form: text area, mood picker (emoji set), tag chips input, photo upload
   - Entry viewer: display full entry with photos, mood, tags
   - Filter bar: filter by mood or tag across all entries
   - Warm cozy visual style: paper-texture background, earthy tones, rounded cards
