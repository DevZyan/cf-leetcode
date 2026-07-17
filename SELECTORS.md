# Selectors

Every selector this extension targets is recorded here **before** it ships.

Rules:

- `Verified?` is `yes` only when the selector was read out of a real HTML dump
  from the live site, and the dump is named in `Source`.
- Anything not verified is a `TODO` row. TODO rows do not get CSS written
  against them. Guessing at Codeforces markup from memory is how this breaks.
- Dumps live in `docs/html dump/` (gitignored — they contain a handle and a
  CSRF token; scrub before committing any).

## Dumps on hand

| Key | File                                                          | Captured   |
| --- | ------------------------------------------------------------- | ---------- |
| P1  | `Problem - 4A - Codeforces.htm` (`/problemset/problem/4/A`)   | 2026-07-17 |
| P2  | `Problem - A - Codeforces.htm` (`/contest/2244/problem/A`)    | 2026-07-17 |
| S1  | `Submit Code - Codeforces.htm` (`/contest/2244/submit`)       | 2026-07-17 |
| L1  | `Problemset - Codeforces.htm` (`/problemset`)                 | 2026-07-17 |
| D1  | `Dashboard - Codeforces Round 1109 (Div. 3) - Codeforces.htm` | 2026-07-17 |

All captured via Inspector → Copy → Outer HTML, so they are post-jQuery DOM.

## Page skeleton (all pages)

| Selector                                        | Verified | Source     | Notes                                                                            |
| ----------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------- |
| `#body`                                         | yes      | P2:429     | Outer wrapper.                                                                   |
| `#header`                                       | yes      | P2:451     | Logo `<img>`, `.lang-chooser`, `.menu-list-container`.                           |
| `.menu-list-container`                          | yes      | P2:481     | Top nav bar.                                                                     |
| `#sidebar`                                      | yes      | P2:539     | **Sibling of `#pageContent`, and comes _first_ in DOM.** Floated right visually. |
| `#pageContent.content-with-sidebar`             | yes      | P2:1116    | Main column. Class drops to plain `#pageContent` when a page has no sidebar.     |
| `#footer`                                       | yes      | P2:1431    | —                                                                                |
| `.second-level-menu`, `.second-level-menu-list` | yes      | P2:1117    | Contest tab strip (Problems / Submit Code / My Submissions / …).                 |
| `.roundbox`, `.roundbox.sidebox`                | yes      | P2:542,774 | CF card. Corner spacers `.lt/.rt/.lb/.rb` are empty divs — hidden by us.         |
| `.roundbox .caption.titled`                     | yes      | P2:775     | Card title. Text content starts with a literal `→`.                              |
| `.datatable`                                    | yes      | L1:1427    | Wrapper div, has **inline** `background-color: #E1E1E1` — needs `!important`.    |
| `.ttypography`                                  | yes      | P1:1247    | Prose wrapper around statements.                                                 |

## 1. Problem statement (`/problemset/problem/*`, `/contest/*/problem/*`)

| Selector                                        | Verified | Source  | Notes                                                                                                                             |
| ----------------------------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `.problemindexholder[problemindex]`             | yes      | P1:1242 | Also carries `data-uuid`. Attribute holds the index, e.g. `A`.                                                                    |
| `.problem-statement`                            | yes      | P1:1247 | Inside `.ttypography`.                                                                                                            |
| `.problem-statement > .header`                  | yes      | P1:1247 | Contains the five blocks below.                                                                                                   |
| `.header .title`                                | yes      | P1:1247 | e.g. `A. Watermelon`.                                                                                                             |
| `.header .time-limit`, `.header .memory-limit`  | yes      | P1:1247 | Each has a `.property-title` child label.                                                                                         |
| `.header .input-file`, `.header .output-file`   | yes      | P1:1247 | Also `.input-standard` / `.output-standard` when stdin/stdout.                                                                    |
| `.problem-statement > div:not([class])`         | yes      | P1:1247 | **The legend/body has no class.** Positional selector — fragile, noted.                                                           |
| `.input-specification`, `.output-specification` | yes      | P1:1247 | Each has a `.section-title` child.                                                                                                |
| `.sample-tests`, `.sample-test`                 | yes      | P1:1247 | `.sample-test > .input > pre` and `> .output > pre`. `.title` labels.                                                             |
| `.note`                                         | yes      | P1:1247 | —                                                                                                                                 |
| `span.tex-span`, `.tex-font-style-tt`           | yes      | P1:1247 | Old problems (4A) render math as `.tex-span`, **not** MathJax.                                                                    |
| `.diff-notifier`                                | yes      | P1:1243 | CF shows/hides this itself. Do not touch `display`.                                                                               |
| MathJax                                         | partial  | P1:1252 | `Codeforces.addMathJaxListener` exists; 4A has no MathJax output to see. Newer problems use `$$$`. Leave all math nodes unstyled. |

