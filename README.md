# cf-leetcode

A Firefox extension that restyles [Codeforces](https://codeforces.com) with a
LeetCode-inspired design system: near-black surfaces, elevated card layers,
1px hairline borders, difficulty pills derived from problem rating.

**Unofficial.** Not affiliated with, endorsed by, or connected to Codeforces or
LeetCode. This is an original implementation _inspired by_ LeetCode's layout —
no LeetCode CSS, assets, logo, or other proprietary material is copied or
redistributed. All icons are original.

It is a pure visual reskin. It does not scrape, does not call any API, makes
zero network requests, sends no analytics, and does not touch submission
behavior or anything that could affect contest integrity.

## Status

Working, unpolished. Baseline theme, problem statement, split pane and
problemset pills are in. Submissions, profile and standings get the baseline
theme only. Handle rating colors are unfinished — see
[CHANGELOG.md](CHANGELOG.md) for the known gaps.

## The split pane, and how it treats your submissions

On a problem page the statement goes left and Codeforces' **own submit form**
moves into a pane on the right.

Moves, not copies. The form is relocated with `appendChild`, which relocates
the live node — so every jQuery handler Codeforces bound to it, and its
`csrf_token`, `ftaa`, `bfaa` and `turnstileToken` inputs, come along untouched.
Submitting runs entirely through Codeforces' own code path. The extension never
rebuilds the form, never posts it, and makes no network requests of its own.

**The one substantive change.** CF's sidebar form exposes only file upload,
while carrying a hidden `<input name="source">`. The pane swaps that hidden
input for a visible `<textarea>` of the same name — the same field CF's own
full submit page posts. Nothing is introduced that Codeforces did not already
define, but this _is_ the line, and it is worth knowing where it sits.

**So test one throwaway submission before trusting it in a contest.** If
anything looks off, **Open full page ↗** in the pane header goes to CF's
untouched submit page, and the pane can be switched off entirely:
Preferences → Features → Split pane.

An earlier version framed CF's submit page in an `<iframe>` instead, which
would have given you CF's ACE editor for free. Codeforces refused to be framed,
and Cloudflare Turnstile inside a frame was never a safe bet during a contest.
Hence a plain monospace textarea: no syntax highlighting, no bundled editor, no
dependencies.

## Install

### Temporary (for development / trying it out)

Lasts until Firefox restarts.

1. Clone this repo.
2. Open `about:debugging#/runtime/this-firefox`.
3. **Load Temporary Add-on…** → pick `manifest.json` in the repo root.

Or, with the dev deps installed, `npm install && npm run dev` — `web-ext` opens
a scratch Firefox profile with the extension loaded and reloads on file change.

### Permanent (unlisted AMO signing)

Firefox release/ESR will not run unsigned extensions permanently, so a personal
install still has to go through Mozilla — but "unlisted" signing keeps it off
the public add-ons directory.

1. Get an AMO API key/secret at
   <https://addons.mozilla.org/developers/addon/api/key/>.
2. Set a unique `browser_specific_settings.gecko.id` in `manifest.json` (the
   placeholder `cf-leetcode@devzyan.github.io` will collide — use your own domain or
   an email-shaped id you control).
3. Sign:

   ```sh
   npx web-ext sign --channel=unlisted \
     --api-key="$AMO_JWT_ISSUER" \
     --api-secret="$AMO_JWT_SECRET"
   ```

4. `web-ext` drops a signed `.xpi` in `dist/`. Install it via
   `about:addons` → gear icon → **Install Add-on From File…**.

Unlisted add-ons are signed automatically and are not human-reviewed, but they
still must pass `web-ext lint`. `npm run build` produces the unsigned zip if you
would rather upload through the AMO web UI.

## Scripts

| Script           | Does                                         |
| ---------------- | -------------------------------------------- |
| `npm run dev`    | `web-ext run` — scratch profile, live reload |
| `npm run lint`   | `web-ext lint` + stylelint + prettier check  |
| `npm run format` | prettier --write                             |
| `npm run build`  | zip into `dist/`, ready for AMO signing      |

## Permissions

| Permission               | Why                                                    |
| ------------------------ | ------------------------------------------------------ |
| `storage`                | Persist theme, difficulty thresholds, feature toggles. |
| `*://*.codeforces.com/*` | Inject the stylesheet. Scoped to Codeforces only.      |

Nothing else. No `tabs`, no `<all_urls>`, no host permission for any other
origin.

## How the theme is applied

`src/js/bootstrap.js` runs at `document_start`, reads `storage.sync`, and sets
`data-cf-theme="dark|light"` on `<html>`. `"auto"` is resolved to a concrete
value there rather than in CSS, so stylesheets only ever match two states; the
raw preference stays readable as `data-cf-theme-pref`.

Storage reads are async, which leaves a few milliseconds where the attribute is
not set yet. `tokens.css` covers that window by falling back to
`prefers-color-scheme` for `html:not([data-cf-theme])`, so anyone whose OS theme
matches their chosen theme sees no flash.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The short version: Codeforces markup is
idiosyncratic and selectors are never guessed — every one is recorded in
[SELECTORS.md](SELECTORS.md) with the dump it was verified against.

## Screenshots

_To add._

## License

[MIT](LICENSE).
