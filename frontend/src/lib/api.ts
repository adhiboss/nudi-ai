import { VoiceInfo, GenerationJob } from '../types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchVoices(): Promise<VoiceInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/api/voices`);
    if (!res.ok) {
      throw new Error(`Failed to fetch voices: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Could not connect to backend voices API, using fallback voice list:', err);
    return [
      {
        id: 'en_US-lessac-medium',
        name: 'Lessac (Clear & Professional)',
        language: 'en-US',
        gender: 'Female',
        sample_text: 'Hello! This is a test of my photo-to-talking-video application.',
        description: 'Clear, articulate American English voice suitable for presentations and tutorials.'
      },
      {
        id: 'en_US-ryan-medium',
        name: 'Ryan (Natural & Engaging)',
        language: 'en-US',
        gender: 'Male',
        sample_text: "Welcome to the AI talking video generator. Let's create something great today.",
        description: 'Friendly, modern American English voice ideal for explainers and social clips.'
      }
    ];
  }
}

export async function createGeneration(
  photoFile: File,
  script: string,
  voiceId: string,
  consent: boolean
): Promise<GenerationJob> {
  const formData = new FormData();
  formData.append('photo', photoFile);
  formData.append('script', script);
  formData.append('voice_id', voiceId);
  formData.append('consent', consent ? 'true' : 'false');

  const res = await fetch(`${API_BASE}/api/generations`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // Ignore JSON parse error on non-JSON response
    }
    throw new Error(errorMsg);
  }

  return await res.json();
}

export async function getGenerationStatus(jobId: string): Promise<GenerationJob> {
  const res = await fetch(`${API_BASE}/api/generations/${jobId}`);
  if (!res.ok) {
    let errorMsg = `Failed to get job status (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = errorData.detail;
      }
    } catch {
      // Ignore
    }
    throw new Error(errorMsg);
  }
  return await res.json();
}

export function getFullMediaUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  return `${API_BASE}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}
