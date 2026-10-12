import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/android.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

/**
 * Fade the boot splash out once React has painted the first frame. Keeping the
 * splash in the HTML (instead of React) means an installed Android app shows
 * something instantly instead of a blank white screen.
 */
const hideBootSplash = () => {
  const splash = document.getElementById('boot-splash');
  if (!splash) return;
  splash.dataset.hidden = 'true';
  window.setTimeout(() => splash.remove(), 400);
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Wait for the browser to commit the first React paint before removing the splash.
requestAnimationFrame(() => requestAnimationFrame(hideBootSplash));

/**
 * Register the service worker so the app can be installed on Android and keeps
 * working offline (including the last loaded chat).
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
