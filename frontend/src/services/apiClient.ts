/**
 * Centralized API client for all backend communication.
 * Base URL is configured via VITE_API_BASE_URL environment variable.
 * Falls back to http://127.0.0.1:8000 for local development.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Typed fetch wrapper that prepends the base URL and throws on non-OK responses.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, init);
    return response;
}

/**
 * POST a FormData payload and return parsed JSON, throwing on non-OK.
 */
export async function apiPostForm<T>(path: string, body: FormData): Promise<T> {
    const res = await apiFetch(path, { method: 'POST', body });
    if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(errData.detail || `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

/**
 * POST a JSON payload and return parsed JSON, throwing on non-OK.
 */
export async function apiPostJson<T>(path: string, body: unknown): Promise<T> {
    const res = await apiFetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(errData.detail || `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

/**
 * GET and return parsed JSON, throwing on non-OK.
 */
export async function apiGet<T>(path: string): Promise<T> {
    const res = await apiFetch(path);
    if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(errData.detail || `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

/**
 * Returns a full EventSource URL for streaming endpoints.
 */
export function apiStreamUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
}
