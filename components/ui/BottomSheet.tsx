import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBackHandler } from '../../hooks/useBackHandler';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  /** `tall` fills most of the screen (used for long lists). */
  height?: 'auto' | 'tall';
  /** Element that receives focus when the sheet opens. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const DISMISS_DISTANCE = 96;

/**
 * Material 3 modal bottom sheet.
 *
 * This is the Android-native way to ask for input: it slides up from the bottom
 * (thumb-reachable), dims the content behind it, can be flicked away, and is
 * dismissed by the system back gesture. On wide screens it recentres as a
 * dialog so desktop users get a familiar layout.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  height = 'auto',
  initialFocusRef,
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ y: number; time: number } | null>(null);

  useBackHandler(open, onClose);

  useEffect(() => {
    if (!open) return;
    setDragOffset(0);
    // Focus after the slide-up animation starts so Android does not scroll the
    // sheet while it is still animating.
    const timeout = window.setTimeout(() => initialFocusRef?.current?.focus(), 220);
    return () => window.clearTimeout(timeout);
  }, [open, initialFocusRef]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = { y: event.clientY, time: Date.now() };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const delta = event.clientY - dragStart.current.y;
    setDragOffset(Math.max(0, delta));
  };

  const onPointerUp = () => {
    if (!dragStart.current) return;
    const elapsed = Math.max(1, Date.now() - dragStart.current.time);
    const velocity = dragOffset / elapsed; // px per ms
    const shouldDismiss = dragOffset > DISMISS_DISTANCE || velocity > 0.7;
    dragStart.current = null;
    setDragging(false);
    if (shouldDismiss) {
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
      <div className="scrim absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          transform: dragOffset ? `translateY(${dragOffset}px)` : undefined,
          transition: dragging ? 'none' : 'transform 260ms cubic-bezier(0.05, 0.7, 0.1, 1)',
        }}
        className={[
          'animate-sheet-up relative flex w-full flex-col overflow-hidden rounded-t-3xl border border-black/5 bg-surface-light shadow-m3-3 dark:border-white/10 dark:bg-slate-900',
          'md:mx-4 md:max-w-lg md:rounded-3xl',
          'pb-safe',
          height === 'tall' ? 'max-h-[92dvh] md:max-h-[85dvh]' : 'max-h-[90dvh]',
        ].join(' ')}
      >
        <div
          className="shrink-0 cursor-grab touch-none select-none px-4 pb-2 pt-3 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="sheet-handle mx-auto text-slate-500 dark:text-white" />
        </div>

        {(title || description) && (
          <header className="shrink-0 px-5 pb-2 pt-1 md:px-6">
            {title && (
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm leading-snug text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </header>
        )}

        <div className="material-scroll flex-1 overscroll-contain px-5 pb-4 md:px-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default BottomSheet;
