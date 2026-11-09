# Changelog

## Unreleased

This repository is now the source of cup-ui. Before this, the public repo was a
mirror of a private monorepo, copied by hand. Nothing was published by this
change.

### Added

- The source of all components in one place: `<cup-audio-wave>` and
  `<cup-viewport>` (from the live app copy), and the diagram components
  `<cup-graph>`, `<cup-node>` and `<cup-edge>` (from the public mirror).
- Copy-button styles for code blocks in `css/prose.css`.
- New icons in `icons/cup-icons.svg` (`icon-back-5`, `icon-copy`, `icon-download`,
  `icon-forward-5`, `icon-loader`, `icon-pause`, `icon-play`, `icon-retry`,
  `icon-stop`).
- New layer files: `css/layers/elements.css` (layer `cup-elements`),
  `css/layers/components.css` (layer `cup-components`) and
  `css/layers/patterns.css` (layer `cup-patterns`).
- `npm test` serves the directory and runs all Cypress specs. `npm run serve:test`
  serves it alone.
- Component tests for every component that had none, and a test that the old
  layer file names give the same styles as the new files.
- `RULES.md`: the levels and the rules for a new part.

### Changed

- Layer names: `cup-nano` becomes `cup-elements`, `cup-micro` becomes
  `cup-components`, `cup-component` becomes `cup-patterns`. The styles are the
  same. `cup.css` loads the new layer files and keeps the old layer names as empty
  placeholders in the same cascade order.
- `README.md` describes the real layers and states that this repo is the source.
- `docs/filters/render_sections.js` keeps the page `<h1>` when it renders the
  sections. The `<h1>` was removed on load.
- The `cup-graph` tests read the `selected` attribute with `getAttribute`.
  Cypress `have.attr` reads it through jQuery, which returns the attribute name for
  `selected`.
- The SEO test for the ItemList JSON-LD waits for it, instead of reading it once.

### Deprecated

- The old file names `css/nano.css`, `css/micro.css` and `css/components.css`
  and the old layer names `cup-nano`, `cup-micro` and `cup-component`. They still
  work. Use `css/layers/*.css` and the new layer names in new code. There is no
  removal date.
