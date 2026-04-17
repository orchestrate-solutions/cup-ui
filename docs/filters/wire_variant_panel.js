// wire_variant_panel.js — Filter: adds variant + animation controls to each demo section.
// Reads: main (DOM element)
// Writes: variantPanelWired (boolean)
//
// Injects a control bar into every .pg-demo that lets users:
//   1. Switch component variants (where applicable)
//   2. Apply any data-effect animation to the demo
//   3. Toggle global motion on/off (simulates prefers-reduced-motion)

// ── Variant definitions ───────────────────────────────────────────
// Maps section id → array of { attr, values } describing the variant
// axes for that component. `attr` is the HTML attribute to swap,
// `values` is the list of allowed values.
const VARIANT_MAP = {
  button: [
    { attr: 'variant', values: ['primary', 'secondary', 'ghost', 'danger'] },
    { attr: 'size',    values: ['sm', '', 'lg'], labels: ['Small', 'Default', 'Large'] },
    { attr: 'rounded', values: ['', 'rounded'], labels: ['Square', 'Rounded'], toggle: true },
  ],
  badge: [
    { attr: 'variant', values: ['default', 'success', 'error', 'warning', 'info'] },
  ],
  skeleton: [
    { attr: 'variant', values: ['text', 'circle', 'rect'] },
  ],
};

// ── Animation catalogue (all @keyframes from nano.css + motion.css) ──
const ANIMATIONS = [
  { value: '',          label: 'None' },
  { value: 'fade-in',   label: 'Fade In' },
  { value: 'slide-up',  label: 'Slide Up' },
  { value: 'scale-in',  label: 'Scale In' },
  { value: 'pulse',     label: 'Pulse' },
  { value: 'shake',     label: 'Shake' },
  { value: 'ripple',    label: 'Ripple' },
  { value: 'trace',     label: 'Trace' },
  { value: 'enchant',   label: 'Enchant' },
];

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ── Build a chip bar for one variant axis ─────────────────────────
function buildVariantChips(sectionId, axis) {
  const chips = axis.values.map((v, i) => {
    const label = axis.labels ? axis.labels[i] : (v || 'default');
    return `<button class="pg-ctrl-chip" data-pg-axis="${axis.attr}" data-pg-val="${v}">${esc(label)}</button>`;
  });
  return `<span class="pg-ctrl-group">
    <span class="pg-ctrl-label">${esc(axis.attr)}</span>${chips.join('')}
  </span>`;
}

// ── Build the animation toggle buttons ────────────────────────────
function buildAnimationToggles() {
  const btns = ANIMATIONS.filter(a => a.value).map(a =>
    `<button class="pg-ctrl-chip pg-anim-btn" data-pg-effect="${a.value}">${esc(a.label)}</button>`
  ).join('');
  return `<span class="pg-ctrl-group">
    <span class="pg-ctrl-label">effect</span>${btns}
    <button class="pg-ctrl-chip pg-loop-btn" title="Loop animation">⟳ Loop</button>
  </span>`;
}

export class WireVariantPanel {
  async call(payload) {
    const main = payload.get('main');
    if (!main) return payload;

    // ── Global motion toggle in the header ──
    const header = document.querySelector('.cup-shell___header');
    if (header && !document.getElementById('motion-toggle')) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;align-items:center;gap:var(--cup-space-xs);';
      wrapper.innerHTML = `<cup-toggle label="Motion" id="motion-toggle" pressed></cup-toggle>`;
      // Insert before the theme toggle
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.closest('div').prepend(wrapper);
      }

