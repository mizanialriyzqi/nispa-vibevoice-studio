# 🏗️ Piano di Refactoring Backend — Nispa VibeVoice Studio

> Analisi completa del codebase backend con identificazione di bug, code smell, flaw architetturali e piano di miglioramento.  
> Data analisi: 19 Marzo 2026

---

## 📊 Panoramica del Codebase Backend

| Metrica | Valore |
|---------|--------|
| Framework | FastAPI (Python 3.11+) |
| Database | SQLite (raw queries, no ORM) |
| TTS Engines | Qwen3-TTS, VibeVoice (Provider pattern) |
| Translation | NLLB-200 (offline), Ollama (proxy) |
| Routers | 6 (system, voices, generation, jobs, translation, tasks) |
| Core Modules | 6 (config, parser, aligner, queue_manager, translator, tts_provider) |
| Test Files | 12 |
| LOC stimato (solo python) | ~3.500 |

---

## 🐛 Bug Individuati

### BBUG-01 — `tasks.py` L142: Messaggio di errore in italiano hardcoded 🟡 MEDIO
```python
print(f"[Sistema] Errore calcolo VRAM: {e}")
print(f"[Sistema] VRAM analizzata. Batch Size dinamico impostato a: {BATCH_SIZE}")
```
**Problema:** Messaggi di log in italiano in un codebase interamente in inglese. Inconsistenza linguistica.

### BBUG-02 — `tasks.py` L272: `except: pass` silente nel salvataggio file 🟡 MEDIO
```python
try:
    # ...save output file...
except:
    pass
```
**Problema:** Un bare `except: pass` nasconde qualsiasi errore di I/O. Se il salvataggio fallisce, nessuno lo saprà mai. Stesso pattern in `tasks.py` L371.

### BBUG-03 — `tts_provider.py` L62/L70: Bare `except: pass` in `clean_vram()` 🟡 MEDIO
```python
try:
    self._vibe.model.to("cpu")
except: pass
```
**Problema:** Errori di cleanup VRAM sono silenziosamente ignorati. Se `.to("cpu")` fallisce, il garbage collector non può recuperare la memoria GPU.

### BBUG-04 — `database.py`: Connessioni SQLite non gestite con context manager 🟡 MEDIO
```python
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
# ...operazioni...
conn.close()
```
**Problema:** Se un'eccezione viene lanciata tra `connect()` e `close()`, la connessione resta aperta. Usare `with sqlite3.connect(...) as conn:`.

### BBUG-05 — `translator.py` L71: `dtype` vs `torch_dtype` 🟡 MEDIO
```python
self.model = AutoModelForSeq2SeqLM.from_pretrained(
    model_name,
    dtype=torch.float16 if device == "cuda" else torch.float32,
)
```
**Problema:** Hugging Face `from_pretrained()` usa `torch_dtype`, non `dtype`. Il parametro potrebbe essere ignorato silenziosamente, caricando il modello in `float32` anche su CUDA.

### BBUG-06 — `translation.py` L31: URL Ollama hardcoded 🟢 BASSO
```python
OLLAMA_URL = "http://127.0.0.1:11434"
```
**Problema:** L'URL di Ollama è hardcoded. Non è configurabile senza modificare il codice sorgente.

### BBUG-07 — `main.py` L28: `@app.on_event("startup")` è deprecated 🟢 BASSO
```python
@app.on_event("startup")
async def startup_event():
```
**Problema:** `on_event` è deprecato in FastAPI moderno. Usare `lifespan` context manager.

---

## 🏛️ Flaw Architetturali

### BARCH-01 — `tasks.py` è un monolith (460 LOC) 🔴
Il file più grande del backend contiene:
- Logica di parsing/loading dei segmenti
- Calcolo VRAM e batch size
- Ciclo di generazione TTS
- Salvataggio real-time nel DB
- Serializzazione/streaming SSE
- Logica di cancellazione

**Azione:** Estrarre `calculate_optimal_batch_size` in `core/vram.py`, logica di loading segmenti in `core/segment_loader.py`.

### BARCH-02 — Import ridondanti nei router 🟠
`generation.py` e `translation.py` importano moduli che non usano (es. `StreamingResponse` + `queue_manager` + `core.aligner` in `translation.py`). Appesantisce l'avvio e crea confusione.

