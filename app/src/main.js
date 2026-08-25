import './app.css';
import App from './App.svelte';
import { initTheme } from './lib/utils/theme.js';

// Sync the theme store with the class already applied by the inline boot script.
initTheme();

const app = new App({
  target: document.getElementById('app')
});

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — app works fine without it
    });
  });
}

export default app;
