# AGENT.md — Nispa VibeVoice Studio

> Istruzioni per agenti AI che lavorano su questo progetto.

## Panoramica Progetto

**Nispa VibeVoice Studio** è un'applicazione desktop 100% offline per voiceover AI e traduzione sottotitoli.

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS v4
- **Backend:** FastAPI (Python 3.11+), SQLite, TTS engines (Qwen3, VibeVoice), NLLB-200
- **Test:** Vitest + Testing Library (frontend), pytest (backend)

## Struttura Repository

```
nispa-voiceover/
├── frontend/               # SPA React
│   ├── src/
│   │   ├── components/     # Componenti UI riutilizzabili
│   │   ├── context/        # GlobalContext (app-wide state)
│   │   ├── features/       # Feature modules (subtitle/, script/)
│   │   ├── hooks/          # Custom hooks globali
│   │   └── index.css       # Tailwind entry + design tokens
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   ├── api/routers/        # FastAPI routers (tasks, jobs, translation, generation)
│   ├── core/tts/           # TTS providers (qwen, vibe) + orchestrator
│   ├── db/                 # SQLite persistence
│   └── main.py
├── data/                   # Models, voices, outputs (gitignored)
├── REFACTORING_PLAN.md     # Piano di refactoring frontend attivo
└── REFACTORING_CHECKLIST.md # Checklist operativa (T-01 → T-43)
```

## Convenzioni di Codice

### Frontend
- **Lingua del codice:** Inglese (variabili, commenti, JSDoc)
- **Lingua dell'UI:** Da standardizzare (vedi REFACTORING_PLAN.md ARCH-07)
- **State management:** React Context API (GlobalContext, SubtitleContext, TranslationContext, ScriptContext)
- **Styling:** Tailwind CSS v4 con plugin Vite. Classi CSS custom in `index.css` (`glass-panel`, `input-style`, `btn-primary`)
- **API calls:** Attualmente `fetch()` inline. In corso migrazione a `src/services/apiClient.ts` centralizzato
- **Backend URL:** Attualmente hardcoded come `http://127.0.0.1:8000` o `http://localhost:8000`. Target: variabile `VITE_API_BASE_URL`

### Backend
- **Framework:** FastAPI con async/await
- **TTS:** Pattern Provider/Orchestrator (`TTSProvider` abstract → `QwenProvider`, `VibeProvider` → `MultiModelProvider`)
- **Database:** SQLite con modelli Pydantic (`extra="ignore"` per compatibilità legacy)
- **Audio:** SSE streams per progress real-time, salvataggio incrementale in DB

## Comandi Principali

```bash
# Frontend
cd frontend && npm install      # Installa dipendenze
cd frontend && npm run dev      # Dev server (default: http://localhost:5173)
cd frontend && npx vitest       # Esegui test
cd frontend && npx vitest --coverage  # Test con coverage

# Backend
cd backend && python -m uvicorn main:app --reload  # Dev server (porta 8000)

# Unified
python run_tests.py             # Esegui tutti i test (backend + frontend)
```

## Refactoring in Corso

- **Frontend:** Consultare **REFACTORING_PLAN.md** e **REFACTORING_CHECKLIST.md**
- **Backend:** Consultare **BACKEND_REFACTORING_PLAN.md**

### Bug Critici Noti (da fixare prima di altre modifiche)
1. **BUG-01**: `useTranslationLoop.ts` L111-112 — setter void usato come argomento
2. **BUG-02**: `GenerationControls.tsx` L277 — `subtitleFile.name` senza null-check

### Regole per Nuove Modifiche
- **Non aggiungere nuovi `any`** — usare tipi da `src/types/` (quando creato)
- **Non hardcodare URL API** — usare il client centralizzato (quando creato)
- **Non usare `alert()`/`confirm()`** — usare `ConfirmDialog` (quando creato)
- **Non duplicare** logica base64→Blob — usare `src/utils/audio.ts` (quando creato)
- **Chiudere sempre** `AudioContext` e revocare `blob:URL` dopo l'uso
