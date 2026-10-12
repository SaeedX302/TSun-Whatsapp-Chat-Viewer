/**
 * Material Design ripple feedback.
 *
 * Android users expect a touch target to respond the instant a finger lands on
 * it, so the ink is created on `pointerdown` (not on click) and expands from
 * the exact touch coordinate.
 */
import React, { useCallback } from 'react';

export interface RippleHandlers {
  className: string;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
}

const createInk = (host: HTMLElement, clientX: number, clientY: number) => {
  const rect = host.getBoundingClientRect();
  // Diameter large enough to cover the farthest corner from the touch point.
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const radius = Math.max(
    Math.hypot(x, y),
    Math.hypot(rect.width - x, y),
    Math.hypot(x, rect.height - y),
    Math.hypot(rect.width - x, rect.height - y)
  );

  const ink = document.createElement('span');
  ink.className = 'ripple-ink';
  ink.style.width = `${radius * 2}px`;
  ink.style.height = `${radius * 2}px`;
  ink.style.left = `${x - radius}px`;
  ink.style.top = `${y - radius}px`;

  host.appendChild(ink);
  ink.addEventListener('animationend', () => ink.remove(), { once: true });
  // Safety net in case the animation event never fires (backgrounded tab).
  window.setTimeout(() => ink.remove(), 800);
};

/**
 * Returns props to spread on any pressable element:
 * `<button {...useRipple()} className={`${ripple.className} ...`}>`.
 */
export const useRipple = (enabled = true): RippleHandlers => {
  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      // Respect users who asked for reduced motion.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      createInk(event.currentTarget, event.clientX, event.clientY);
    },
    [enabled]
  );

  return { className: 'ripple-host', onPointerDown };
};
