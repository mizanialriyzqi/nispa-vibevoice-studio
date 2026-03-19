"""
audio_storage.py — Gestione file audio su disco per i segmenti dei job.

I file vengono salvati in:
    data/audio-rendering/{job_slug}_{job_id}/{segment_index}.wav

Il path relativo restituito (dalla repo root) viene salvato in audioUrl nel DB.
"""

import re
from pathlib import Path
from typing import Optional

REPO_ROOT = Path(__file__).parent.parent.parent
AUDIO_RENDERING_ROOT = REPO_ROOT / "data" / "audio-rendering"


def _slugify(text: str) -> str:
    """Converte un filename in un nome cartella sicuro e leggibile."""
    text = Path(text).stem
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text.strip())
    text = re.sub(r"-+", "-", text)
    return text[:64].strip("-") or "job"


def get_job_folder(original_filename: str, job_id: int) -> str:
    """Restituisce il nome cartella univoco per un job (es. 'My-Subtitle_42')."""
    return f"{_slugify(original_filename)}_{job_id}"


def save_segment_audio(original_filename: str, job_id: int, segment_index: int, wav_bytes: bytes) -> str:
    """
    Salva i byte WAV in data/audio-rendering/{folder}/{index}.wav.

    Returns:
        Path relativo dalla repo root (es. 'data/audio-rendering/My-Sub_42/0.wav').
    """
    folder = get_job_folder(original_filename, job_id)
    audio_dir = AUDIO_RENDERING_ROOT / folder
    audio_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{segment_index}.wav"
    (audio_dir / filename).write_bytes(wav_bytes)

    return f"data/audio-rendering/{folder}/{filename}"


def load_segment_audio(rel_path: str) -> bytes:
    """
    Carica i byte audio da un path relativo (dalla repo root).

    Args:
        rel_path: es. 'data/audio-rendering/My-Sub_42/0.wav'
    """
    return (REPO_ROOT / rel_path).read_bytes()


def is_file_path(audio_url: Optional[str]) -> bool:
    """True se audioUrl è un path relativo su file system (non data:, blob:, http:, https:)."""
    if not audio_url:
        return False
    return not audio_url.startswith(("data:", "blob:", "http:", "https:"))
