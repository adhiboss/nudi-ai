import os
import subprocess
from abc import ABC, abstractmethod
from typing import List
from app.config import PIPER_EXEC, PIPER_VOICES_DIR, TEMP_DIR
from app.models.schemas import VoiceInfo

class SpeechProvider(ABC):
    @abstractmethod
    def list_voices(self) -> List[VoiceInfo]:
        pass

    @abstractmethod
    def synthesize(self, text: str, voice_id: str, output_wav_path: str) -> str:
        pass

class PiperSpeechProvider(SpeechProvider):
    VOICES = {
        "en_US-lessac-medium": VoiceInfo(
            id="en_US-lessac-medium",
            name="Lessac (Clear & Professional)",
            language="en-US",
            gender="Female",
            sample_text="Hello! This is a test of my photo-to-talking-video application.",
            description="Clear, articulate American English voice suitable for presentations and tutorials."
        ),
        "en_US-ryan-medium": VoiceInfo(
            id="en_US-ryan-medium",
            name="Ryan (Natural & Engaging)",
            language="en-US",
            gender="Male",
            sample_text="Welcome to the AI talking video generator. Let's create something great today.",
            description="Friendly, modern American English voice ideal for explainers and social clips."
        )
    }

    def list_voices(self) -> List[VoiceInfo]:
        available = []
        for vid, vinfo in self.VOICES.items():
            model_file = PIPER_VOICES_DIR / f"{vid}.onnx"
            if model_file.exists():
                available.append(vinfo)
        return available

    def synthesize(self, text: str, voice_id: str, output_wav_path: str) -> str:
        if voice_id not in self.VOICES:
            raise ValueError(f"Unsupported voice ID: {voice_id}")

        model_path = PIPER_VOICES_DIR / f"{voice_id}.onnx"
        if not model_path.exists():
            raise FileNotFoundError(f"Voice model file not found at {model_path}")

        # Execute Piper CLI
        # Text is passed via stdin
        cmd = [
            PIPER_EXEC,
            "--model", str(model_path),
            "--output_file", str(output_wav_path)
        ]

        proc = subprocess.run(
            cmd,
            input=text,
            encoding="utf-8",
            capture_output=True
        )

        if proc.returncode != 0:
            raise RuntimeError(f"Piper TTS synthesis failed: {proc.stderr}")

        if not os.path.exists(output_wav_path) or os.path.getsize(output_wav_path) == 0:
            raise RuntimeError("Piper TTS produced an empty or missing audio file.")

        return output_wav_path
