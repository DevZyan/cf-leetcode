# Contributing

## Ground rules

1. **Never guess a Codeforces selector.** CF markup is table-based and
   idiosyncratic. Every selector goes in [SELECTORS.md](SELECTORS.md) with the
   HTML dump it was verified against. If you cannot verify it, file it as a
   `TODO` row instead of shipping it.
2. **Never break Codeforces' own JS.** CF runs jQuery and its own handlers.
   Restyle with CSS injected at `document_start`. Reach for JS only where CSS
   genuinely cannot do the job, and never rebind or remove CF's handlers.
3. **Degrade gracefully.** If a selector goes missing after a CF redesign, the
   page must stay usable. No layout that depends on an element existing.
4. **Zero network.** No fetch, no remote code, no analytics, no CDN fonts.
5. **No LeetCode assets.** No copied CSS, images, logo, or proprietary code.
   Original work only, inspired by their layout.
6. **Don't touch contest integrity.** Nothing that alters submissions,
   standings data, or timing.

## Setup

```sh
npm install
npm run dev     # web-ext run, scratch profile, live reload
npm run lint    # must pass before a PR
```

## Adding a restyle

1. Get a real HTML dump of the page (see below) and put it in
   `docs/html-dumps/`.
2. Write down the structure you are targeting and add rows to `SELECTORS.md`
   with `Verified: yes` and the dump name.
3. Write the CSS against the tokens in `src/css/tokens.css`. Add a new token
   rather than hardcoding a color.
4. Check both themes and check that a logged-out view still works.
5. On problem statements, confirm MathJax still renders.

## Capturing an HTML dump

In Firefox on the page in question: right-click → **Inspect**, then in the
Inspector right-click `<html>` → **Copy** → **Outer HTML**. Paste into
`docs/html dump/<page-type>-<yyyy-mm-dd>.htm`.

Use **Copy → Outer HTML**, not Ctrl+S. Save-as writes the server's original
source; Codeforces renders MathJax client-side and jQuery rewrites parts of the
page, so a saved file shows markup that no longer exists by the time CSS hits
it. Note that even an Outer HTML capture races MathJax — if a statement still
shows raw `$$$`, MathJax had not run yet, and the dump tells you nothing about
its output.

Dumps are gitignored: they contain your handle and a CSRF token. Prettier is
also configured to skip them — they are evidence, and reformatting them
invalidates the `file:line` citations in `SELECTORS.md`.

A dump can only tell you about markup that exists at capture time. Anything CF
builds later — the ACE editor, the lava-lamp menu highlight, MathJax output —
will not be in one. For those, a screenshot of the rendered page is worth more.

## Style

- Prettier and stylelint are enforced in CI. `npm run format` fixes most of it.
- Custom properties are `--cflc-*` (stylelint enforces this).
- JS is vanilla, no build step. `browser.*` with the `chrome.*` shim.
