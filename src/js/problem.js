/**
 * Problem page: LeetCode-style split pane.
 *
 * Left  = CF's own #pageContent (the statement), unmoved except into a grid.
 * Right = CF's own sidebar submit form, relocated into the pane.
 *
 * Why not an iframe (the first attempt): Codeforces' framing headers can't be
 * relied on, and its submit form is guarded by Cloudflare Turnstile, which is
 * not something to gamble on inside a frame during a contest.
 *
 * The form is **moved**, never cloned or rebuilt — `appendChild` on an existing
 * node relocates it with every jQuery handler CF bound to it, and with its
 * csrf_token / ftaa / bfaa / turnstileToken inputs untouched. Submission stays
 * entirely CF's code path; we only change where the form sits on screen.
 *
 * The one substantive change: CF's sidebar form carries a hidden
 * `<input name="source">` and only exposes file upload. We swap that hidden
 * input for a visible <textarea> of the same name, which is the field CF's own
 * full submit page posts. Nothing is added to the form that CF did not already
 * define — see README for why this is the line, and where it sits.
 *
 * If the form isn't found, the pane shows a link and the statement is untouched.
 */
(function () {
  'use strict';

  const SPLIT_MIN_PX = 320;
  const RATIO_KEY = 'splitRatio';

  /**
   * @returns {{ submitUrl: string, index: string } | null}
   */
  function resolveProblem() {
    const path = location.pathname;

    // Verified from the problemset dump: /problemset/submit/{contestId}/{index}
    let m = path.match(/^\/problemset\/problem\/(\d+)\/([^/]+)/);
    if (m) {
      return { submitUrl: `/problemset/submit/${m[1]}/${m[2]}`, index: m[2] };
    }

    // Verified from the contest problem dump's tab strip: /contest/{id}/submit
    m = path.match(/^\/(contest|gym)\/(\d+)\/problem\/([^/]+)/);
    if (m) {
      return { submitUrl: `/${m[1]}/${m[2]}/submit`, index: m[3] };
    }

    return null;
  }

  /* --------------------------------------------------------- split mode -- */

  /**
   * Reveals CF's own hidden `source` field as an editable textarea.
   * @param {HTMLFormElement} form
   */
  function revealSourceField(form) {
    const hidden = form.querySelector('input[type="hidden"][name="source"]');
    if (!hidden) return null;

    const textarea = document.createElement('textarea');
    textarea.name = 'source';
    textarea.className = 'cflc-source';
    textarea.spellcheck = false;
    textarea.autocapitalize = 'off';
    textarea.autocomplete = 'off';
    textarea.setAttribute('aria-label', 'Source code');
    textarea.value = hidden.value;

    hidden.replaceWith(textarea);

    // Tab should indent, not escape the field. Shift+Tab still moves focus, so
    // the form stays keyboard-navigable.
    textarea.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || e.shiftKey) return;
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end, value } = textarea;
      textarea.value = `${value.slice(0, s)}    ${value.slice(end)}`;
      textarea.selectionStart = textarea.selectionEnd = s + 4;
    });

    return textarea;
  }

  function buildRightPane(problem) {
    const pane = document.createElement('div');
    pane.className = 'cflc-pane-right';

    const header = document.createElement('div');
    header.className = 'cflc-pane-right-header';

    const label = document.createElement('span');
    label.textContent = 'Code';

    const openLink = document.createElement('a');
    openLink.href = problem.submitUrl;
    openLink.textContent = 'Open full page ↗';

    header.append(label, openLink);
    pane.append(header);

    const form = document.querySelector('form.submitForm');
    if (!form) {
      const fallback = document.createElement('div');
      fallback.className = 'cflc-pane-fallback';
      const link = document.createElement('a');
      link.href = problem.submitUrl;
      link.textContent = 'Open the submit page';
      fallback.append(
        document.createTextNode('No submit form on this page. '),
        link,
        document.createTextNode(' instead.')
      );
      pane.append(fallback);
      return pane;
    }

    const body = document.createElement('div');
    body.className = 'cflc-pane-body';
    // Moves the live node — handlers and hidden tokens travel with it.
    body.append(form);
    pane.append(body);

    if (!revealSourceField(form)) {
      // CF changed the form; leave it exactly as found rather than guess.
      console.warn('[cf-leetcode] no hidden source field; leaving submit form as-is');
    }

    return pane;
  }

  function makeGutter(root) {
    const gutter = document.createElement('div');
    gutter.className = 'cflc-gutter';
    gutter.setAttribute('role', 'separator');
    gutter.setAttribute('aria-orientation', 'vertical');

    let dragging = false;

    const setRatio = (ratio) => {
      const clamped = Math.min(0.8, Math.max(0.2, ratio));
      root.style.gridTemplateColumns = `minmax(${SPLIT_MIN_PX}px, ${clamped}fr) 6px minmax(${SPLIT_MIN_PX}px, ${1 - clamped}fr)`;
      return clamped;
    };

    const onMove = (e) => {
      if (!dragging) return;
      // Pointer events would be captured by the iframe mid-drag.
      e.preventDefault();
      const rect = root.getBoundingClientRect();
      setRatio((e.clientX - rect.left) / rect.width);
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      gutter.classList.remove('cflc-dragging');
      document.body.style.userSelect = '';
      const cols = root.style.gridTemplateColumns.match(/([\d.]+)fr/);
      if (cols) {
        browser.storage.local.set({ [RATIO_KEY]: parseFloat(cols[1]) }).catch(() => {});
      }
    };

    gutter.addEventListener('mousedown', (e) => {
      dragging = true;
      e.preventDefault();
      gutter.classList.add('cflc-dragging');
      // Stops the iframe from swallowing the drag once the cursor is over it.
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    browser.storage.local
      .get(RATIO_KEY)
      .then((v) => {
        if (typeof v[RATIO_KEY] === 'number') setRatio(v[RATIO_KEY]);
      })
      .catch(() => {});

    return gutter;
  }

  function initSplit(problem) {
    const pageContent = document.getElementById('pageContent');
    if (!pageContent || !pageContent.querySelector('.problem-statement')) return;

    const root = document.createElement('div');
    root.className = 'cflc-split-root';

    pageContent.parentNode.insertBefore(root, pageContent);
    pageContent.classList.add('cflc-pane-left');
    // The right pane must be built before the sidebar is hidden — it lifts the
    // submit form out of the sidebar, and moving a node out of a hidden parent
    // is fine, but reading one that was never rendered is not.
    root.append(pageContent, makeGutter(root), buildRightPane(problem));

    document.documentElement.classList.add('cflc-split');

    // The grid needs a concrete height, and how far down the page it starts
    // depends on the header CF rendered.
    const setTop = () => {
      const top = root.getBoundingClientRect().top + window.scrollY;
      document.documentElement.style.setProperty(
        '--cflc-split-top',
        `${Math.round(top + 16)}px`
      );
    };
    setTop();
    window.addEventListener('resize', setTop);
  }

  /* --------------------------------------------------------------- run --- */

  function run() {
    // Inside our own pane this document is the submit page, not a problem page.
    if (window !== window.top) {
      if (/\/submit(\/|$)/.test(location.pathname)) initFrame();
      return;
    }

    const problem = resolveProblem();
    if (!problem) return;

    globalThis.CFLC.settingsPromise.then((settings) => {
      if (settings.features.splitPane) initSplit(problem);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
