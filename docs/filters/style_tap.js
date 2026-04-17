// style_tap.js — Tap: CSS cascade decomposition for cup/core components.
// Read-only observer — does not modify the payload.
// Shows which @layer set which property, with resolved computed values.
//
// Usage in pipeline:
//   pipeline.addTap(new StyleTap(), 'StyleTap');
//
// Usage standalone:
//   const report = StyleTap.inspect(element);
//   StyleTap.overlay(element);

// ── Layer → Property Map ──────────────────────────────────────────
// Static map of which cup @layer is responsible for which CSS properties.
// Since we control all layers, this is deterministic — no runtime parsing.

const LAYER_MAP = {
  'cup-reset': {
    label: 'Reset',
    properties: ['box-sizing', 'margin', 'padding'],
  },
  'cup-tokens': {
    label: 'Tokens',
    properties: [], // tokens are custom properties, resolved in other layers
  },
  'cup-nano': {
    label: 'Nano',
    properties: [
      'display', 'font-size', 'font-weight', 'color', 'line-height',
      'width', 'height', 'border', 'border-radius', 'background-color',
      'background-image', 'background-size', 'animation', 'outline',
      'outline-offset',
    ],
  },
  'cup-micro': {
    label: 'Micro',
    properties: [
      'display', 'gap', 'align-items', 'justify-content', 'cursor',
      'padding', 'font-size', 'font-weight', 'color', 'background-color',
      'border', 'border-radius', 'transition', 'min-height', 'appearance',
      'text-decoration',
    ],
  },
  'cup-component': {
    label: 'Component',
    properties: [
      'display', 'flex-direction', 'contain', 'overflow', 'position',
      'padding', 'border-radius', 'background-color', 'box-shadow',
      'content-visibility',
    ],
  },
  'cup-theme': {
    label: 'Theme',
    properties: ['color-scheme'],
  },
  'cup-override': {
    label: 'Override',
    properties: [
      'font-size', 'padding', 'min-height', 'position', 'transform',
      'width', 'max-width', 'flex-direction',
    ],
  },
};

// Token properties to always capture — the semantic design tokens
const TOKEN_PROPERTIES = [
  '--cup-color-surface', '--cup-color-on-surface', '--cup-color-surface-alt',
  '--cup-color-primary', '--cup-color-on-primary', '--cup-color-secondary',
  '--cup-color-error', '--cup-color-success', '--cup-color-warning',
  '--cup-color-info', '--cup-color-border', '--cup-color-focus',
  '--cup-color-disabled', '--cup-color-on-disabled', '--cup-color-placeholder',
  '--cup-space-xs', '--cup-space-sm', '--cup-space-md', '--cup-space-lg', '--cup-space-xl',
  '--cup-font-size-xs', '--cup-font-size-sm', '--cup-font-size-base',
  '--cup-font-size-lg', '--cup-font-size-xl', '--cup-font-size-2xl',
  '--cup-radius-sm', '--cup-radius-md', '--cup-radius-lg', '--cup-radius-full',
  '--cup-transition-fast', '--cup-transition-normal', '--cup-transition-slow',
  '--cup-shadow-sm', '--cup-shadow-md', '--cup-shadow-lg',
];

// Properties that matter for visual debugging
const VISUAL_PROPERTIES = [
  'display', 'position', 'width', 'height', 'min-height', 'max-width',
  'padding', 'margin', 'gap',
  'color', 'background-color', 'border', 'border-radius', 'box-shadow',
  'font-size', 'font-weight', 'line-height', 'font-family',
  'transition', 'animation', 'transform', 'opacity',
  'outline', 'outline-offset', 'cursor',
  'overflow', 'contain', 'content-visibility',
  'flex-direction', 'align-items', 'justify-content',
];

// ── StyleTap ──────────────────────────────────────────────────────
export class StyleTap {

  /**
   * Tap interface — observe payload, log style state of cup elements.
   * @param {Payload} payload
   */
  observe(payload) {
    const main = payload.get('main');
    if (!main) return;

    const cupElements = main.querySelectorAll('[class*="cup-"]');
    const summary = { elements: cupElements.length, layers: {} };

    for (const layer of Object.keys(LAYER_MAP)) {
      summary.layers[layer] = 0;
    }

    cupElements.forEach(el => {
      const report = StyleTap.inspect(el);
      for (const [layer, props] of Object.entries(report.layers)) {
        if (Object.keys(props).length > 0) {
          summary.layers[layer] += Object.keys(props).length;
        }
      }
    });

    console.groupCollapsed('[StyleTap] cascade summary');
    console.table(summary.layers);
    console.log(`${summary.elements} cup elements inspected`);
    console.groupEnd();
  }

