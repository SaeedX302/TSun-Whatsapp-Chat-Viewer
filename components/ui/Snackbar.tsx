import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type SnackbarTone = 'info' | 'success' | 'error';

export interface SnackbarProps {
  open: boolean;
  message: string;
  tone?: SnackbarTone;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms (Material default is 4s, errors stay longer). */
  duration?: number;
}

const TONE_ICONS: Record<SnackbarTone, React.ReactNode> = {
  info: <Info className="h-5 w-5 text-cyan-300" />,
  success: <CheckCircle2 className="h-5 w-5 text-primary-300" />,
  error: <AlertCircle className="h-5 w-5 text-red-300" />,
};

/**
 * Material snackbar.
 *
 * Sits above the gesture navigation bar / on-screen keyboard and auto-dismisses,
 * which is how Android reports transient events — errors never block the UI the
 * way a modal dialog would.
 */
export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  tone = 'info',
  actionLabel,
  onAction,
  onDismiss,
  duration,
}) => {
  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(onDismiss, duration ?? (tone === 'error' ? 6500 : 4000));
    return () => window.clearTimeout(timeout);
  }, [open, onDismiss, duration, tone]);

  if (!open) return null;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-nav z-[60] flex justify-center px-3 pb-safe"
    >
      <div className="animate-snack-in pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl bg-slate-900/95 px-4 py-3 text-sm text-white shadow-m3-3 backdrop-blur-md dark:bg-slate-800/95">
        <span className="shrink-0">{TONE_ICONS[tone]}</span>
        <p className="flex-1 leading-snug">{message}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-300 transition-colors hover:bg-white/10"
          >
            {actionLabel}
          </button>
        )}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
