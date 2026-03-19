# ✅ Checklist Refactoring Frontend (Dettagliata)

| ID | Task | Priorità | Stato |
| :--- | :--- | :--- | :--- |
| | **FASE 1: BUG FIXING CRITICO** | | |
| T-01 | Fix `useTranslationLoop.ts` (setter void usati come argomenti) | 🔴 CRITICO | [x] |
| T-02 | Null-check `subtitleFile` in `GenerationControls.tsx` | 🔴 CRITICO | [x] |
| T-03 | Cleanup `AudioContext` in `AudioWaveformPlayer.tsx` | 🟠 MEDIA | [x] |
| T-04 | Memoizzazione URL audio in `JobReviewModal.tsx` | 🟠 MEDIA | [x] |
| T-05 | Unificare `useJobArchive()` in `SubtitleContext.tsx` | 🟠 MEDIA | [x] |
| | **FASE 2: API LAYER & CONFIG** | | |
| T-06 | Creare `src/services/apiClient.ts` con variabile d'ambiente | 🔴 CRITICO | [x] |
| T-07 | Definire API specializzate (`ttsApi`, `jobsApi`, etc.) | 🟠 MEDIA | [x] |
| T-08 | Migrazione `fetch()` inline verso il nuovo client | 🟠 MEDIA | [x] |
| T-09 | Unificazione host `localhost` / `127.0.0.1` | 🟠 MEDIA | [x] |
| | **FASE 3: TIPI & UTILS** | | |
| T-10 | Creare `src/utils/audio.ts` (helper base64/blob) | 🟠 MEDIA | [x] |
| T-11 | Centralizzare tipi (`Voice`, `Job`, `Segment`) in `src/types/` | 🟠 MEDIA | [x] |
| T-12 | Sostituzione sistematica di `any` con tipi reali | 🟠 MEDIA | [x] |
| T-13 | Centralizzare formattatori in `src/utils/format.ts` | 🟡 BASSA | [x] |
| | **FASE 4: ARCHITETTURA MODULARE** | | |
| T-14 | Estrarre `useGenerationProgress` da `SubtitleContext` | 🟠 MEDIA | [x] |
| T-15 | Estrarre `useActivityLogs` da `SubtitleContext` | 🟡 BASSA | [x] |
| T-16 | Estrarre `useTtsSelection` da `SubtitleContext` | 🟠 MEDIA | [x] |
| T-17 | Estrarre `useJobPersistence` da `SubtitleContext` | 🟡 BASSA | [x] |
| T-18 | Refactor `SubtitleContext` per riduzione God Object | 🟠 MEDIA | [x] |
| | **FASE 5: UX & CLEANUP** | | |
| T-19 | Sostituire `alert()` / `confirm()` con `ConfirmDialog` | 🟡 BASSA | [ ] |
| T-20 | Aggiungere `ErrorBoundary` globale in `App.tsx` | 🟠 MEDIA | [x] |
| T-21 | Pulizia `App.css` (boilerplate originale) | 🟢 TRIVIAL | [x] |
| T-22 | Standardizzazione lingua lingua UI (EN/IT) | 🟢 TRIVIAL | [ ] |
| T-23 | Fix Tailwind dynamic classes in `FileUploadArea.tsx` | 🟠 MEDIA | [x] |
| T-24 | Rimozione cartelle/file vuoti | 🟢 TRIVIAL | [x] |
| | **FASE 6: TESTING** | | |
| T-25 | Unit test `SubtitleContext` | 🟠 MEDIA | [ ] |
| T-26 | Unit test `TranslationContext` | 🟠 MEDIA | [ ] |
| T-27 | Unit test `GenerationControls` (EventSource) | 🟠 MEDIA | [ ] |
| T-28 | Unit test `JobReviewModal` | 🟠 MEDIA | [ ] |
| T-29 | Unit test `TranslationControls` | 🟠 MEDIA | [ ] |
| T-30 | Unit test `AudioTrimmer` | 🟠 MEDIA | [ ] |
| T-31 | Unit test `FileUploadArea` | 🟠 MEDIA | [ ] |
| T-32 | Unit test `JobArchivePanel` | 🟠 MEDIA | [ ] |
| T-33 | Unit test `JobTableRow` | 🟠 MEDIA | [ ] |
| T-34 | Integrazione: Flusso Subtitle completo | 🟠 MEDIA | [ ] |
| T-35 | Integrazione: Flusso Archive Job completo | 🟠 MEDIA | [ ] |
| T-36 | Integrazione: Script Mode end-to-end | 🟠 MEDIA | [ ] |
| T-37 | Creazione `renderWithProviders` test helper | 🟠 MEDIA | [ ] |
| T-38 | Implementazione Mock API centralizzato | 🟠 MEDIA | [ ] |
| T-39 | Mock `AudioContext` e `EventSource` per Vitest | 🟠 MEDIA | [ ] |
| T-40 | Configurazione report di coverage | 🟡 BASSA | [ ] |
| T-41 | Fix `useScriptGeneration.test.ts` | 🟢 TRIVIAL | [x] |
| T-42 | Test scenari di errore/timeout API | 🟠 MEDIA | [ ] |
| T-43 | Test meccanismo di pausa traduzione | 🟠 MEDIA | [ ] |
