/**
 * Theme bootstrap. Runs at document_start, before Codeforces paints.
 *
 * Sets `data-cf-theme` on <html> as early as possible. storage.sync is async,
 * so there is an unavoidable gap of a few ms before the attribute lands;
 * tokens.css covers that gap by falling back to `prefers-color-scheme` for
 * `html:not([data-cf-theme])`. A user whose OS theme matches their chosen
 * theme therefore never sees a flash.
 *
 * Nothing here restyles the page. It only publishes state:
 *   <html data-cf-theme="dark|light" data-cf-theme-pref="dark|light|auto">
 *   globalThis.CFLC.settings  (resolved settings, once loaded)
 */
(function () {
  'use strict';

  const { STORAGE_KEY, mergeSettings } = globalThis.CFLC;

  const prefersLight = globalThis.matchMedia('(prefers-color-scheme: light)');

  /**
   * "auto" is resolved here rather than in CSS so that every stylesheet only
   * has to match two states instead of three.
   *
   * @param {'dark'|'light'|'auto'} pref
   */
  function applyTheme(pref) {
    const root = document.documentElement;
    if (!root) return;
    const resolved = pref === 'auto' ? (prefersLight.matches ? 'light' : 'dark') : pref;
    root.setAttribute('data-cf-theme', resolved);
    root.setAttribute('data-cf-theme-pref', pref);
  }

  async function load() {
    try {
      const raw = await browser.storage.sync.get(STORAGE_KEY);
      return mergeSettings(raw[STORAGE_KEY]);
    } catch (err) {
      // Storage unavailable (private window quirks, corrupt profile, ...).
      // Degrade to defaults rather than leaving the page unstyled.
      console.warn('[cf-leetcode] settings read failed, using defaults:', err);
      return mergeSettings(null);
    }
  }

  /**
   * Escape hatch. Every rule in every stylesheet is scoped under
   * `html[data-cf-theme]`, so withholding the attribute leaves standings
   * byte-for-byte as Codeforces rendered it.
   */
  const isStandings = () => /\/standings(\/|$)/.test(location.pathname);

  const settingsPromise = load().then((settings) => {
    globalThis.CFLC.settings = settings;
    if (!(settings.disableOnStandings && isStandings())) {
      applyTheme(settings.theme);
    }
    return settings;
  });

  globalThis.CFLC.settingsPromise = settingsPromise;

  // Follow the OS theme live, but only while the preference is "auto".
  prefersLight.addEventListener('change', () => {
    const pref = globalThis.CFLC.settings?.theme;
    if (pref === 'auto') applyTheme(pref);
  });

  // Live-update open tabs when the options page writes new settings.
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !changes[STORAGE_KEY]) return;
    const next = mergeSettings(changes[STORAGE_KEY].newValue);
    globalThis.CFLC.settings = next;
    if (next.disableOnStandings && isStandings()) {
      document.documentElement.removeAttribute('data-cf-theme');
    } else {
      applyTheme(next.theme);
    }
    document.dispatchEvent(new CustomEvent('cflc:settingschange', { detail: next }));
  });
})();
