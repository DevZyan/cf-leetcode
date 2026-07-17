/**
 * Options page. Writes the whole settings object on every change; open
 * Codeforces tabs pick it up through storage.onChanged.
 */
(function () {
  'use strict';

  const { STORAGE_KEY, DEFAULTS, mergeSettings } = globalThis.CFLC;

  const $ = (id) => document.getElementById(id);
  const status = $('status');
  const preview = $('thresholdPreview');

  const TOGGLES = ['splitPane', 'difficultyPills'];

  const prefersLight = globalThis.matchMedia('(prefers-color-scheme: light)');

  function previewTheme(pref) {
    const resolved = pref === 'auto' ? (prefersLight.matches ? 'light' : 'dark') : pref;
    document.documentElement.setAttribute('data-cf-theme', resolved);
    document.documentElement.setAttribute('data-cf-theme-pref', pref);
  }

  let flashTimer;
  function flash(message) {
    status.textContent = message;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      status.textContent = '';
    }, 1500);
  }

  function renderPreview(easyMax, hardMin) {
    preview.textContent =
      `Easy ≤ ${easyMax}` +
      `  ·  Medium ${easyMax + 1}–${hardMin - 1}` +
      `  ·  Hard ≥ ${hardMin}`;
  }

  async function read() {
    const raw = await browser.storage.sync.get(STORAGE_KEY);
    return mergeSettings(raw[STORAGE_KEY]);
  }

  function fill(settings) {
    $('theme').value = settings.theme;
    $('disableOnStandings').checked = settings.disableOnStandings;
    for (const key of TOGGLES) $(key).checked = settings.features[key];
    $('easyMax').value = settings.difficulty.easyMax;
    $('hardMin').value = settings.difficulty.hardMin;
    previewTheme(settings.theme);
    renderPreview(settings.difficulty.easyMax, settings.difficulty.hardMin);
  }

  /**
   * Reads the form back into a settings object. Thresholds are clamped so a
   * hardMin below easyMax can't collapse the Medium band into nothing.
   */
  function collect() {
    const easyMax = Number($('easyMax').value);
    const hardMin = Number($('hardMin').value);
    const safeEasy = Number.isFinite(easyMax) ? easyMax : DEFAULTS.difficulty.easyMax;
    const safeHard = Number.isFinite(hardMin) ? hardMin : DEFAULTS.difficulty.hardMin;

    return {
      theme: $('theme').value,
      disableOnStandings: $('disableOnStandings').checked,
      features: Object.fromEntries(TOGGLES.map((k) => [k, $(k).checked])),
      difficulty: {
        easyMax: safeEasy,
        hardMin: Math.max(safeHard, safeEasy + 1)
      }
    };
  }

  async function save() {
    const next = collect();
    await browser.storage.sync.set({ [STORAGE_KEY]: next });
    fill(next);
    flash('Saved.');
  }

  async function init() {
    fill(await read());

    for (const el of document.querySelectorAll('input, select')) {
      el.addEventListener('change', () => {
        save().catch((err) => {
          console.error('[cf-leetcode] save failed:', err);
          status.textContent = 'Could not save.';
        });
      });
    }

    prefersLight.addEventListener('change', () => {
      if ($('theme').value === 'auto') previewTheme('auto');
    });
  }

  init().catch((err) => {
    console.error('[cf-leetcode] options failed to load:', err);
    status.textContent = 'Could not load settings.';
  });
})();
