import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  /** Container that owns the scroll position. */
  scrollRef: React.RefObject<HTMLElement | null>;
  /** Drag distance (px) required to trigger a refresh. */
  threshold?: number;
  enabled?: boolean;
}

/**
 * Android pull-to-refresh for the chat canvas.
 *
 * The browser's own pull-to-refresh is disabled in CSS (`overscroll-behavior`),
 * so the gesture is re-implemented here with touch events and a Material
 * circular indicator, matching what users expect from a native chat app.
 */
export const usePullToRefresh = ({
  onRefresh,
  scrollRef,
  threshold = 72,
  enabled = true,
}: PullToRefreshOptions) => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !enabled) return;

    const onTouchStart = (event: TouchEvent) => {
      if (container.scrollTop > 0 || refreshing) {
        startY.current = null;
        return;
      }
      startY.current = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (startY.current === null) return;
      const delta = event.touches[0].clientY - startY.current;
      if (delta <= 0 || container.scrollTop > 0) {
        setPull(0);
        return;
      }
      // Rubber-band the indicator so it feels physical.
      setPull(Math.min(threshold * 1.5, delta * 0.55));
    };

    const finish = async () => {
      if (startY.current === null) return;
      startY.current = null;
      setPull((current) => {
        if (current >= threshold * 0.7) {
          setRefreshing(true);
          Promise.resolve(onRefresh()).finally(() => {
            setRefreshing(false);
            setPull(0);
          });
        } else {
          setPull(0);
        }
        return current;
      });
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', finish);
    container.addEventListener('touchcancel', finish);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', finish);
      container.removeEventListener('touchcancel', finish);
    };
  }, [enabled, onRefresh, refreshing, scrollRef, threshold]);

  return {
    pull,
    refreshing,
    /** Progress 0..1 used to scale/rotate the indicator. */
    progress: Math.min(1, pull / threshold),
    active: pull > 2 || refreshing,
  };
};
