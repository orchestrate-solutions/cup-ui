// build_token_editor.js — Filter: builds the real-time token editor section.
// Reads: main (DOM element)
// Writes: tokenEditorBuilt (boolean)

function toHex(color) {
  if (color.startsWith('#')) {
    if (color.length === 4) {
      return '#' + color[1]+color[1] + color[2]+color[2] + color[3]+color[3];
    }
    return color;
  }
  const m = color.match(/\d+/g);
  if (m && m.length >= 3) {
    return '#' + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
  }
  return '#000000';
}

const TOKENS = [
  { prop: '--cup-color-surface',     label: 'Surface',      type: 'color' },
  { prop: '--cup-color-on-surface',  label: 'On Surface',   type: 'color' },
  { prop: '--cup-color-surface-alt', label: 'Surface Alt',  type: 'color' },
  { prop: '--cup-color-primary',     label: 'Primary',      type: 'color' },
  { prop: '--cup-color-on-primary',  label: 'On Primary',   type: 'color' },
  { prop: '--cup-color-secondary',   label: 'Secondary',    type: 'color' },
  { prop: '--cup-color-error',       label: 'Error',        type: 'color' },
  { prop: '--cup-color-success',     label: 'Success',      type: 'color' },
  { prop: '--cup-color-warning',     label: 'Warning',      type: 'color' },
  { prop: '--cup-color-info',        label: 'Info',         type: 'color' },
  { prop: '--cup-color-border',      label: 'Border',       type: 'color' },
  { prop: '--cup-color-focus',       label: 'Focus',        type: 'color' },
  { prop: '--cup-radius-sm',         label: 'Radius SM',    type: 'text' },
  { prop: '--cup-radius-md',         label: 'Radius MD',    type: 'text' },
  { prop: '--cup-font-size-base',    label: 'Font Size',    type: 'text' },
];

export { TOKENS, toHex };

export class BuildTokenEditor {
  async call(payload) {
    const main = payload.get('main');
    const root = document.documentElement;

    // Build section
    const section = document.createElement('section');
    section.className = 'pg-section';
    section.id = 'tokens';
    section.innerHTML = `
      <h2 class="pg-section-title">Token Editor</h2>
      <p class="pg-section-tag">Adjust design tokens in real time. Changes apply instantly.</p>
      <div class="pg-demo">
        <div class="pg-token-grid" id="token-grid"></div>
        <div style="margin-top:var(--cup-space-md);">
          <button class="cup-button cup-button--secondary" id="token-reset">Reset to Default</button>
          <button class="cup-button cup-button--ghost" id="token-export">Export CSS</button>
        </div>
      </div>
    `;
    main.appendChild(section);

    // Populate grid
    const grid = document.getElementById('token-grid');
    for (const t of TOKENS) {
      const row = document.createElement('div');
      row.className = 'pg-token-row';
      const currentVal = getComputedStyle(root).getPropertyValue(t.prop).trim();

      if (t.type === 'color') {
        row.innerHTML = `
          <input type="color" class="pg-token-input" data-prop="${t.prop}" value="${toHex(currentVal)}">
          <span class="pg-token-name" title="${t.prop}">${t.label}</span>
        `;
      } else {
        row.innerHTML = `
          <input type="text" class="cup-input" style="width:6rem;padding:var(--cup-space-xs) var(--cup-space-sm);font-size:var(--cup-font-size-xs);" data-prop="${t.prop}" value="${currentVal}">
          <span class="pg-token-name" title="${t.prop}">${t.label}</span>
        `;
      }
      grid.appendChild(row);
    }

    // Live editing
    grid.addEventListener('input', (e) => {
      const input = e.target;
      if (input.dataset.prop) root.style.setProperty(input.dataset.prop, input.value);
    });

    // Reset
    document.getElementById('token-reset').addEventListener('click', () => {
      for (const t of TOKENS) root.style.removeProperty(t.prop);
      grid.querySelectorAll('[data-prop]').forEach(input => {
        const val = getComputedStyle(root).getPropertyValue(input.dataset.prop).trim();
        input.value = input.type === 'color' ? toHex(val) : val;
      });
    });

    // Export
    document.getElementById('token-export').addEventListener('click', () => {
      let css = ':root {\n';
      for (const t of TOKENS) {
        css += `  ${t.prop}: ${getComputedStyle(root).getPropertyValue(t.prop).trim()};\n`;
      }
      css += '}';
      navigator.clipboard.writeText(css).then(() => {
        const btn = document.getElementById('token-export');
        btn.textContent = 'Copied CSS!';
        setTimeout(() => { btn.textContent = 'Export CSS'; }, 1500);
      });
    });

    return payload.insert('tokenEditorBuilt', true);
  }
}
