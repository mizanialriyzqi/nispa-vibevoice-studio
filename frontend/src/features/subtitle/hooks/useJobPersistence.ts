import { useState } from 'react';
import { useJobArchive } from '../../../hooks/useJobArchive';
import type { Job } from '../../../hooks/useJobArchive';

/**
 * Hook that manages the loaded job ID and wraps the job archive actions.
 *
 * Centralizes the `loadedJobId` state and provides the underlying
 * `saveJobAction` / `updateJobAction` primitives that SubtitleContext
 * uses to build its higher-level `saveJobDraft` and `loadJobSegments`
 * callbacks.
 *
 * @returns Job persistence state and archive action helpers.
 */
export const useJobPersistence = () => {
    const [loadedJobId, setLoadedJobId] = useState<number | null>(null);
    const { saveJobDraft: saveJobAction, updateJob: updateJobAction } = useJobArchive();

    const updateJob = async (jobId: number, updateData: Record<string, unknown>): Promise<Job | null> => {
        return await updateJobAction(jobId, updateData);
    };

    return {
        loadedJobId,
        setLoadedJobId,
        saveJobAction,
        updateJob,
    };
};