### BARCH-03 — Nessun logging strutturato 🟠
Tutto il codebase usa `print()` per i log. Non c'è:
- Livelli di log (DEBUG, INFO, WARNING, ERROR)
- Formato consistente
- Possibilità di disabilitare output verboso
- Log rotation

**Azione:** Migrare a `logging` stdlib con configurazione centralizzata.

### BARCH-04 — SQLite raw queries ovunque 🟠
Le query SQL sono scritte come stringhe inline in `database.py`. Non c'è nessun ORM né query builder. La funzione `_row_to_job()` usa indici posizionali (`row[0]`, `row[1]`, ...) — fragile se lo schema cambia.

**Azione:** Almeno usare `Row` factory di SQLite per accesso per nome colonna.

### BARCH-05 — Path costruiti con `os.path.join` + relative paths 🟠
```python
self.base_model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "model"))
```
Ripetuto in `qwen_provider.py`, `vibe_provider.py`, `tasks.py`. I path dovrebbero provenire da `config.py`.

### BARCH-06 — Logica duplicata di decodifica base64 audio 🟠
La conversione `audioUrl → audioBase64 → bytes` è ripetuta in:
- `tasks.py` (L50-60, L81-90)
- `jobs.py` L47-56, L53-67
- `generation.py` L214-221

**Azione:** Creare un helper `decode_segment_audio()` centralizzato.

### BARCH-07 — Singleton `InternalTranslator` con `__new__` 🟢
```python
class InternalTranslator:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            ...
```
Un pattern singleton con `__new__` è fragile e difficile da testare/mockare. Meglio usare una factory function o dependency injection.

### BARCH-08 — `OutputRedirector` scrive nel task log ma è effettivamente un no-op 🟢
Il `write()` dell'OutputRedirector cattura l'output ma il `if` interno è un `pass`:
```python
if self.task_id in self.qm.tasks:
    pass
```
Il redirect di stdout/stderr non produce alcun effetto pratico sul task log.

### BARCH-09 — `update_job` usa f-string per costruire query SQL 🔴
```python
query = f"UPDATE subtitle_jobs SET {', '.join(updates)} WHERE id = ?"
```
Sebbene i valori siano parametrizzati, i nomi delle colonne sono inseriti via f-string. Se `updates` contiene dati non validati, è un potenziale vettore di SQL injection. In pratica è sicuro perché le colonne sono hardcoded, ma è un anti-pattern.

---

## 📋 Checklist Task Backend

### Fase B1 — Bug Fix
- [ ] **BT-01** Fix `dtype` → `torch_dtype` in `translator.py`
- [ ] **BT-02** Sostituire bare `except: pass` con logging appropriato
- [ ] **BT-03** Usare context manager per connessioni SQLite
- [ ] **BT-04** Standardizzare messaggi di log in inglese
- [ ] **BT-05** Migrare `@app.on_event("startup")` a `lifespan`

### Fase B2 — Refactoring Strutturale
- [ ] **BT-06** Estrarre `calculate_optimal_batch_size` in `core/vram.py`
- [ ] **BT-07** Estrarre logica loading segmenti in `core/segment_loader.py`
- [ ] **BT-08** Creare helper `decode_segment_audio()` centralizzato
- [ ] **BT-09** Usare `config.py` paths in tutti i provider (eliminare `os.path.join` relative)
- [ ] **BT-10** Pulire import ridondanti nei router

### Fase B3 — Infrastruttura
- [ ] **BT-11** Migrare da `print()` a `logging` stdlib
- [ ] **BT-12** Usare `sqlite3.Row` factory per accesso per nome colonna
- [ ] **BT-13** Rendere `OLLAMA_URL` configurabile via env variable
- [ ] **BT-14** Aggiungere health check per Ollama disponibilità

### Fase B4 — Test
- [ ] **BT-15** Aggiungere test per `decode_segment_audio` helper
- [ ] **BT-16** Aggiungere test per `calculate_optimal_batch_size`
- [ ] **BT-17** Test per errore di connessione DB
- [ ] **BT-18** Test per `OutputRedirector`

---

## 📈 Metriche di Successo

| Metrica | Attuale | Target |
|---------|---------|--------|
| Bare `except: pass` | 5+ | 0 |
| `print()` per logging | ~50+ | 0 (migrati a `logging`) |
| LOC in `tasks.py` | 460 | <250 |
| Path hardcoded nei provider | 4+ | 0 |
| Logica base64 duplicata | 3+ | 1 (centralizzata) |
