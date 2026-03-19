/**
 * Utility functions for audio handling.
 * Centralizes base64↔Blob conversion and URL lifecycle management.
 */

/**
 * Converts a base64-encoded audio string to a Blob.
 * @param base64 - Raw base64 string (no data: prefix)
 * @param mimeType - MIME type of the audio (default: 'audio/wav')
 */
export function base64ToBlob(base64: string, mimeType = 'audio/wav'): Blob {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
}

/**
 * Converts a base64-encoded audio string to an object URL.
 * Remember to call revokeAudioUrl() when done to avoid memory leaks.
 */
export function base64ToBlobUrl(base64: string, mimeType = 'audio/wav'): string {
    return URL.createObjectURL(base64ToBlob(base64, mimeType));
}

/**
 * Revokes an object URL to free memory.
 * Safe to call with undefined/null.
 */
export function revokeAudioUrl(url: string | null | undefined): void {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

/**
 * Converts a playback-ready audio URL to a DB-safe relative file path.
 * - HTTP `/audio-files/...` → `data/audio-rendering/...`
 * - blob: URLs → null (ephemeral, not persisted)
 * - Anything else (data:, relative path) → returned as-is
 */
export function serializeAudioUrl(url: string | undefined | null): string | null {
    if (!url || url.startsWith('blob:')) return null;
    if (url.includes('/audio-files/')) {
        return 'data/audio-rendering/' + url.split('/audio-files/')[1];
    }
    return url;
}

/**
 * Converts a relative file path stored in the DB to an HTTP URL for playback.
 * - `data/audio-rendering/...` → `{apiBaseUrl}/audio-files/...`
 * - Anything else → returned as-is
 */
export function filePathToHttpUrl(filePath: string, apiBaseUrl: string): string {
    if (filePath.startsWith('data/audio-rendering/')) {
        return `${apiBaseUrl}/audio-files/${filePath.replace('data/audio-rendering/', '')}`;
    }
    return filePath;
}
