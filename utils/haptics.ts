/** Short haptic tick — the Android feedback that confirms a touch landed. */
export const haptic = (pattern: number | number[] = 10): void => {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  // Only vibrate on touch-first devices; a laptop with a mouse should stay silent.
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* Some browsers throw when the API is blocked — haptics are optional. */
  }
};

export const HAPTIC_TICK = 8;
export const HAPTIC_CONFIRM = [10, 40, 18];
