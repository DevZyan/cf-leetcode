/**
 * Problemset list: turn CF's numeric difficulty rating into a pill.
 *
 * The rating lives in the 4th cell of each `table.problems` row and carries no
 * class of its own (verified — SELECTORS.md), so it is matched positionally.
 * The cell is empty for unrated problems, which get no pill.
 *
 * The number is kept inside the pill rather than replaced, so nothing is lost
 * if the label is wrong for your taste — and CF's own sorting reads the table
 * cells, not our markup.
 */
(function () {
  'use strict';

  const RATING_CELL_INDEX = 3;

  /**
   * @param {number} rating
   * @param {{ easyMax: number, hardMin: number }} thresholds
   */
  function classify(rating, thresholds) {
    if (rating <= thresholds.easyMax) return { label: 'Easy', cls: 'cflc-pill-easy' };
    if (rating >= thresholds.hardMin) return { label: 'Hard', cls: 'cflc-pill-hard' };
    return { label: 'Medium', cls: 'cflc-pill-medium' };
  }

  function decorate(thresholds) {
    const table = document.querySelector('.datatable table.problems');
    if (!table) return;

    for (const row of table.rows) {
      const cell = row.cells[RATING_CELL_INDEX];
      if (!cell || cell.querySelector('.cflc-pill')) continue;

      const text = cell.textContent.trim();
      if (!/^\d{3,4}$/.test(text)) continue;

      const { label, cls } = classify(Number(text), thresholds);

      const pill = document.createElement('span');
      pill.className = `cflc-pill ${cls}`;
      pill.textContent = label;
      pill.title = `Codeforces rating ${text}`;

      const rating = document.createElement('span');
      rating.className = 'cflc-pill-rating';
      rating.textContent = text;

      cell.textContent = '';
      cell.append(pill, rating);
    }
  }

  function run() {
    globalThis.CFLC.settingsPromise.then((settings) => {
      if (!settings.features.difficultyPills) return;
      decorate(settings.difficulty);
    });
  }

  if (!/^\/problemset\/?$/.test(location.pathname)) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
