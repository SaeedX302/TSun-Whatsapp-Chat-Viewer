import { useEffect } from 'react';

/**
 * Keeps a `--keyboard-inset` CSS variable in sync with the on-screen keyboard.
 *
 * Android Chrome resizes the visual viewport when the keyboard opens; floating
 * actions and bottom sheets read this variable so they never end up hidden
 * behind the keyboard.
 */
export const useKeyboardInset = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        // Ignore sub-pixel noise and browser UI collapse.
        const value = inset > 120 ? Math.round(inset) : 0;
        root.style.setProperty('--keyboard-inset', `${value}px`);
        root.classList.toggle('keyboard-open', value > 0);
      });
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      root.style.setProperty('--keyboard-inset', '0px');
      root.classList.remove('keyboard-open');
    };
  }, []);
};
