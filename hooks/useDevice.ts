import { useCallback, useEffect, useState } from 'react';

/** Reactive `window.matchMedia` helper. */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};

/** Phone-sized viewports (Android phones in portrait/landscape). */
export const useIsMobile = (): boolean => useMediaQuery('(max-width: 767px)');

/** Tablets and foldables, where a wider chat column is used. */
export const useIsTablet = (): boolean =>
  useMediaQuery('(min-width: 768px) and (max-width: 1279px)');

/** Detects a real touch device so hover-only affordances can be avoided. */
export const useIsTouch = (): boolean => useMediaQuery('(hover: none) and (pointer: coarse)');

/**
 * Tracks whether the current display mode is a standalone install (Android
 * "Add to home screen" / TWA) as opposed to a browser tab.
 */
export const useIsStandalone = (): boolean => {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(display-mode: standalone)');
    const update = () =>
      setStandalone(
        mql.matches ||
          // iOS / older Android Safari style flag
          (window.navigator as Navigator & { standalone?: boolean }).standalone === true
      );
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return standalone;
};

/** Convenience: a stable callback that reports the current viewport width. */
export const useViewportWidth = (): number => {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1024 : window.innerWidth));

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return width;
};

/** Exposes a callback that always reads the latest value (avoids stale refs). */
export const useEvent = <T extends (...args: never[]) => unknown>(handler: T): T => {
  const [callback] = useState(() => ({ current: handler }));
  callback.current = handler;
  return useCallback(((...args: never[]) => callback.current(...args)) as T, [callback]);
};
