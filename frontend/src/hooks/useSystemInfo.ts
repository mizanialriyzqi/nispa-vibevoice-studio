import { useState, useCallback } from 'react';
import { systemApi } from '../services/systemApi';

/**
 * Metadata for a single GPU device detected on the system.
 */
export interface GPUDevice {
    index: number;
    name: string;
    compute_capability: string;
    memory_allocated: string;
    memory_reserved: string;
    memory_total: string;
    error?: string;
}

/**
 * Comprehensive system information structure returned by the backend.
 */
export interface SystemInfoData {
    system: {
        platform: string;
        platform_release: string;
        python_version: string;
    };
    torch: {
        version: string;
        cuda_available: boolean;
        cuda_version: string | null;
        mps_available: boolean;
    };
    gpu: {
        has_cuda: boolean;
        cuda_version: string | null;
        gpu_count: number;
        gpu_devices: GPUDevice[];
    };
    cpu: {
        physical_cores: number;
        logical_cores: number;
        cpu_percent: number;
        memory_total_gb: number;
        memory_available_gb: number;
    };
}

/**
 * Custom hook to fetch and manage system hardware information.
 * 
 * Periodically or on-demand retrieves CPU, GPU, and memory statistics 
 * from the backend API.
 * 
 * @returns {object} State and handler for system information.
 */
export function useSystemInfo() {
    const [systemInfo, setSystemInfo] = useState<SystemInfoData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches current system hardware and software information from the backend.
     */
    const fetchSystemInfo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await systemApi.getSystemInfo();
            setSystemInfo(data);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error connecting to API');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        systemInfo,
        isLoading,
        error,
        fetchSystemInfo
    };
}
