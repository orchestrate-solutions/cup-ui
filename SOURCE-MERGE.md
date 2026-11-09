# SOURCE-MERGE: one source for cup-ui

Date: 2026-11-09. Branch: `one-source` (in this clone only; nothing pushed).

## 1. The three copies

| Copy | Where it was read | Notes |
| --- | --- | --- |
| Public mirror | `github.com/orchestrate-solutions/cup-ui`, `main` at `8d4d09f`, cloned to `~/dev/cup-ui` | 141 files, including `.gitignore` and `LICENSE` |
| Old source | `~/Documents/github/codeupipe/cup-ui` (git `HEAD` of `codeupipe`) | 139 files. Working tree differs only in `css/prose.css` (copy-button styles, not committed). Two files were iCloud "dataless", so their content was read from git `HEAD`. `solutions_old` is not on this machine; this folder is the local clone named in `products/cup-ui.md` |
| Live copy | `~/cup-worktrees/copilot-tools/cup-ui` (solutions worktree) | 133 files. Read only |

Every file was compared by md5 across the three copies. The only files that
differ are listed below. All other files are identical in all three copies.

## 2. Difference map

Rule used: where one copy is a superset of the others, keep the superset. Where
two copies differ in disjoint parts, keep both. No file had two conflicting
edits, so no stop was needed.

| File | What each copy has | Kept | Reason |
| --- | --- | --- | --- |
| `components/cup-audio-wave.js`, `cypress/component/cup-audio-wave.cy.js` | live only | added | used by the live app; no other copy has it |
| `components/cup-viewport.js`, `cypress/component/cup-viewport.cy.js` | live only | added | same |
| `components/cup-node.js`, `cup-edge.js`, `cup-graph.js` and their `.cy.js` tests, `css/diagram.css`, `diagram.html`, `quiz.html`, `cypress/fixtures-diagram/` | public and old only | kept | the live copy does not have them. They came from codeupipe commit `79f1c916`, the newest of the three |
| `css/prose.css` | public = old `HEAD`; old working tree adds copy-button styles; live = public | old working tree | superset. The copy-button styles were asked for by the contract |
| `css/components.css` | live adds audio-wave and viewport styles; public = old | live | superset. The diff has only added lines |
| `icons/cup-icons.svg` | live adds 9 icons (`icon-back-5`, `icon-copy`, `icon-download`, `icon-forward-5`, `icon-loader`, `icon-pause`, `icon-play`, `icon-retry`, `icon-stop`); the 13 shared ids are the same | live | superset |
| `cup.js` | public and old import the diagram components; live imports audio-wave and viewport and not the diagrams | union | disjoint edits, so both kept |
| `cup.css` | public and old import `css/diagram.css`; live does not | public | superset |
| `README.md` | live adds a viewport row and a Tests section | rewritten | union, plus the layer ladder (section 5) |
| `package.json` | live adds a `serve:test` script | union | plus `test` (see section 7) |
| `cypress.config.js` | live adds `baseUrl` `http://127.0.0.1:8765` | live | needed by the component tests that open the harness |
| `.gitignore`, `LICENSE` | public only | kept | repository files. See open question Q1 for the license |

## 3. What this task changed

- Layers: the CSS moved into `css/layers/` (section 5). Old file names are shims.
- `docs/filters/style_tap.js` and `docs/tests.html` use the new layer names.
- Tests: a test for each component that had none (15 new files), and
  `cypress/component/layers.cy.js`. The audio-wave and viewport tests came from the live copy.
- Test fixes (section 4), and one docs fix.
- `scripts/test.sh`: `npm test` starts the server and runs all specs.
- `README.md` and `CHANGELOG.md`.

## 4. Failing tests: which side was wrong

### cup-graph, 3 tests (`selects a node on click...`, `selects with the keyboard`, `does not move nodes when readonly...`)

The test was wrong. Cypress `have.attr` reads the value through jQuery. jQuery
treats `selected` as a boolean attribute, so it returns the attribute name
(`selected`) and not the value (`b`). The component is correct: the DOM has
`selected="b"`. A browser check and a debug spec read `getAttribute('selected')`
and got `b`. Fix: the three assertions read `getAttribute`. The component API is
unchanged.

### SEO, ItemList JSON-LD (`ItemList JSON-LD is injected for components`)

The test was wrong. It read the JSON-LD scripts once, in a `.then` callback. It
did not retry. The playground pipeline adds the ItemList a moment after load, so
the first read found only the other scripts. Fix: a `.should` callback, which
retries.

### SEO, h1 before h2 (found in a later run)

The app was wrong. `docs/filters/render_sections.js` ran `main.innerHTML = ''`.
That removed the page's visually hidden `<h1>`, so the published page had no h1.
The h1 matters for screen readers and search. Fix: the filter removes the
rendered children and keeps the `<h1>`. Nothing else changed.

### cup-viewport, three CDN tests

These depend on the network, and failed in one run with a timeout. Fix: the
two Tailwind tests and the one https stylesheet test run only when
`CDN_TESTS=1` is set. The default run skips them (3 pending). A new test checks
the policy instead: the frame's CSP allows style sheets from `https:` only, so a
sheet from a plain `http` address does not apply.

