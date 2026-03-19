import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import type { ConfirmOptions } from '../../utils/uiEvents';

interface ConfirmDialogProps extends ConfirmOptions {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Modal dialog component for destructive or important confirmations.
 *
 * Styled to match the project's dark theme (slate-900 / indigo / red accents).
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-100">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-start gap-4">
                    <div
                        className={`p-3 rounded-2xl border shrink-0 ${
                            isDanger
                                ? 'bg-red-500/10 border-red-500/20'
                                : 'bg-indigo-500/10 border-indigo-500/20'
                        }`}
                    >
                        {isDanger ? (
                            <AlertTriangle
                                className="text-red-400"
                                size={22}
                            />
                        ) : (
                            <Info className="text-indigo-400" size={22} />
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2
                            id="confirm-dialog-title"
                            className="text-lg font-bold tracking-tight"
                        >
                            {title}
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 pt-4 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-sm font-bold transition-all border border-slate-700/50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-500 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
