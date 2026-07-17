# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Baseline dark/light theme across Codeforces: header, nav, second-level menu,
  `.roundbox` cards, `.datatable` tables, prose, form controls, footer.
- Problem statement restyle: metadata row, section titles, samples as a
  two-column grid. Math nodes (`.tex-span`, MathJax) left untouched.
- LeetCode-style split pane on problem pages — statement left, Codeforces' own
  submit page framed on the right, draggable gutter, width persisted. Falls
  back to a link if the frame cannot load.
- Difficulty pills on the problemset list, derived from the CF rating with
  configurable thresholds.
- Options page: theme, feature toggles, thresholds, "leave standings alone".
- `docs/palette.html` — renders every token in both themes.

### Known gaps

- Rating colors on handles are still Codeforces' own. None of the captured
  dumps contained a rendered rated handle, so the `.user-*` class names are
  unverified and `--cflc-rank-*` is currently unused. Dark-blue and dark-green
  handles have poor contrast on the dark theme until a standings or profile
  dump lands.
- Submissions, profile, contest list and standings have no dumps and are
  covered only by the baseline theme.
- The split pane has not been exercised in a live browser yet.

## [0.1.0] — scaffold

### Added

- Repo scaffold: manifest (MV3, Firefox), npm scripts, prettier, stylelint, CI.
- `src/css/tokens.css` — design tokens for dark and light themes. Declarations
  only; no page is restyled yet.
- Theme bootstrap at `document_start`: reads `storage.sync`, resolves `auto`
  against `prefers-color-scheme`, sets `data-cf-theme` on `<html>`.
- `browser.*` / `chrome.*` shim.
- Options page (theme control only).
- `SELECTORS.md` with the verification policy and the initial TODO rows.

[unreleased]: https://github.com/DevZyan/cf-leetcode/compare/HEAD