## 5. Layers

Ladder: tokens → elements → components → patterns. Features and screens live in
apps.

| Old name | New name | Old file | New file |
| --- | --- | --- | --- |
| `cup-nano` | `cup-elements` | `css/nano.css` (now a shim) | `css/layers/elements.css` |
| `cup-micro` | `cup-components` | `css/micro.css` (now a shim) | `css/layers/components.css` |
| `cup-component` | `cup-patterns` | `css/components.css` (now a shim) | `css/layers/patterns.css` |

- `cup.css` order: `cup-reset, cup-tokens, cup-elements, cup-nano, cup-components, cup-micro, cup-patterns, cup-component, cup-motion, cup-theme, cup-override`. The old names are empty placeholders, so the relative order of the old and new layers is the same as before.
- `cypress/component/layers.cy.js` checks that each old file gives the same computed styles as its new file, for every `.cup-*` class in it. It also checks that the sanity case differs (the sheet changes something).
- Not moved (they still use old layer names and still work): `css/prose.css` and `css/diagram.css` use `cup-component`; `a11y.css` uses `cup-nano`. See finding F11.

## 6. Component rules

Each rule has its source in brackets.

- **R1. Four levels, and features above them.** tokens, elements, components, patterns. Features and screens are not in cup-ui. [Joshua, reviewer note of 2026-11-09]
- **R2. Each level has one CSS layer.** elements = `cup-elements`, components = `cup-components`, patterns = `cup-patterns`. The layer names and files are in section 5. [`cup.css`; old names from `stylus` skill]
- **R3. Small parts compose bigger parts.** A components-level part is built from elements. A patterns-level part is built from components and elements. [Joshua, reviewer note; example: `cup-field.js` header says "Composes: label + input + hint + error"]
- **R4. A missing small part is added first, with tests.** Do not build a larger part around a gap. [Joshua, reviewer note]
- **R5. Every component extends `CupElement`.** It is in `cup-element.js`. Exception: `cup-inspector.js` is a helper module with no element (F13). [`cup-element.js`]
- **R6. Shadow DOM is opt-in.** Set `static shadow = true` in a subclass. [`cup-element.js`, the "Shadow DOM Valve" comment]
- **R7. Class names.** Block: `cup-<name>`. Part: `cup-<name>___<part>`. Modifier: `cup-<name>--<mod>`. [`stylus` skill example `.cup-shell___sidebar`; `components.css`]
- **R8. Semantic tokens, no raw colors.** Use `--cup-color-*` tokens, not hex. [`stylus` skill, "Use semantic color tokens (not raw hex)"; `cup-html` anti-patterns]
- **R9. No `!important`** except in the `prefers-reduced-motion` reset. [`stylus` skill, "Never use !important except in prefers-reduced-motion resets"; `cup-html` rule 4]
- **R10. Focus, touch and motion.** Every interactive part has a `:focus-visible` ring, a 44px minimum touch target, and works with reduced motion. [`stylus` skill, "When Adding New Components" checklist; `cup-html` accessibility]
- **R11. Tests mirror source.** `components/cup-x.js` has `cypress/component/cup-x.cy.js`. Tests run in Cypress against `cypress/harness.html`. [`codeupipe` CLAUDE.md, "Tests mirror source"; the file layout in this repo]
- **R12. Styles go in the right layer.** New styles go in the layer for their level, and after the cup layers if they are custom. [`stylus` skill, "New styles go in the correct layer"; `cup-html` rule 3]

## 7. Findings (not fixed)

These were found while checking the rules. Per the reviewer note, none is fixed here.

- **F1. `cup-button`** (components): no element parts. [R3]
- **F2. `cup-badge`** (components): no element parts. [R3]
- **F3. `cup-chip`** (components): no element parts. [R3]
- **F4. `cup-toggle`** (components): no element parts, and it uses shadow DOM. Its CSS has hex fallbacks in `var()`. [R3, R8]
- **F5. `cup-radio-group`** (components): no element parts. [R3]
- **F6. Patterns with no component or element parts:** `cup-toast`, `cup-stepper`, `cup-progress`, `cup-canvas`. Each builds its own markup. [R3]
- **F7. `cup-skeleton`** uses shadow DOM and has hex fallbacks in `var()`. [R8]
- **F8. Color literals in JavaScript:** `cup-audio-wave` (2), `cup-canvas` (2), `cup-inspector` (6), `cup-viewport` (2). `cup-theme-picker` has about 200 hex strings, mostly preset palettes (data). These were not checked line by line. [R8]
- **F9. `!important` outside reduced motion:** `css/layers/patterns.css` lines 1031, 1601, 1781, 1782, 1933, 1934; `css/print.css` lines 22, 69, 70 (print media, not reduced motion). [R9]
- **F10. Inline styles:** `cup-field` sets the required mark with `style="color:var(--cup-color-error)"`. `cup-powered-by` sets `opacity` from JavaScript. [R12]
- **F11. Old layer names still in use:** `css/prose.css` and `css/diagram.css` (`cup-component`), `a11y.css` (`cup-nano`). They work through the placeholders. Move them to the new names in the next task. [section 5]
- **F12. No level stated for:** `cup-agent-chat`, `cup-audio-wave`, `cup-calendar`, `cup-calendar-block`, `cup-calendar-event`, `cup-calendar-row`, `cup-calendar-toolbar`, `cup-graph`, `cup-node`, `cup-edge`, `cup-markdown`, `cup-theme-picker`, `cup-viewport`. No doc gives their level. Decide in the next task. [R1]
- **F13. `cup-inspector.js`** is a helper module, not an element. It does not extend `CupElement`. [R5 exception]
- **F14. `cup-theme-picker`** is not in `cup.js`. `cup-powered-by` loads it on first use. This is documented in `cup.js`. It is not a violation, but apps that want it must know. [R1]
- **F15. `cup-markdown.js` has 4 NUL bytes** in its parser. They are placeholders for code spans (`\x00N\x00`). They are intended. Tools such as `grep` treat the file as binary. [not a rule violation]