  /**
   * Inspect a single element — decompose its computed styles by cup @layer.
   * Uses el.state (CssState) when available (CupElement fast path),
   * falls back to getComputedStyle for plain HTML elements.
   * @param {HTMLElement} element
   * @returns {{ tag: string, classes: string[], layers: Object, tokens: Object, computed: Object }}
   */
  static inspect(element) {
    const classes = [...element.classList];
    const applicableLayers = StyleTap._detectLayers(classes);

    const report = {
      tag: element.tagName.toLowerCase(),
      classes,
      layers: {},
      tokens: {},
      computed: {},
      source: element.state ? 'state' : 'live',
    };

    // Fast path: read from CssState (element-local Payload)
    if (element.state) {
      report.tokens = { ...element.state.tokens };
      report.computed = { ...element.state.computed };
    } else {
      // Fallback: live getComputedStyle for non-CupElement elements
      const cs = getComputedStyle(element);
      for (const prop of VISUAL_PROPERTIES) {
        const val = cs.getPropertyValue(prop).trim();
        if (val && val !== 'none' && val !== 'normal' && val !== 'auto' && val !== '0px') {
          report.computed[prop] = val;
        }
      }
      for (const token of TOKEN_PROPERTIES) {
        const val = cs.getPropertyValue(token).trim();
        if (val) report.tokens[token] = val;
      }
    }

    // Attribute layer contributions based on class → layer mapping
    for (const layer of applicableLayers) {
      const layerDef = LAYER_MAP[layer];
      if (!layerDef) continue;

      report.layers[layer] = {};
      for (const prop of layerDef.properties) {
        if (report.computed[prop]) {
          report.layers[layer][prop] = report.computed[prop];
        }
      }
    }

    return report;
  }

  /**
   * Determine which @layers apply to an element based on its CSS classes.
   * @param {string[]} classes
   * @returns {string[]}
   */
  static _detectLayers(classes) {
    const layers = new Set(['cup-reset']); // reset always applies

    for (const cls of classes) {
      if (!cls.startsWith('cup-')) continue;

      // Nano atoms: label, input, hint, error, icon, skeleton, divider
      if (/^cup-(label|input|hint|error|icon|skeleton|divider)/.test(cls)) {
        layers.add('cup-nano');
      }
      // Micro composed: field, button, select, textarea, checkbox, radio, number,
      // password, file, date, toggle, badge, chip
      else if (/^cup-(field|button|select|textarea|checkbox|radio|number|password|file|date|toggle|badge|chip)/.test(cls)) {
        layers.add('cup-micro');
      }
      // Component organisms: card, modal, toast, nav, shell, accordion, tabs, table
      else if (/^cup-(card|modal|toast|nav|shell|accordion|tabs|table)/.test(cls)) {
        layers.add('cup-component');
      }
    }

    // Theme and override always contribute
    layers.add('cup-theme');
    layers.add('cup-override');

    return [...layers];
  }

