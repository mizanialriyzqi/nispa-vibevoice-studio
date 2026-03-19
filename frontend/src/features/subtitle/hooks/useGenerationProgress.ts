import { useState, useRef } from 'react';

/**
 * Hook that encapsulates the numeric progress state for subtitle generation,
 * including ETA calculation.
 *
 * @returns State, setters, and helpers for generation progress tracking.
 */
export const useGenerationProgress = () => {
    const [generationProgress, setGenerationProgress] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentItems, setCurrentItems] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState('--:--');
    const startTimeRef = useRef<number>(0);

    const recordStartTime = () => {
        startTimeRef.current = Date.now();
    };

    /**
     * Updates item-level progress and computes the ETA string.
     * Call this for each SSE progress event that includes item counts.
     */
    const updateItemProgress = (current: number, total: number) => {
        setTotalItems(total);
        setCurrentItems(current);
        setGenerationProgress((current / total) * 100);

        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const remaining = total - current;
        if (current > 0 && remaining > 0) {
            const avgPerItem = elapsed / current;
            const etaSec = Math.round(remaining * avgPerItem);
            const m = Math.floor(etaSec / 60);
            const s = etaSec % 60;
            setEstimatedTime(`${m}:${s.toString().padStart(2, '0')}`);
        } else if (remaining === 0) {
            setEstimatedTime('0:00');
        }
    };

    const resetProgress = () => {
        setGenerationProgress(0);
        setTotalItems(0);
        setCurrentItems(0);
        setEstimatedTime('--:--');
        startTimeRef.current = 0;
    };

    return {
        generationProgress,
        setGenerationProgress,
        totalItems,
        currentItems,
        estimatedTime,
        recordStartTime,
        updateItemProgress,
        resetProgress,
    };
};
