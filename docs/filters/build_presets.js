// build_presets.js — Filter: builds the theme presets section.
// Reads: main (DOM element)
// Writes: presetsBuilt (boolean)

import { toHex } from './build_token_editor.js';

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

const PRESETS = [
  {
    name: 'Default Dark',
    colors: { '--cup-color-surface':'#1a1a2e','--cup-color-on-surface':'#e0e0e0','--cup-color-surface-alt':'#16213e','--cup-color-primary':'#4fc3f7','--cup-color-on-primary':'#000000','--cup-color-secondary':'#b0bec5','--cup-color-error':'#ef5350','--cup-color-success':'#66bb6a','--cup-color-warning':'#ffa726','--cup-color-info':'#29b6f6','--cup-color-border':'#333333','--cup-color-focus':'#4fc3f7' },
  },
  {
    name: 'Default Light',
    colors: { '--cup-color-surface':'#ffffff','--cup-color-on-surface':'#1a1a1a','--cup-color-surface-alt':'#f5f5f5','--cup-color-primary':'#0277bd','--cup-color-on-primary':'#ffffff','--cup-color-secondary':'#546e7a','--cup-color-error':'#c62828','--cup-color-success':'#2e7d32','--cup-color-warning':'#e65100','--cup-color-info':'#01579b','--cup-color-border':'#cccccc','--cup-color-focus':'#0277bd' },
  },
  {
    name: 'Midnight Purple',
    colors: { '--cup-color-surface':'#0d0221','--cup-color-on-surface':'#e8d5f5','--cup-color-surface-alt':'#1a0533','--cup-color-primary':'#b388ff','--cup-color-on-primary':'#000000','--cup-color-secondary':'#9575cd','--cup-color-error':'#ff5252','--cup-color-success':'#69f0ae','--cup-color-warning':'#ffd740','--cup-color-info':'#40c4ff','--cup-color-border':'#2a1050','--cup-color-focus':'#b388ff' },
  },
  {
    name: 'Forest',
    colors: { '--cup-color-surface':'#1b2d1b','--cup-color-on-surface':'#d5e8d5','--cup-color-surface-alt':'#243524','--cup-color-primary':'#81c784','--cup-color-on-primary':'#000000','--cup-color-secondary':'#a5d6a7','--cup-color-error':'#ef5350','--cup-color-success':'#66bb6a','--cup-color-warning':'#ffb74d','--cup-color-info':'#4fc3f7','--cup-color-border':'#2e5830','--cup-color-focus':'#81c784' },
  },
  {
    name: 'Warm Sand',
    colors: { '--cup-color-surface':'#faf6f0','--cup-color-on-surface':'#3e3028','--cup-color-surface-alt':'#f0e8dc','--cup-color-primary':'#d4792a','--cup-color-on-primary':'#ffffff','--cup-color-secondary':'#8b7355','--cup-color-error':'#c62828','--cup-color-success':'#558b2f','--cup-color-warning':'#ef6c00','--cup-color-info':'#0277bd','--cup-color-border':'#d4c4a8','--cup-color-focus':'#d4792a' },
  },
  {
    name: 'Ocean',
    colors: { '--cup-color-surface':'#0a1628','--cup-color-on-surface':'#c8dce8','--cup-color-surface-alt':'#0f2035','--cup-color-primary':'#00bcd4','--cup-color-on-primary':'#000000','--cup-color-secondary':'#80cbc4','--cup-color-error':'#ff5252','--cup-color-success':'#69f0ae','--cup-color-warning':'#ffd740','--cup-color-info':'#40c4ff','--cup-color-border':'#1a3550','--cup-color-focus':'#00bcd4' },
  },
];

export class BuildPresets {
  async call(payload) {
    const main = payload.get('main');
    const root = document.documentElement;

    // Build cards HTML
    let cards = '';
    for (const p of PRESETS) {
      const c = p.colors;
      cards += `
        <div class="pg-preset-card" data-preset="${esc(p.name)}">
          <div class="pg-preset-swatch">
            <span style="background:${c['--cup-color-surface']}"></span>
            <span style="background:${c['--cup-color-primary']}"></span>
            <span style="background:${c['--cup-color-on-surface']}"></span>
            <span style="background:${c['--cup-color-error']}"></span>
          </div>
          <div class="pg-preset-name">${esc(p.name)}</div>
        </div>`;
    }

    const section = document.createElement('section');
    section.className = 'pg-section';
    section.id = 'presets';
    section.innerHTML = `
      <h2 class="pg-section-title">Theme Presets</h2>
      <p class="pg-section-tag">Click a preset to apply it. All components update instantly.</p>
      <div class="pg-demo">
        <div class="pg-preset-grid">${cards}</div>
      </div>
    `;
    main.appendChild(section);

    // Wire clicks
    const grid = section.querySelector('.pg-preset-grid');
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.pg-preset-card');
      if (!card) return;

      const preset = PRESETS.find(p => p.name === card.dataset.preset);
      if (!preset) return;

      for (const [prop, val] of Object.entries(preset.colors)) {
        root.style.setProperty(prop, val);
      }

      grid.querySelectorAll('.pg-preset-card').forEach(c => c.setAttribute('aria-selected', 'false'));
      card.setAttribute('aria-selected', 'true');

      // Sync token editor inputs
      const tokenGrid = document.getElementById('token-grid');
      if (tokenGrid) {
        tokenGrid.querySelectorAll('[data-prop]').forEach(input => {
          const prop = input.dataset.prop;
          if (preset.colors[prop]) {
            input.value = input.type === 'color' ? toHex(preset.colors[prop]) : preset.colors[prop];
          }
        });
      }
    });

    return payload.insert('presetsBuilt', true);
  }
}
