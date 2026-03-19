from fastapi import APIRouter, Body, HTTPException
import torch
import platform
import psutil
import os
import asyncio
import uvicorn
import subprocess
from core.tts_provider import tts_engine
from core.config import MODELS_DIR, config_manager

router = APIRouter(prefix="/api")

@router.get("/system/settings")
def get_settings():
    """Returns the current system settings."""
    return config_manager.settings

@router.post("/system/settings")
def update_settings(settings: dict):
    """Updates the system settings."""
    return config_manager.save_settings(settings)

@router.get("/system/check-tools")
def check_tools():
    """Verifies if system tools (SoX, FFmpeg) are accessible."""
    results = {}
    for tool in ["sox", "ffmpeg", "ffprobe"]:
        path = config_manager.get_path(tool)
        try:
            # Try running the tool with --version or similar
            cmd = [path, "--version" if tool != "sox" else "--help"]
            subprocess.check_call(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            results[tool] = {"status": "ok", "path": path}
        except Exception:
            results[tool] = {"status": "error", "path": path}
    return results

@router.post("/system/trim-audio")
async def trim_audio(
    audio_base64: str = Body(...),
    start_sec: float = Body(...),
    end_sec: float = Body(...)
):
    """
    Trims a base64 encoded audio string using FFmpeg.
    Returns the trimmed audio as a base64 string.
    """
    import base64
    import tempfile
    from core.config import get_ffmpeg_path

    # Create temporary files
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as in_file:
        in_file.write(base64.b64decode(audio_base64))
        in_path = in_file.name

    out_path = in_path + "_trimmed.wav"
    
    try:
        duration = end_sec - start_sec
        cmd = [
            get_ffmpeg_path(),
            "-y",
            "-ss", str(start_sec),
            "-i", in_path,
            "-t", str(duration),
            "-c", "copy",
            out_path
        ]
        
        subprocess.check_call(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        with open(out_path, "rb") as f:
            trimmed_bytes = f.read()
            
        return {"audio_base64": base64.b64encode(trimmed_bytes).decode("utf-8")}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trimming failed: {str(e)}")
    finally:
        # Cleanup
        if os.path.exists(in_path): os.unlink(in_path)
        if os.path.exists(out_path): os.unlink(out_path)

@router.get("/health")
def read_health():
    """
    Checks the health status of the API.

    Returns:
        dict: A simple status message indicating the API is operational.
    """
    return {"status": "ok", "ready": tts_engine.is_ready}

@router.get("/status")
def get_status():
    """
    Returns the readiness status of the backend.
    Used by the frontend to determine when to stop showing the loading spinner.
    """
    if not tts_engine.is_ready:
        return {"status": "loading"}
    return {"status": "ready"}

@router.post("/system/test-qwen")
async def test_qwen_integration():
    """
    Performs a diagnostic test of the Qwen3-TTS engine and model weights.
    """
    results = []
    qwen_models = ["Qwen3-TTS-0.6B-CustomVoice", "Qwen3-TTS-1.7B-VoiceDesign"]
    
    for model_name in qwen_models:
        model_path = MODELS_DIR / model_name
        if not model_path.exists():
            results.append({"model": model_name, "status": "missing", "message": "Weights not found in data/model"})
            continue
            
        try:
            # Perform a very short synthesis test
            test_text = "Test"
            # Use asyncio.to_thread to not block the main loop
            await asyncio.to_thread(
                tts_engine.synthesize, 
                text=test_text, 
                model_name=model_name,
                voice_description="A calm voice" if "VoiceDesign" in model_name else None
            )
            results.append({"model": model_name, "status": "success", "message": "Inference successful"})
        except Exception as e:
            results.append({"model": model_name, "status": "error", "message": str(e)})
            
    return {"results": results}

def _collect_system_info() -> dict:
    """
    Collect CPU/RAM/platform info only — zero CUDA calls.
    Safe to call automatically on startup without risk of GPU driver conflicts.
    """
    has_cuda = torch.cuda.is_available()   # safe: only checks library presence
    mps_available = (
        torch.backends.mps.is_available()
        if hasattr(torch.backends, "mps")
        else False
    )
    vm = psutil.virtual_memory()
    cpu_percent = psutil.cpu_percent(interval=1)

    return {
        "system": {
            "platform": platform.system(),
            "platform_release": platform.release(),
            "python_version": platform.python_version(),
        },
        "torch": {
            "version": torch.__version__,
            "cuda_available": has_cuda,
            "cuda_version": torch.version.cuda if has_cuda else None,
            "mps_available": mps_available,
        },
        "gpu": {
            "has_cuda": has_cuda,
            "cuda_version": torch.version.cuda if has_cuda else None,
            "gpu_count": 0,      # populated only via /system/gpu-details
            "gpu_devices": [],   # populated only via /system/gpu-details
        },
        "cpu": {
            "physical_cores": psutil.cpu_count(logical=False),
            "logical_cores": psutil.cpu_count(logical=True),
            "cpu_percent": cpu_percent,
            "memory_total_gb": vm.total / (1024 ** 3),
            "memory_available_gb": vm.available / (1024 ** 3),
        },
    }


def _collect_gpu_details() -> list:
    """
    Query per-device CUDA info. Called only on explicit user request.
    Runs in a threadpool thread to keep the event loop free.
    """
    devices = []
    if not torch.cuda.is_available():
        return devices
    for i in range(torch.cuda.device_count()):
        try:
            props = torch.cuda.get_device_properties(i)
            cap = torch.cuda.get_device_capability(i)
            devices.append({
                "index": i,
                "name": props.name,
                "compute_capability": f"{cap[0]}.{cap[1]}",
                "memory_allocated": "N/A",
                "memory_reserved": "N/A",
                "memory_total": f"{props.total_memory / 1024**3:.2f} GB",
            })
        except Exception as e:
            devices.append({"index": i, "error": str(e)})
    return devices


@router.get("/system-info")
async def get_system_info():
    """CPU/RAM/platform info — no CUDA device queries, safe for auto-call on startup."""
    return await asyncio.to_thread(_collect_system_info)


@router.get("/system/gpu-details")
async def get_gpu_details():
    """Per-device GPU details. Called only on explicit user request to avoid GPU driver conflicts."""
    devices = await asyncio.to_thread(_collect_gpu_details)
    return {"gpu_devices": devices}
