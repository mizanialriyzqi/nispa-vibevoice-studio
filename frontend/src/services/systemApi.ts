import { apiGet, apiFetch } from './apiClient';
import type { SystemInfoData } from '../hooks/useSystemInfo';

export interface StatusResponse {
    status: string;
}

export interface GpuDetailsResponse {
    gpu_devices: SystemInfoData['gpu']['gpu_devices'];
}

export const systemApi = {
    getStatus: () => apiGet<StatusResponse>('/api/status'),
    getSystemInfo: () => apiGet<SystemInfoData>('/api/system-info'),
    getGpuDetails: () => apiGet<GpuDetailsResponse>('/api/system/gpu-details'),
    testQwen: () => apiFetch('/api/system/test-qwen', { method: 'POST' }),
};
