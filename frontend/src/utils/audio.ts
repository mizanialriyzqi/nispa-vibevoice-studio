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
