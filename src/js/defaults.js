/**
 * Shared settings shape + defaults.
 *
 * Loaded both as a content script and via a <script> tag on the options page,
 * so it must stay dependency-free and side-effect-free apart from the export.
 */
(function () {
  'use strict';

  /** @type {const} */
  const STORAGE_KEY = 'settings';

  const DEFAULTS = Object.freeze({
    /** 'dark' | 'light' | 'auto' */
    theme: 'auto',

    /**
     * CF rating -> difficulty pill thresholds.
     * rating <= easyMax            -> Easy
     * easyMax < rating < hardMin   -> Medium
     * rating >= hardMin            -> Hard
     * Unrated problems get no pill.
     */
    difficulty: Object.freeze({
      easyMax: 1200,
      hardMin: 2000
    }),

    /** Per-feature toggles. Everything on by default. */
    features: Object.freeze({
      /** LeetCode-style split pane on problem pages (statement | submit form). */
      splitPane: true,
      /** Difficulty pills on the problemset list. */
      difficultyPills: true
    }),

    /** Escape hatch: leave standings pages completely untouched. */
    disableOnStandings: false
  });

  /**
   * Shallow-per-section merge of stored settings over DEFAULTS.
   * Storage may hold a partial or older-shaped object; never trust it.
   *
   * @param {unknown} stored
   * @returns {typeof DEFAULTS}
   */
  function mergeSettings(stored) {
    const s = stored && typeof stored === 'object' ? stored : {};
    return {
      theme: ['dark', 'light', 'auto'].includes(s.theme) ? s.theme : DEFAULTS.theme,
      difficulty: Object.assign({}, DEFAULTS.difficulty, s.difficulty),
      features: Object.assign({}, DEFAULTS.features, s.features),
      disableOnStandings:
        typeof s.disableOnStandings === 'boolean'
          ? s.disableOnStandings
          : DEFAULTS.disableOnStandings
    };
  }

  globalThis.CFLC = Object.assign(globalThis.CFLC || {}, {
    STORAGE_KEY,
    DEFAULTS,
    mergeSettings
  });
})();
