import { useState, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Hook that manages the activity log entries shown during generation.
 *
 * Includes an `addLog` helper that deduplicates consecutive identical messages.
 *
 * @returns State and helpers for the activity log panel.
 */
export const useActivityLogs = () => {
    const [activityLogs, setActivityLogs] = useState<string[]>([]);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const lastLogRef = useRef<string>('');

    const addLog = (message: string) => {
        if (message === lastLogRef.current) return;
        lastLogRef.current = message;
        const timestamp = new Date().toLocaleTimeString();
        setActivityLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const clearLogs = () => {
        setActivityLogs([]);
        lastLogRef.current = '';
    };

    return {
        activityLogs,
        setActivityLogs: setActivityLogs as Dispatch<SetStateAction<string[]>>,
        showLogsModal,
        setShowLogsModal,
        addLog,
        clearLogs,
    };
};
