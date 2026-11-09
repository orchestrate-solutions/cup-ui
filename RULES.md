# cup-ui rules

The levels of cup-ui and the rules for a new part.

## Layers

Ladder: tokens → elements → components → patterns. Features and screens live in
apps.

| Old name | New name | Old file | New file |
| --- | --- | --- | --- |
| `cup-nano` | `cup-elements` | `css/nano.css` (now a shim) | `css/layers/elements.css` |
| `cup-micro` | `cup-components` | `css/micro.css` (now a shim) | `css/layers/components.css` |
| `cup-component` | `cup-patterns` | `css/components.css` (now a shim) | `css/layers/patterns.css` |

- `cup.css` order: `cup-reset, cup-tokens, cup-elements, cup-nano, cup-components, cup-micro, cup-patterns, cup-component, cup-motion, cup-theme, cup-override`. The old names are empty placeholders, so the relative order of the old and new layers is the same as before.
- `cypress/component/layers.cy.js` checks that each old file gives the same computed styles as its new file, for every `.cup-*` class in it. It also checks that the sanity case differs (the sheet changes something).
- Not moved (they still use old layer names and still work): `css/prose.css` and `css/diagram.css` use `cup-component`; `a11y.css` uses `cup-nano`.

## Component rules

- **R1. Four levels, and features above them.** tokens, elements, components, patterns. Features and screens are not in cup-ui.
- **R2. Each level has one CSS layer.** elements = `cup-elements`, components = `cup-components`, patterns = `cup-patterns`. The layer names and files are in "Layers" above.
- **R3. Small parts compose bigger parts.** A components-level part is built from elements. A patterns-level part is built from components and elements.
- **R4. A missing small part is added first, with tests.** Do not build a larger part around a gap.
- **R5. Every component extends `CupElement`.** It is in `cup-element.js`. Exception: `cup-inspector.js` is a helper module with no element.
- **R6. Shadow DOM is opt-in.** Set `static shadow = true` in a subclass.
- **R7. Class names.** Block: `cup-<name>`. Part: `cup-<name>___<part>`. Modifier: `cup-<name>--<mod>`.
- **R8. Semantic tokens, no raw colors.** Use `--cup-color-*` tokens, not hex.
- **R9. No `!important`** except in the `prefers-reduced-motion` reset.
- **R10. Focus, touch and motion.** Every interactive part has a `:focus-visible` ring, a 44px minimum touch target, and works with reduced motion.
- **R11. Tests mirror source.** `components/cup-x.js` has `cypress/component/cup-x.cy.js`. Tests run in Cypress against `cypress/harness.html`.
- **R12. Styles go in the right layer.** New styles go in the layer for their level, and after the cup layers if they are custom.