## Submit form

| Selector                                               | Verified | Source          | Notes                                                                      |
| ------------------------------------------------------ | -------- | --------------- | -------------------------------------------------------------------------- |
| `form.submitForm`                                      | yes      | S1, P2:780      | Present on both the submit page and the problem-page sidebar.              |
| `form.submitFrameForm`                                 | yes      | P2:780          | Sidebar variant. CF's JS rewrites its `action` on load — do not touch.     |
| `#editor`                                              | yes      | S1:998          | **CF already ships the ACE editor.** No need to bundle one.                |
| `#sourceCodeTextarea`                                  | yes      | S1:997          | `name="source"`, `hidden`. ACE writes into it on submit.                   |
| `#toggleEditorCheckbox`                                | yes      | S1:999          | "Switch off editor" — CF toggles textarea/ACE visibility. Do not fight it. |
| `#tabSizeInput`, `.tabSizeDiv`                         | yes      | S1:1002         | —                                                                          |
| `select[name="programTypeId"]`                         | yes      | S1:988, P2:793  | Language.                                                                  |
| `select[name="submittedProblemIndex"]`                 | yes      | S1:897          | Submit page only. `<option value="A">` + `data-time-limit` etc.            |
| `input[name="sourceFile"]`                             | yes      | S1:1012, P2:877 | File upload.                                                               |
| `#singlePageSubmitButton`                              | yes      | S1:1023         | Submit page button.                                                        |
| `#sidebarSubmitButton`                                 | yes      | P2:890          | Sidebar button. Sidebar form has **no** textarea — file upload only.       |
| `.table-form`, `.field-name`, `.field`                 | yes      | S1, P2          | Form layout table.                                                         |
| `input[name="turnstileToken"]`, `.turnstile-container` | yes      | P2:784,818      | **Cloudflare Turnstile.** Anti-bot on submission — see README risk note.   |
| `input[name="csrf_token"]`, `ftaa`, `bfaa`             | yes      | P2:781-783      | Never touch, move, or clone these.                                         |

## 2. Problemset list (`/problemset`)

| Selector                                | Verified | Source  | Notes                                                                                                  |
| --------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `table.problems`                        | yes      | L1:1453 | Inside `.datatable`.                                                                                   |
| `table.problems td.id`                  | yes      | L1:1476 | e.g. `2246F`, wraps an `<a>`.                                                                          |
| `table.problems td.act`                 | yes      | L1:1490 | Submit icon + `.toggle-favourite` star.                                                                |
| `td.act a[href^="/problemset/submit/"]` | yes      | L1:1492 | **Confirms submit URL shape: `/problemset/submit/{contestId}/{index}`.**                               |
| `table.problems tr > td:nth-child(4)`   | yes      | L1:1535 | Difficulty rating. **No class on the cell**; positional. May be empty for unrated problems (2246F is). |
| `.ProblemRating{N}`                     | partial  | L1:1370 | CF defines these in CSS but no dump row uses one. Not relied on.                                       |

## 3. Submissions / status

_No dump. TODO._

## 4. Profile

_No dump. TODO._

## 5. Contest list + standings

| Selector  | Verified | Source  | Notes                                |
| --------- | -------- | ------- | ------------------------------------ |
| `.rtable` | yes      | L1:1308 | Sidebar tables (contest list block). |

## Rating colors — BLOCKED

| Selector                                                                                                                               | Verified | Source | Notes                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `a.rated-user`                                                                                                                         | yes      | P2:311 | Confirmed to exist — CF's own JS selects `a.rated-user` by handle text.                                                                                                                                                                                                                                                                        |
| `.user-legendary`, `.user-red`, `.user-orange`, `.user-violet`, `.user-blue`, `.user-cyan`, `.user-green`, `.user-gray`, `.user-admin` | **TODO** | —      | **None of the five dumps contains a single rendered rated handle**, so the real class names are unconfirmed. `tokens.css` defines `--cflc-rank-*` but nothing consumes them yet. Handles are left at CF's own colors, which means dark-blue/dark-green handles have poor contrast on the dark theme. Needs a standings or profile dump to fix. |
| `span.participant`                                                                                                                     | yes      | P2:311 | Same CF JS selector. Unstyled for now.                                                                                                                                                                                                                                                                                                         |
