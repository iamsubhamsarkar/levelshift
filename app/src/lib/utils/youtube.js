/**
 * LevelShift — YouTube IFrame API loader
 *
 * Loads https://www.youtube.com/iframe_api exactly once and resolves when the
 * global YT.Player is ready. Multiple VideoBlocks can await the same promise.
 * We use the standard youtube.com host; the API also works with the
 * privacy-enhanced player via the `host` option in the player component.
 */

let readyPromise = null;

export function loadYouTubeApi() {
  if (readyPromise) return readyPromise;

  readyPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    // Chain any pre-existing callback.
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') { try { prev(); } catch {} }
      resolve(window.YT);
    };

    // Inject the script if not already present.
    if (!document.querySelector('script[data-yt-api]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.setAttribute('data-yt-api', '1');
      document.head.appendChild(tag);
    }
  });

  return readyPromise;
}
