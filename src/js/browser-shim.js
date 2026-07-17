/**
 * Minimal `browser.*` shim.
 *
 * Firefox exposes `browser` with promise-based APIs. Chromium exposes `chrome`
 * (promise-based since MV3). We only touch `storage`, so aliasing is enough.
 */
(function () {
  'use strict';

  if (typeof globalThis.browser === 'undefined' && typeof globalThis.chrome !== 'undefined') {
    globalThis.browser = globalThis.chrome;
  }
})();
