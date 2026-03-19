import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ToastContainer } from '../components/ui/ToastNotification';
import {
    subscribeConfirm,
    subscribeToast,
    type ConfirmOptions,
    type PendingConfirm,
    type ToastEvent,
    type ToastType,
} from '../utils/uiEvents';

// ─── Context interface ────────────────────────────────────────────────────────

interface UIContextProps {
    /** Programmatically show a confirm dialog from within a React component. */
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
    /** Programmatically show a toast notification from within a React component. */
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const UIContext = createContext<UIContextProps | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * UIProvider mounts the ConfirmDialog and ToastContainer and wires them up to
 * the global `uiEvents` singleton so that hooks outside the React tree can
 * trigger UI imperatively.
 */
export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
    const [toasts, setToasts] = useState<ToastEvent[]>([]);

    // Subscribe to events emitted by the global singletons
    useEffect(() => {
        const unsubConfirm = subscribeConfirm((pending) => {
            setPendingConfirm(pending);
        });
        const unsubToast = subscribeToast((toast) => {
            setToasts((prev) => [...prev, toast]);
        });
        return () => {
            unsubConfirm();
            unsubToast();
        };
    }, []);

    const handleConfirm = useCallback(() => {
        pendingConfirm?.resolve(true);
        setPendingConfirm(null);
    }, [pendingConfirm]);

    const handleCancel = useCallback(() => {
        pendingConfirm?.resolve(false);
        setPendingConfirm(null);
    }, [pendingConfirm]);

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Imperative API for use within React component trees
    const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            setPendingConfirm({ options, resolve });
        });
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration = 3000) => {
            setToasts((prev) => [
                ...prev,
                { id: Date.now() + Math.random(), message, type, duration },
            ]);
        },
        []
    );

    return (
        <UIContext.Provider value={{ showConfirm, showToast }}>
            {children}

            {/* Global confirm dialog — rendered outside the component hierarchy */}
            {pendingConfirm && (
                <ConfirmDialog
                    isOpen={true}
                    {...pendingConfirm.options}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}

            {/* Global toast container */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </UIContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook for consuming the UI context inside React components.
 * For hooks outside the React tree, use the `showConfirm` / `showToast`
 * functions exported from `utils/uiEvents` directly.
 */
export function useUIContext(): UIContextProps {
    const ctx = useContext(UIContext);
    if (!ctx) {
        throw new Error('useUIContext must be used within a UIProvider');
    }
    return ctx;
}
