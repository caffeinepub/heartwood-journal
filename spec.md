# Heartwood Journal

## Current State
- Multi-user diary app with authorization and blob-storage components
- DiaryEntry has: id, date, timestamp, content, mood, moodEmoji, tags, photoBlobIds
- Frontend supports photo uploads per entry, playable inline

## Requested Changes (Diff)

### Add
- `videoBlobIds: [Text]` field to DiaryEntry in backend
- `audioBlobIds: [Text]` field to DiaryEntry in backend
- Video upload support in frontend (MP4, MOV, WebM, AVI)
- Audio upload support in frontend (MP3, WAV, AAC, OGG, M4A)
- Inline video player per entry (HTML5 video element)
- Inline audio player per entry (HTML5 audio element)

### Modify
- DiaryEntry type to include videoBlobIds and audioBlobIds
- Entry creation/editing UI to allow attaching video and audio files
- Entry view to display/play video and audio attachments alongside photos

### Remove
- Nothing removed

## Implementation Plan
1. Update DiaryEntry type in main.mo to add videoBlobIds and audioBlobIds fields
2. Regenerate backend bindings (backend.d.ts)
3. Update frontend entry form to support video/audio file selection and upload via blob-storage
4. Update entry detail view to render inline video and audio players
5. Validate and build
