import { haptic, HAPTIC_TICK } from './haptics';

/**
 * Copies text to the clipboard with a fallback for Android WebViews that do not
 * expose the async Clipboard API, and fires a confirmation haptic.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      haptic(HAPTIC_TICK);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (ok) haptic(HAPTIC_TICK);
    return ok;
  } catch {
    return false;
  }
};
