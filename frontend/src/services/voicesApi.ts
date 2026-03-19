import { apiFetch, API_BASE_URL } from './apiClient';

export const voicesApi = {
    delete: (voiceId: string) =>
        apiFetch(`/api/voices/${voiceId}`, { method: 'DELETE' }),

    saveTranscription: (voiceId: string, transcription: string) =>
        apiFetch(`/api/voices/${voiceId}/transcription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcription })
        }),

    upload: (body: FormData) =>
        apiFetch('/api/upload-voice', { method: 'POST', body }),

    reprocess: (voiceId: string) =>
        apiFetch(`/api/voices/${voiceId}/reprocess`, { method: 'POST' }),

    audioUrl: (voiceId: string) =>
        `${API_BASE_URL}/api/voices/${voiceId}/audio?t=${Date.now()}`,
};
