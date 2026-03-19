import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import type { ToastType } from '../../utils/uiEvents';

interface ToastItemProps {
    id: number;
    message: string;
    type: ToastType;
    duration: number;
    onDismiss: (id: number) => void;
}

/**
 * Individual toast notification item. Auto-dismisses after `duration` ms.
 */
const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, duration, onDismiss }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, duration);
        const removeTimer = setTimeout(() => {
            onDismiss(id);
        }, duration + 300); // extra time for exit transition

        return () => {
            clearTimeout(timer);
            clearTimeout(removeTimer);
        };
    }, [id, duration, onDismiss]);

    const styles: Record<ToastType, { container: string; icon: React.ReactNode }> = {
        success: {
            container: 'bg-slate-900 border-emerald-500/30 text-emerald-300',
            icon: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
        },
        error: {
            container: 'bg-slate-900 border-red-500/30 text-red-300',
            icon: <XCircle size={16} className="text-red-400 shrink-0" />,
        },
        info: {
            container: 'bg-slate-900 border-indigo-500/30 text-indigo-300',
            icon: <Info size={16} className="text-indigo-400 shrink-0" />,
        },
    };

    const { container, icon } = styles[type];

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl text-sm font-medium max-w-sm transition-all duration-300 ${container} ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            role="status"
            aria-live="polite"
        >
            {icon}
            <span className="flex-1 leading-snug text-slate-200">{message}</span>
            <button
                onClick={() => onDismiss(id)}
                className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5"
                aria-label="Dismiss"
            >
                <X size={14} />
            </button>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Array<{ id: number; message: string; type: ToastType; duration: number }>;
    onDismiss: (id: number) => void;
}

/**
 * Container that renders all active toast notifications in the bottom-right corner.
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 items-end">
            {toasts.map((t) => (
                <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
            ))}
        </div>
    );
};