      // Defer wiring until the custom element renders
      requestAnimationFrame(() => {
        const motionEl = document.getElementById('motion-toggle');
        if (motionEl) {
          motionEl.addEventListener('cup-toggle', (e) => {
            const motionOff = !e.detail.pressed;
            document.documentElement.classList.toggle('pg-motion-off', motionOff);
          });
        }
      });
    }

    // ── Per-section control bars ──
    const sections = main.querySelectorAll('.pg-section');
    sections.forEach(section => {
      const id = section.id;
      const demo = section.querySelector('.pg-demo');
      if (!demo) return;

      // Skip tool sections (tokens, presets, wasm, style-inspector, metrics)
      if (['tokens', 'presets', 'wasm', 'style-inspector', 'metrics'].includes(id)) return;

      const hasVariants = VARIANT_MAP[id];
      const bar = document.createElement('div');
      bar.className = 'pg-ctrl-bar';

      let html = '';

      // Variant chips
      if (hasVariants) {
        html += hasVariants.map(axis => buildVariantChips(id, axis)).join('');
      }

      // Animation toggle buttons (every demo gets them)
      html += buildAnimationToggles();

      bar.innerHTML = html;
      demo.prepend(bar);

      // ── Wire variant chips ──
      if (hasVariants) {
        bar.querySelectorAll('.pg-ctrl-chip:not(.pg-anim-btn):not(.pg-loop-btn)').forEach(chip => {
          chip.addEventListener('click', () => {
            const axis = chip.dataset.pgAxis;
            const val = chip.dataset.pgVal;

            // Highlight active chip in its group
            chip.closest('.pg-ctrl-group').querySelectorAll('.pg-ctrl-chip').forEach(c => {
              c.classList.toggle('pg-ctrl-chip--active', c === chip);
            });

            // Apply variant to all matching components in this section's demo
            const tag = `cup-${id}`;
            demo.querySelectorAll(tag).forEach(el => {
              if (val) el.setAttribute(axis, val);
              else el.removeAttribute(axis);
            });
          });
        });

        // Set initial active state
        bar.querySelectorAll('.pg-ctrl-group').forEach(group => {
          const first = group.querySelector('.pg-ctrl-chip');
          if (first) first.classList.add('pg-ctrl-chip--active');
        });
      }

      // ── Wire animation toggle buttons ──
      let activeEffect = '';
      let looping = false;
      let loopTimer = null;
      const animBtns = bar.querySelectorAll('.pg-anim-btn');
      const loopBtn = bar.querySelector('.pg-loop-btn');

      const getTargets = () => {
        // Only target top-level demo elements — never their children.
        // Prefer custom elements (cup-*), standalone cards, and direct
        // non-structural children. Skip containers (.pg-demo-row, etc.)
        // and control bar elements.
        const skip = new Set(['pg-ctrl-bar', 'pg-variant-label', 'pg-demo-row', 'pg-demo-grid']);
        const results = [];
        for (const row of demo.querySelectorAll('.pg-demo-row, .pg-demo-grid')) {
          for (const child of row.children) {
            results.push(child);
          }
        }
        // Also grab direct demo children that aren't rows/grids/bars
        for (const child of demo.children) {
          if (child.classList && [...child.classList].some(c => skip.has(c))) continue;
          if (!results.includes(child)) results.push(child);
        }
        return results;
      };

      const applyEffect = (effect) => {
        const targets = getTargets();
        // First clear all data-effect in the entire demo (including children)
        demo.querySelectorAll('[data-effect]').forEach(el => {
          // Don't strip effects from the static effects-demo section cards
          if (demo.closest('#effects') && el.closest('#effects-demo')) return;
          el.removeAttribute('data-effect');
        });
        // Then apply only to top-level targets
        targets.forEach(el => {
          if (effect) {
            void el.offsetWidth;
            el.setAttribute('data-effect', effect);
          }
        });
      };

      const stopLoop = () => {
        looping = false;
        if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
        loopBtn.classList.remove('pg-ctrl-chip--active');
      };

      const runLoop = () => {
        if (!looping || !activeEffect) { stopLoop(); return; }
        applyEffect('');
        setTimeout(() => {
          if (!looping) return;
          applyEffect(activeEffect);
          loopTimer = setTimeout(runLoop, 1500);
        }, 300);
      };

      animBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const effect = btn.dataset.pgEffect;
          const wasActive = btn.classList.contains('pg-ctrl-chip--active');

          // Deactivate all anim buttons
          animBtns.forEach(b => b.classList.remove('pg-ctrl-chip--active'));

          if (wasActive) {
            // Toggle off
            activeEffect = '';
            applyEffect('');
            stopLoop();
          } else {
            // Toggle on
            activeEffect = effect;
            btn.classList.add('pg-ctrl-chip--active');
            applyEffect(effect);
            if (looping) { runLoop(); }
          }
        });
      });

      loopBtn.addEventListener('click', () => {
        if (looping) {
          stopLoop();
        } else if (activeEffect) {
          looping = true;
          loopBtn.classList.add('pg-ctrl-chip--active');
          runLoop();
        }
      });
    });

    return payload.insert('variantPanelWired', true);
  }
}
