import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * jsdom does not implement matchMedia, visualViewport or vibrate, all of which
 * the Android-flavoured UI relies on. Provide minimal, deterministic stubs.
 */
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (!('vibrate' in navigator)) {
  Object.defineProperty(navigator, 'vibrate', { value: vi.fn(() => true), writable: true });
}

if (!window.visualViewport) {
  Object.defineProperty(window, 'visualViewport', {
    value: { height: window.innerHeight, offsetTop: 0, addEventListener: () => undefined, removeEventListener: () => undefined },
    writable: true,
  });
}

// jsdom has no Clipboard API; pretend the page is a secure context.
Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: { writeText: vi.fn(async () => undefined), readText: vi.fn(async () => '') },
});

// jsdom does not implement scrolling APIs used by the chat view.
Element.prototype.scrollTo = Element.prototype.scrollTo || (() => undefined);
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => undefined);

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
