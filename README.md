# cup-ui

> Framework-agnostic, a11y-first Web Component library. Drop a tag, it's there.

## ⚠️ Read-Only Mirror

This repository is **automatically synced** from the private
[codeupipe](https://github.com/orchestrate-solutions/codeupipe) monorepo.
**Do not open PRs or push directly** — changes will be overwritten on the
next sync.

To contribute, submit changes to the `cup-ui/` directory in the codeupipe repo.

---

## Install

```bash
npm install github:orchestrate-solutions/cup-ui
```

## Usage

```html
<link rel="stylesheet" href="node_modules/cup-ui/cup.css">
<script type="module" src="node_modules/cup-ui/cup.js"></script>

<cup-button>Click me</cup-button>
<cup-slider label="Volume" min="0" max="100"></cup-slider>
```

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
| `<cup-divider>` | Visual separator |
| `<cup-skeleton>` | Loading placeholder |
| `<cup-stepper>` | Step indicator |
| `<cup-toast>` | Toast notifications |
| `<cup-theme-picker>` | Theme switching |

## CSS Layers

```
cup-tokens → cup-reset → cup-base → cup-components → cup-utilities
```

Import individual layers or the full bundle via `cup.css`.

## License

Apache-2.0 — See [LICENSE](LICENSE).

---

*Auto-synced from codeupipe. Last sync triggered by CI.*
