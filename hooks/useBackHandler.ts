import { useEffect, useRef } from 'react';

/**
 * Android hardware/gesture back-button support.
 *
 * The system back gesture is the primary navigation affordance on Android, so
 * transient UI (bottom sheets, expanded search) must be dismissible with it
 * instead of immediately leaving the app. A history entry is pushed while the
 * layer is open and consumed by the back gesture.
 */
export const useBackHandler = (isOpen: boolean, onBack: () => void) => {
  const handlerRef = useRef(onBack);
  handlerRef.current = onBack;

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    let consumed = false;
    const stateKey = `tsun-back-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.history.pushState({ ...(window.history.state || {}), [stateKey]: true }, '');

    const onPopState = () => {
      consumed = true;
      handlerRef.current();
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
      // If the layer was closed from the UI (not by the back gesture) we must
      // remove the sentinel history entry ourselves to avoid a dead back press.
      if (!consumed) {
        const state = window.history.state || {};
        if (state[stateKey]) {
          window.history.back();
        }
      }
    };
  }, [isOpen]);
};
