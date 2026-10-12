import { useEffect, useRef } from 'react';

/**
 * Android hardware/gesture back-button support.
 *
 * On Android the system back gesture is the primary way to dismiss transient
 * UI, so bottom sheets and expanded search have to consume it instead of
 * letting it leave the app.
 *
 * Implementation notes:
 * - A single module-level stack holds every open layer, so only the topmost one
 *   is closed per back press (a sheet opened from another sheet behaves).
 * - Exactly one sentinel history entry is kept while at least one layer is open.
 * - Removing the last layer undoes the sentinel on a macrotask: without the
 *   delay, a layer-to-layer transition (menu → load sheet) would pop the entry
 *   the *new* layer just pushed and instantly close it.
 */
type BackHandler = () => void;

const stack: BackHandler[] = [];
let sentinelActive = false;
let listening = false;

const pushSentinel = () => {
  if (typeof window === 'undefined') return;
  window.history.pushState({ ...(window.history.state || {}), tsunLayer: true }, '');
  sentinelActive = true;
};

const onPopState = () => {
  if (!sentinelActive) return; // A back press we did not ask for.
  sentinelActive = false;

  const handler = stack.pop();
  handler?.();

  // Still-open layers need their own sentinel for the next back press.
  if (stack.length > 0) pushSentinel();
};

const ensureListener = () => {
  if (listening || typeof window === 'undefined') return;
  window.addEventListener('popstate', onPopState);
  listening = true;
};

const releaseSentinel = () => {
  // Deferred so a layer that is opening in the same commit can keep it.
  window.setTimeout(() => {
    if (stack.length === 0 && sentinelActive) {
      sentinelActive = false;
      window.history.back();
    }
  }, 0);
};

/**
 * Registers `onBack` while `isOpen` is true. The layer is dismissed by the
 * Android back gesture and the handler is unregistered on close.
 */
export const useBackHandler = (isOpen: boolean, onBack: () => void) => {
  const handlerRef = useRef(onBack);
  handlerRef.current = onBack;

  useEffect(() => {
    if (!isOpen) return;
    ensureListener();

    const handler: BackHandler = () => handlerRef.current();
    stack.push(handler);
    if (stack.length === 1 && !sentinelActive) pushSentinel();

    return () => {
      const index = stack.indexOf(handler);
      if (index !== -1) stack.splice(index, 1);
      if (stack.length === 0) releaseSentinel();
    };
  }, [isOpen]);
};