  /**
   * Show a visual overlay on an element with its style decomposition.
   * Click the element to dismiss.
   * @param {HTMLElement} element
   */
  static overlay(element) {
    const report = StyleTap.inspect(element);
    const existing = element.querySelector('.cup-style-overlay');
    if (existing) { existing.remove(); return; }

    const overlay = document.createElement('div');
    overlay.className = 'cup-style-overlay';
    overlay.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0;
      background: color-mix(in srgb, var(--cup-color-surface) 95%, transparent);
      border: 1px solid var(--cup-color-primary);
      border-radius: var(--cup-radius-sm);
      padding: var(--cup-space-sm);
      font-size: var(--cup-font-size-xs);
      font-family: var(--cup-font-family-mono);
      color: var(--cup-color-on-surface);
      z-index: 9999;
      max-height: 300px;
      overflow-y: auto;
      pointer-events: auto;
    `;

    let html = `<div style="font-weight:var(--cup-font-weight-bold);margin-bottom:var(--cup-space-xs);color:var(--cup-color-primary);">&lt;${report.tag}&gt; .${report.classes.join('.')}</div>`;

    for (const [layer, props] of Object.entries(report.layers)) {
      const entries = Object.entries(props);
      if (entries.length === 0) continue;
      const layerLabel = LAYER_MAP[layer]?.label || layer;
      html += `<div style="color:var(--cup-color-secondary);margin-top:var(--cup-space-xs);">${layerLabel}:</div>`;
      for (const [prop, val] of entries) {
        html += `<div style="padding-left:var(--cup-space-sm);">${prop}: <span style="color:var(--cup-color-primary);">${val}</span></div>`;
      }
    }

    overlay.innerHTML = html;

    // Position relative parent for absolute overlay
    const origPosition = element.style.position;
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    element.appendChild(overlay);

    const dismiss = () => {
      overlay.remove();
      if (origPosition !== undefined) element.style.position = origPosition;
      element.removeEventListener('click', dismiss);
    };
    overlay.addEventListener('click', (e) => { e.stopPropagation(); dismiss(); });
  }

  /**
   * Log a full inspection report to the console for a selector.
   * @param {string} selector
   */
  static log(selector) {
    const el = document.querySelector(selector);
    if (!el) { console.warn(`[StyleTap] no element for: ${selector}`); return; }
    const report = StyleTap.inspect(el);

    console.groupCollapsed(`[StyleTap] ${report.tag}.${report.classes.join('.')}`);

    console.group('Layers');
    for (const [layer, props] of Object.entries(report.layers)) {
      const entries = Object.entries(props);
      if (entries.length === 0) continue;
      console.log(`%c${LAYER_MAP[layer]?.label || layer}`, 'font-weight:bold;color:#bb86fc;');
      console.table(props);
    }
    console.groupEnd();

    console.group('Active Tokens');
    console.table(report.tokens);
    console.groupEnd();

    console.group('Computed (visual)');
    console.table(report.computed);
    console.groupEnd();

    console.groupEnd();
    return report;
  }

  // ── Token → Property semantic hints ──
  static _TOKEN_HINTS = {
    'font-size':        'font-size',
    'font-weight':      'font-weight',
    'line-height':      'line-height',
    'color':            'color',
    'background-color': 'color',
    'border-color':     'color',
    'border-radius':    'radius',
    'padding':          'space',
    'margin':           'space',
    'gap':              'space',
    'width':            'space',
    'height':           'space',
    'min-height':       'space',
    'max-width':        'space',
    'box-shadow':       'shadow',
    'transition':       'transition',
    'outline-offset':   'space',
  };

  /**
   * Pick the token whose name best matches a CSS property semantically.
   * @param {string} prop - CSS property name
   * @param {string[]} tokens - candidate token names
   * @returns {string|null}
   */
  static _bestTokenMatch(prop, tokens) {
    const hint = StyleTap._TOKEN_HINTS[prop];
    if (!hint) return null;
    return tokens.find(t => t.includes(hint)) || null;
  }

  /**
   * Build formula breakdown — maps each computed property back to its
   * originating design tokens. Shows "where the numbers come from".
   * @param {HTMLElement} element
   * @returns {{ tag: string, classes: string[], resolved: Array<{prop: string, value: string, tokens: Array<{name: string, tokenValue: string}>}>, unresolved: Array<{prop: string, value: string}> }}
   */
  static formula(element) {
    const report = StyleTap.inspect(element);
    const resolved = [];
    const unresolved = [];

    // Reverse lookup: normalized token value → token names
    const valMap = new Map();
    for (const [token, val] of Object.entries(report.tokens)) {
      const norm = val.trim().toLowerCase();
      if (!valMap.has(norm)) valMap.set(norm, []);
      valMap.get(norm).push(token);
    }

    for (const [prop, value] of Object.entries(report.computed)) {
      const norm = value.trim().toLowerCase();
      const matched = [];

      // Exact match: full value equals a token value
      if (valMap.has(norm)) {
        const candidates = valMap.get(norm);
        const best = StyleTap._bestTokenMatch(prop, candidates);
        const token = best || candidates[0];
        matched.push({ name: token, tokenValue: report.tokens[token] });
      } else {
        // Compound value: split shorthand parts and match individually
        const parts = norm.split(/\s+/);
        if (parts.length > 1) {
          const seen = new Set();
          for (const part of parts) {
            if (valMap.has(part)) {
              const candidates = valMap.get(part);
              const best = StyleTap._bestTokenMatch(prop, candidates) || candidates[0];
              if (!seen.has(best)) {
                matched.push({ name: best, tokenValue: report.tokens[best] });
                seen.add(best);
              }
            }
          }
        }
      }

      if (matched.length > 0) {
        resolved.push({ prop, value, tokens: matched });
      } else {
        unresolved.push({ prop, value });
      }
    }

    return {
      tag: report.tag,
      classes: report.classes,
      source: report.source,
      resolved,
      unresolved,
    };
  }
}
