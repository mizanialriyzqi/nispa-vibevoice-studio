# API Reference: Nispa VibeVoice Studio

This document details the REST API endpoints provided by the Nispa VibeVoice Studio backend.

## Base URL
Default local development URL: `http://localhost:8000/api`

---

## 1. System & Health

### GET `/health`
Check if the API server is running and the TTS engine is ready.
- **Response:** `{"status": "ok", "ready": true/false}`

### GET `/status`
Returns the readiness status of the backend.
- **Response:** `{"status": "loading"}` or `{"status": "ready"}`

### GET `/system-info`
Retrieve CPU, RAM, GPU and environment information. Safe to call on startup (no CUDA device queries).
- **Response:** Nested dict with `system`, `torch`, `gpu`, `cpu` fields.

### GET `/system/gpu-details`
Per-device GPU information (compute capability, VRAM). Called only on explicit user request to avoid driver conflicts.
- **Response:** `{"gpu_devices": [{"index": 0, "name": "...", "compute_capability": "...", "memory_total": "..."}, ...]}`

### GET `/system/settings`
Retrieve the current system settings (paths, audio format, UI theme).
- **Response:** Dictionary of current settings.

### POST `/system/settings`
Update system settings.
- **Body (JSON):** Dictionary of settings to update.
- **Response:** Updated settings dictionary.

### GET `/system/check-tools`
Verify if system tools (SoX, FFmpeg, FFprobe) are accessible.
- **Response:** `{"sox": {"status": "ok"|"error", "path": "..."}, ...}`

### POST `/system/trim-audio`
Trim a base64-encoded audio file using FFmpeg.
- **Body (JSON):** `audio_base64` (string), `start_sec` (float), `end_sec` (float)
- **Response:** `{"audio_base64": "..."}`

### POST `/system/test-qwen`
Run a diagnostic test of the Qwen3-TTS engine and model weights.
- **Response:** `{"results": [{"model": "...", "status": "success"|"error"|"missing", "message": "..."}, ...]}`

---

## 2. Maintenance

### GET `/maintenance/stats`
Return storage statistics: DB size, job count, audio rendering folder size.
- **Response:** `{"db_size_mb": float, "job_count": int, "audio_size_mb": float, "audio_folder_count": int}`

### POST `/maintenance/vacuum`
Run SQLite `VACUUM` to reclaim disk space after deletions.
- **Response:** `{"size_before_mb": float, "size_after_mb": float, "saved_mb": float}`

### GET `/maintenance/orphan-audio`
List audio folders in `data/audio-rendering/` that have no corresponding job in the database.
- **Response:** `{"orphans": [{"folder": "...", "job_id": int|null, "size_mb": float}], "total_mb": float}`

### DELETE `/maintenance/orphan-audio`
Delete all orphaned audio folders.
- **Response:** `{"deleted": [...], "errors": [...], "total_freed_mb": float}`

---

## 3. Models & Voices

### GET `/models`
List all available TTS models with metadata.
- **Response:** `{"models": [{"id": "...", "name": "...", "engine": "...", "supports_voice_design": bool}, ...]}`

### GET `/voices`
List all available voice reference files in `data/voices/`.
- **Response:** `{"voices": [{"id": "...", "filename": "...", "language": "...", "accent": "...", "name": "...", "gender": "...", "transcription": "..."}, ...]}`

### GET `/voices/{voice_id}/audio`
Retrieve the raw WAV audio file for a specific voice.
- **Response:** Audio file (`audio/wav`).

### POST `/upload-voice`
Upload and process a new voice reference file.
- **Form Data:** `voice_file` (MP3/WAV), `voice_id` (string, e.g. `en-myvoice`), `transcription` (optional string).
- **Response:** Metadata of the saved voice file.

### POST `/voices/{voice_id}/transcription`
Update the transcription text for an existing voice.
- **Body (JSON):** `{"transcription": "..."}`

### POST `/voices/{voice_id}/reprocess`
Apply noise reduction and normalization to a voice file.
- **Response:** `{"status": "success", "new_voice_id": "..."}`

### DELETE `/voices/{voice_id}`
Delete a voice reference file and its transcription metadata.
- **Response:** Success message.

---

## 4. Subtitle Processing & Translation

### POST `/preview-subtitles`
Parse a subtitle file and return its segments.
- **Form Data:** `subtitle_file` (.srt or .vtt).
- **Query Params:** `group_by_punctuation` (boolean).
- **Response:** `{"segments": [...], "original_count": int, "final_count": int}`

### GET `/ollama/models`
List available models from the local Ollama instance and local NLLB models.
- **Response:** `{"models": [...]}`

### POST `/translate-segment`
Translate a single text string using NLLB or Ollama.
- **Form Data:** `text`, `target_language`, `source_language`, `model_name`, `prompt` (optional).
- **Response:** `{"translated_text": "..."}`

