// wire_effects.js — Filter: wires effects demo replay + StyleTap inspector toggle.
// Reads: main (DOM element)
// Writes: effectsWired (boolean)

import { StyleTap } from './style_tap.js';

export class WireEffects {
  async call(payload) {
    const main = payload.get('main');
    if (!main) return payload;

    // ── Effects replay buttons ──
    const replayBtn = document.getElementById('effect-replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        const cards = document.querySelectorAll('#effects-demo [data-effect]');
        cards.forEach(card => {
          const effect = card.getAttribute('data-effect');
          card.removeAttribute('data-effect');
          // Force reflow to restart animation
          void card.offsetWidth;
          card.setAttribute('data-effect', effect);
        });
      });
    }

    const pulseBtn = document.getElementById('effect-pulse-btn');
    if (pulseBtn) {
      pulseBtn.addEventListener('click', () => {
        pulseBtn.setAttribute('data-effect', 'pulse');
        setTimeout(() => pulseBtn.removeAttribute('data-effect'), 2000);
      });
    }

    const shakeBtn = document.getElementById('effect-shake-btn');
    if (shakeBtn) {
      shakeBtn.addEventListener('click', () => {
        shakeBtn.setAttribute('data-effect', 'shake');
        shakeBtn.addEventListener('animationend', () => {
          shakeBtn.removeAttribute('data-effect');
        }, { once: true });
      });
    }

    // ── StyleTap Inspector ──
    // Build a tools section with interactive inspect mode
    const section = document.createElement('section');
    section.className = 'pg-section';
    section.id = 'style-inspector';
    section.innerHTML = `
      <h2 class="pg-section-title">Style Inspector</h2>
      <p class="pg-section-tag">StyleTap — Click any cup element to see its cascade decomposition</p>
      <div class="pg-demo">
        <div style="display:flex;gap:var(--cup-space-sm);flex-wrap:wrap;margin-bottom:var(--cup-space-md);">
          <button class="cup-button cup-button--primary cup-button--sm" id="style-inspect-toggle">
            Enable Inspect Mode
          </button>
          <button class="cup-button cup-button--secondary cup-button--sm" id="style-inspect-console">
            Log All to Console
          </button>
          <button class="cup-button cup-button--secondary cup-button--sm" id="style-formula-toggle">
            Formula View
          </button>
        </div>
        <pre id="style-inspect-output" style="min-height:6rem;font-size:var(--cup-font-size-xs);font-family:var(--cup-font-family-mono);white-space:pre-wrap;color:var(--cup-color-on-surface);background:var(--cup-color-surface);padding:var(--cup-space-sm);border-radius:var(--cup-radius-sm);border:1px solid var(--cup-color-border);">Click "Enable Inspect Mode" then click any component to see its cascade breakdown.</pre>
      </div>
    `;
    main.appendChild(section);

    // Inspect mode toggle
    let inspectActive = false;
    let formulaMode = false;
    const toggleBtn = document.getElementById('style-inspect-toggle');
    const formulaBtn = document.getElementById('style-formula-toggle');
    const output = document.getElementById('style-inspect-output');

    const inspectHandler = (e) => {
      const el = e.target.closest('[class*="cup-"]');
      if (!el || el.closest('#style-inspector')) return;
      e.preventDefault();
      e.stopPropagation();

      const lines = [];

      if (formulaMode) {
        // ── Formula view: show token provenance for each property ──
        const f = StyleTap.formula(el);
        lines.push(`<${f.tag}> .${f.classes.join('.')}`);
        lines.push('');

        if (f.resolved.length > 0) {
          lines.push('── Formula ──');
          for (const { prop, value, tokens } of f.resolved) {
            const formula = tokens.map(t => `${t.name}(${t.tokenValue})`).join(' + ');
            lines.push(`  ${prop} = ${formula} → ${value}`);
          }
          lines.push('');
        }

        if (f.unresolved.length > 0) {
          lines.push('── Literal (no token) ──');
          for (const { prop, value } of f.unresolved) {
            lines.push(`  ${prop} = ${value}`);
          }
        }
      } else {
        // ── Normal layer view ──
        const report = StyleTap.inspect(el);
        lines.push(`<${report.tag}> .${report.classes.join('.')}`);
        lines.push('');

        for (const [layer, props] of Object.entries(report.layers)) {
          const entries = Object.entries(props);
          if (entries.length === 0) continue;
          lines.push(`── ${layer} ──`);
          for (const [prop, val] of entries) {
            lines.push(`  ${prop}: ${val}`);
          }
          lines.push('');
        }

        lines.push('── Computed (visual) ──');
        for (const [prop, val] of Object.entries(report.computed)) {
          lines.push(`  ${prop}: ${val}`);
        }
      }

      output.textContent = lines.join('\n');

      // Also log structured report to console
      const tag = el.tagName.toLowerCase();
      const cls = el.classList[0] || '';
      StyleTap.log(`${tag}.${cls}`);
    };

    toggleBtn.addEventListener('click', () => {
      inspectActive = !inspectActive;
      toggleBtn.textContent = inspectActive ? 'Disable Inspect Mode' : 'Enable Inspect Mode';
      toggleBtn.className = inspectActive
        ? 'cup-button cup-button--error cup-button--sm'
        : 'cup-button cup-button--primary cup-button--sm';

      if (inspectActive) {
        document.addEventListener('click', inspectHandler, true);
        document.body.style.cursor = 'crosshair';
      } else {
        document.removeEventListener('click', inspectHandler, true);
        document.body.style.cursor = '';
      }
    });

    // Formula view toggle
    formulaBtn.addEventListener('click', () => {
      formulaMode = !formulaMode;
      formulaBtn.textContent = formulaMode ? 'Layer View' : 'Formula View';
      formulaBtn.className = formulaMode
        ? 'cup-button cup-button--primary cup-button--sm'
        : 'cup-button cup-button--secondary cup-button--sm';
      if (formulaMode) {
        output.textContent = 'Formula mode ON — click any component to see token provenance.';
      } else {
        output.textContent = 'Layer mode ON — click any component to see cascade breakdown.';
      }
    });

    // Log all cup elements to console
    const consoleBtn = document.getElementById('style-inspect-console');
    consoleBtn.addEventListener('click', () => {
      const elements = main.querySelectorAll('[class*="cup-"]');
      console.group(`[StyleTap] Full cascade report (${elements.length} elements)`);
      const summary = {};
      elements.forEach(el => {
        const report = StyleTap.inspect(el);
        const key = `${report.tag}.${report.classes[0] || ''}`;
        if (!summary[key]) {
          summary[key] = { count: 0, layers: new Set() };
        }
        summary[key].count++;
        for (const [layer, props] of Object.entries(report.layers)) {
          if (Object.keys(props).length > 0) summary[key].layers.add(layer);
        }
      });

      const table = {};
      for (const [key, val] of Object.entries(summary)) {
        table[key] = { instances: val.count, layers: [...val.layers].join(', ') };
      }
      console.table(table);
      console.groupEnd();

      output.textContent = `Logged ${elements.length} elements to console.\n\nSummary:\n${Object.entries(table).map(([k, v]) => `  ${k}: ${v.instances} instance(s) → ${v.layers}`).join('\n')}`;
    });

    return payload.insert('effectsWired', true);
  }
}