## 8. Tests

Commands and exit codes, run in `~/dev/cup-ui` on `one-source`:

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci` | 0 | installed. Cypress binary already cached (`npx cypress verify` passed) |
| `npm test` | 0 | 437 tests: 434 passing, 3 pending (CDN, gated), 0 failing. All specs passed |
| `npm run test:component` | 0 | 349 tests: 346 passing, 3 pending (CDN), 0 failing |
| `npm run test:e2e` | 0 | 88 tests passing, 0 failing |

The clean-checkout run is in section 10.

## 9. Drafts (not applied)

### `products/cup-ui.md` (new text, source: this repo)

```markdown
# cup-ui

Pointer. cup-ui lives in its own repo; nothing of it is copied here.

**Name may change.** A rebrand is being considered. If it happens, rename
this file and update the table in [README.md](README.md).

A framework-agnostic, accessibility-first Web Component library: CSS
tokens, a reset, themes and `<cup-*>` components.

| | |
|---|---|
| Source | [orchestrate-solutions/cup-ui](https://github.com/orchestrate-solutions/cup-ui) (this repo is the source; it is no longer a mirror) |
| Site | [orchestrate-solutions.github.io/cup-ui](https://orchestrate-solutions.github.io/cup-ui) |
| Version | 0.1.0 in `package.json`. No tags or releases yet |
| Install | `npm install github:orchestrate-solutions/cup-ui` |
| Tests | `npm ci && npm test` (see the README) |

## State on 2026-11-09

- The public repo is the one source. It was a hand-synced mirror of
  `solutions_old/cup-ui/` until this date. Its history before this date is in
  codeupipe and solutions_old.
- Merged the three copies into one (branch `one-source`, then `main` after review).
- Joshua decides the license before the next public push (Apache-2.0 in this repo,
  PolyForm Noncommercial in the monorepo LICENSE).
- It is not on npm under its own name. The npm name `cup-ui` belongs to someone else.
```

Dated line for the product README, as the products rules ask: "Source moved to
orchestrate-solutions/cup-ui on 2026-11-09."

### Sync and the live app (not applied)

- `solutions_old/.github/workflows/sync-cup-ui.yml` (read via GitHub API): it wipes
  the public repo and copies `cup-ui/` from codeupipe, keeping only `README.md`,
  `LICENSE` and `.gitignore`. Once this repo is the source, this workflow must be
  **disabled or deleted** before any push. As written, it would overwrite this
  repo with the old copy. Also it copies the monorepo LICENSE over the public one.
- The live app copy (`solutions`, `cup-ui/` folder): replace the folder with a
  dependency on this repo, pinned to a commit or tag:
  `npm install github:orchestrate-solutions/cup-ui#<commit>`. Then delete the folder.
  Check first that the live app does not rely on the removed `cup-ui` folder
  paths.

## 10. Clean checkout

Commit `d2c5c3a` was cloned into an empty folder (`git clone -b one-source`), then:

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci` | 0 | installed |
| `npm test` | 0 | 437 tests: 434 passing, 3 pending (CDN, gated), 0 failing |

## 11. Open questions

- **Q1. License.** Apache-2.0 (this repo, `package.json`) or PolyForm Noncommercial (the monorepo `LICENSE`, copied by the sync workflow). This clone keeps Apache-2.0. Joshua decides.
- **Q2. Levels for F12 components.** Decide before the next component task.
- **Q3. Diagram components in `cup.js`.** They add 3 elements to every app that loads `cup.js`. They were in the public mirror, so they stay. Confirm.
- **Q4. The live copy lacks diagrams.** The union adds them to the live app's build. Check that the live app does not define `cup-node`, `cup-edge` or `cup-graph` itself.
- **Q5. Organisms without parts (F6).** Should `cup-toast`, `cup-stepper`, `cup-progress` and `cup-canvas` be built from components?
- **Q6. `SOURCE-MERGE.md` in the repo.** This file is a working note. Remove it before the first public push if it should not be public.
