# cup-ui

> Framework-agnostic, a11y-first Web Component library. Drop a tag, it's there.

**This repository is the source of cup-ui.** It is not a mirror. Make changes
here, run the tests, and commit here. (Until 2026-11-09 the code lived in a
private monorepo and this repo was copied from it by hand.)

cup-ui is one part of the cup/core design system. It has:

- **CSS tokens and a reset**, in `tokens.css` and `reset.css`
- **Themes**, in `themes/`
- **Web Components**, `<cup-*>` tags, in `components/`
- **An icon sprite**, `icons/cup-icons.svg`

It has no dependencies at run time. The tests use Cypress (development only).

## Install

```bash
npm install github:orchestrate-solutions/cup-ui
```

## Use

```html
<link rel="stylesheet" href="node_modules/cup-ui/cup.css">
<script type="module" src="node_modules/cup-ui/cup.js"></script>

<cup-button>Click me</cup-button>
<cup-slider label="Volume" min="0" max="100"></cup-slider>
```

`cup.css` loads every layer. `cup.js` registers every component.

## Test

From a clean checkout:

```bash
npm ci
npm test
```

`npm test` serves this directory on port 8765 and runs every Cypress spec
(component and e2e) headless. Three tests of `<cup-viewport>` load a style
sheet or a script from a public CDN. They are skipped unless you set
`CDN_TESTS=1`, so that the default run does not need the internet:

```bash
CDN_TESTS=1 npm test
```

To run one group, start the server and then run the group:

```bash
npm run serve:test                  # terminal 1
npm run test:component              # terminal 2
npm run test:e2e
```

## Layers

Styles are split into layers, by level. Small parts come first. Larger parts
are built from them.

| Level | Cascade layer | Files | What it holds |
|-------|---------------|-------|---------------|
| tokens | `cup-tokens` | `tokens.css` | Design tokens (custom properties) |
| elements | `cup-elements` | `css/layers/elements.css` | Atomic parts: label, input, hint, error, icon, skeleton, divider |
| components | `cup-components` | `css/layers/components.css` | Parts built from elements: field, button, toggle, badge, chip, ... |
| patterns | `cup-patterns` | `css/layers/patterns.css` | Larger parts built from components: toast, stepper, progress, canvas, ... |

Features and screens are built from patterns. They are not part of cup-ui.
They live in the apps that use it.

**Rule:** small parts compose bigger parts. If a bigger part needs a piece that
does not exist, add the small part first, with its tests.

The full cascade order is in `cup.css`:

```
cup-reset, cup-tokens, cup-elements, cup-nano, cup-components, cup-micro,
cup-patterns, cup-component, cup-motion, cup-theme, cup-override
```

`cup-nano`, `cup-micro` and `cup-component` are the old layer names. They are
kept as empty placeholders, so apps that write into them keep their place in
the order. See the deprecation note in `CHANGELOG.md`.

The old file names still work. Each one only imports its new file:

| Old file | New file |
|----------|----------|
| `css/nano.css` | `css/layers/elements.css` |
| `css/micro.css` | `css/layers/components.css` |
| `css/components.css` | `css/layers/patterns.css` |

## Components

| Component | Description |
|-----------|-------------|
| `<cup-button>` | Enhanced button with loading states |
| `<cup-slider>` | Range slider with label and value display |
| `<cup-progress>` | Progress bar with percentage |
| `<cup-canvas>` | Pointer Events canvas with DPI awareness and palm rejection |
| `<cup-toggle>` | Toggle switch |
| `<cup-checkbox>` | Checkbox with label |
| `<cup-input>` | Text input field |
| `<cup-select>` | Dropdown select |
| `<cup-textarea>` | Multi-line text |
| `<cup-date>` | Date picker |
| `<cup-number>` | Numeric input |
| `<cup-password>` | Password input |
| `<cup-file>` | File upload |
| `<cup-radio-group>` | Radio button group |
| `<cup-badge>` | Status badge |
| `<cup-chip>` | Removable chip/tag |
| `<cup-calendar>` | Time-grid calendar shell for schedules and planners |
| `<cup-calendar-row>` | Calendar resource/person row with click-ready slot cells |
| `<cup-calendar-block>` | Positioned event or blocker pill for calendar grids |
| `<cup-calendar-event>` | Calendar event pill |
| `<cup-calendar-toolbar>` | Calendar navigation and view switch |
| `<cup-divider>` | Visual separator |
| `<cup-skeleton>` | Loading placeholder |
| `<cup-stepper>` | Step indicator |
| `<cup-toast>` | Toast notifications |
| `<cup-theme-picker>` | Theme switching |
| `<cup-markdown>` | Markdown text rendered with the prose styles |
| `<cup-agent-chat>` | Agent run as a chat transcript, with a message composer |
| `<cup-viewport>` | Shows HTML from outside the page, in a frame that fits its content. The HTML can run scripts and cannot reach the page |
| `<cup-audio-wave>` | Waveform of a live audio stream, or of a WAV or MP3 file with play and time |
| `<cup-graph>`, `<cup-node>`, `<cup-edge>` | Diagrams from a JSON spec |

The layer each component belongs to is in `SOURCE-MERGE.md`, "Component
rules". Some components do not have a level yet.

## License

Apache-2.0. See [LICENSE](LICENSE).