### POST `/translate-batch`
Translate multiple subtitle segments in a single request.
- **Form Data:** `segments_json` (JSON string), `target_language`, `source_language`, `model_name`, `prompt` (optional).
- **Response:** `{"segments": [...]}`

### POST `/translate-subtitles`
Translate an entire subtitle file using NLLB.
- **Form Data:** `subtitle_file`, `target_language`, `source_language`.
- **Response:** JSON list of translated segments.

---

## 5. Voiceover Generation

### POST `/generate-segment`
Synchronously generate audio for a single text segment. Optionally saves the result to disk.
- **Form Data:** `text`, `voice_id`, `model_name`, `voice_description` (optional), `language` (optional), `job_id` (optional int), `segment_index` (optional int), `original_filename` (optional string).
- **Response:** `{"audio_base64": "...", "audio_path": "data/audio-rendering/..."|null}`
  `audio_path` is returned only when `job_id` + `segment_index` + `original_filename` are all provided.

### POST `/generate-audio`
Synchronously generate and align audio for multiple subtitle segments.
- **Form Data:** `subtitle_file` or `subtitle_segments` (JSON), `voice_id`, `model_name`, etc.
- **Response:** Audio file (`audio/mpeg`).

### POST `/generate-script`
Synchronously generate audio for an untimed multi-speaker script.
- **Form Data:** `script_file` or `script_text`, `speaker_voice_map` (JSON), etc.
- **Response:** Audio file (`audio/mpeg`).

### GET `/audio-files/{file_path:path}`
Serve a generated audio segment file from `data/audio-rendering/`.
- **Response:** Audio file (`audio/wav` or `audio/mpeg`).

---

## 6. Background Tasks

### POST `/tasks/generate-subtitles`
Create a background task for timed subtitle synthesis with incremental per-segment saving.
- **Form Data:**
  - `job_id` (optional int) — if provided, segments are loaded directly from SQLite (avoids large JSON payloads and enables resume of partially completed jobs)
  - `subtitle_file` (optional) — used if no `job_id`
  - `subtitle_segments` (optional JSON string) — fallback if no file
  - `voice_id`
  - `model_name`
  - `group_by_punctuation` (boolean)
  - `output_format` (`mp3` or `wav`)
  - `voice_description` (optional)
  - `language` (optional)
- **Response:** `{"status": "success", "task_id": "..."}`

### POST `/tasks/generate`
Create a background task for untimed script synthesis.
- **Form Data:** Same as `/generate-script`.
- **Response:** `{"status": "success", "task_id": "..."}`

### GET `/tasks/{task_id}/stream`
**SSE (Server-Sent Events)** stream for real-time task progress.
- **Event types:**
  - `progress` — `{"type": "progress", "progress": int, "current_item": int, "total_items": int, "status": string, "new_segments": [...]}`
  - `complete` — `{"type": "complete", "progress": 100, "audioBase64": "...", ...}`
  - `error` — `{"type": "error", "message": "..."}`
- **Polling interval:** 100ms server-side.

### POST `/tasks/{task_id}/cancel`
Cancel a running background task.
- **Query Params:** `finalize` (boolean, default false) — if true, joins segments generated so far and returns them via SSE `complete` event instead of discarding.

---

## 7. Job Archive (Persistence)

### GET `/jobs`
List all jobs with pagination.
- **Query Params:** `limit` (1–100, default 50), `offset` (default 0).
- **Response:** `{"jobs": [...], "total": int}`

### POST `/jobs/create`
Save a new job draft.
- **Body (JSON):** `JobCreate` schema — `original_filename`, `subtitle_segments`, `modified_segments`, `voice_id`, `voice_name`, `model_name`, `language`, `group_by_punctuation`, `notes`.

### GET `/jobs/{job_id}`
Retrieve a specific job by ID (includes full segment data).

### PUT `/jobs/{job_id}`
Update job segments, notes, language, voice or model.
- **Body (JSON):** `JobUpdate` schema — all fields optional: `modified_segments`, `notes`, `language`, `voice_id`, `model_name`.

### PATCH `/jobs/{job_id}/status`
Update job status and optionally the audio URL.
- **Query Params:** `status` (`draft`|`processing`|`completed`|`failed`), `audio_url` (optional).

### DELETE `/jobs/{job_id}`
Permanently delete a job record from the database.

### POST `/jobs/{job_id}/finalize`
Join all segment audio files for a job into a single output file, time-aligned to the original subtitle timecodes. Supports both file-path segments (`data/audio-rendering/...`) and legacy base64 segments.
- **Query Params:** `output_format` (default `mp3`).
- **Response:** Audio file download (`mp3` or `wav`).

### GET `/jobs/{job_id}/export-srt`
Export the modified segments of a job as an `.srt` file.
- **Response:** SRT file download.
