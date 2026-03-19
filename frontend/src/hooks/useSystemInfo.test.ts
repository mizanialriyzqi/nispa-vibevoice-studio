import { renderHook, act } from '@testing-library/react';
import { useSystemInfo } from './useSystemInfo';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());

describe('useSystemInfo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useSystemInfo());
        expect(result.current.systemInfo).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('fetches system info successfully', async () => {
        const mockData = { system: { platform: 'win32' } };
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => mockData
        } as Response);

        const { result } = renderHook(() => useSystemInfo());

        await act(async () => {
            await result.current.fetchSystemInfo();
        });

        expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/system-info', undefined);
        expect(result.current.systemInfo).toEqual(mockData);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('handles fetch error', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            json: async () => ({ detail: 'Failed to fetch system info' })
        } as Response);

        const { result } = renderHook(() => useSystemInfo());

        await act(async () => {
            await result.current.fetchSystemInfo();
        });

        expect(result.current.error).toBe('Failed to fetch system info');
        expect(result.current.isLoading).toBe(false);
    });
});
