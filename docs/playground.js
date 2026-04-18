// playground.js — Pipeline orchestrator for the cup/core component playground.
// Assembles Filters, builds a Pipeline, runs it with a Payload.
// Uses cup-pipe.js (JS runtime) for pipeline orchestration.
// Loads the WASM runtime alongside for benchmarking and demonstration.

import { Payload, Pipeline } from './cup-pipe.js';
import { initCupWasm, getBackend, Payload as WasmPayload, Pipeline as WasmPipeline } from './cup-pipe-wasm.js';
import { sections } from './filters/sections.js';
import { RenderSections } from './filters/render_sections.js';
import { WireThemeToggle } from './filters/wire_theme_toggle.js';
import { WireNavHighlight } from './filters/wire_nav_highlight.js';
import { WireClipboard } from './filters/wire_clipboard.js';
import { BuildTokenEditor } from './filters/build_token_editor.js';
import { BuildPresets } from './filters/build_presets.js';
import { StyleMetrics } from './filters/style_metrics.js';
import { WireMobileNav } from './filters/wire_mobile_nav.js';
import { StyleTap } from './filters/style_tap.js';
import { WireEffects } from './filters/wire_effects.js';
import { WireVariantPanel } from './filters/wire_variant_panel.js';
import { InjectSeo } from './filters/inject_seo.js';

// ── Tap: logs pipeline progress to console ────────────────────────
class ConsoleTap {
  observe(payload) {
    const dict = payload.toDict();
    const keys = Object.keys(dict).filter(k => k !== 'sections' && k !== 'main');
    console.log('[cup-pipe]', keys.join(', '));
  }
}

// ── WASM Benchmark Filter ─────────────────────────────────────────
class BuildWasmBenchmark {
  async call(payload) {
    const main = payload.get('main');
    const backend = getBackend();

    const section = document.createElement('section');
    section.className = 'pg-section';
    section.id = 'wasm';
    section.innerHTML = `
      <h2 class="pg-section-title">WASM Runtime</h2>
      <p class="pg-section-tag">
        Backend: <strong id="wasm-backend">${backend}</strong>
        &nbsp;•&nbsp;Binary: 59KB gzipped
      </p>
      <div class="pg-demo">
        <p id="wasm-status" style="margin-bottom:var(--cup-space-sm);">
          ${backend === 'wasm' ? '✓ Rust WASM runtime active' : '⚠ Rust WASM unavailable — using JS fallback'}
        </p>
        <div style="display:flex;gap:var(--cup-space-sm);flex-wrap:wrap;margin-bottom:var(--cup-space-md);">
          <button class="cup-button cup-button--primary" id="wasm-bench-btn">
            Run Benchmark
          </button>
          <button class="cup-button cup-button--secondary" id="wasm-bench-clear">
            Clear
          </button>
        </div>
        <pre id="wasm-bench-output" style="min-height:6rem;font-size:var(--cup-font-size-xs);white-space:pre-wrap;">Click "Run Benchmark" to compare JS vs WASM pipeline performance.</pre>
      </div>
    `;
    main.appendChild(section);

    // Wire benchmark button
    document.getElementById('wasm-bench-btn').addEventListener('click', () => {
      runBenchmark();
    });
    document.getElementById('wasm-bench-clear').addEventListener('click', () => {
      document.getElementById('wasm-bench-output').textContent =
        'Click "Run Benchmark" to compare JS vs WASM pipeline performance.';
    });

    return payload.insert('wasmBenchmarkBuilt', true);
  }
}

// ── Benchmark logic ───────────────────────────────────────────────
function runBenchmark() {
  const output = document.getElementById('wasm-bench-output');
  const iterations = 10000;
  const lines = [];

  lines.push(`Benchmark: ${iterations.toLocaleString()} pipeline iterations\n`);

  // JS Pipeline benchmark
  const jsStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    const p = new Payload({ counter: i, label: 'test', active: true });
    const p2 = p.insert('doubled', i * 2);
    const p3 = p2.insert('result', `item-${i}`);
    p3.toDict();
  }
  const jsTime = performance.now() - jsStart;
  lines.push(`  JS  Payload (create → insert → insert → toDict): ${jsTime.toFixed(2)}ms`);

  // WASM Pipeline benchmark (if available)
  if (getBackend() === 'wasm' && WasmPayload) {
    const wasmStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const p = new WasmPayload({ counter: i, label: 'test', active: true });
      const p2 = p.insert('doubled', i * 2);
      const p3 = p2.insert('result', `item-${i}`);
      p3.toDict();
      // Free WASM memory
      p.free();
      p2.free();
      p3.free();
    }
    const wasmTime = performance.now() - wasmStart;
    lines.push(`  WASM Payload (create → insert → insert → toDict): ${wasmTime.toFixed(2)}ms`);

    const ratio = jsTime / wasmTime;
    lines.push(`\n  ${ratio > 1 ? 'WASM' : 'JS'} is ${Math.abs(ratio > 1 ? ratio : 1/ratio).toFixed(1)}x faster`);

    // Pipeline comparison
    lines.push(`\n--- Pipeline orchestration ---`);

    const pipeIters = 1000;
    lines.push(`${pipeIters.toLocaleString()} pipeline runs (3 filters each)\n`);

    // JS Pipeline
    const jsPipeStart = performance.now();
    for (let i = 0; i < pipeIters; i++) {
      const pipeline = new Pipeline();
      pipeline.addFilter({ async call(p) { return p.insert('a', 1); } }, 'A');
      pipeline.addFilter({ async call(p) { return p.insert('b', 2); } }, 'B');
      pipeline.addFilter({ async call(p) { return p.insert('c', 3); } }, 'C');
      // JS pipeline is async — we skip await for fair comparison of setup cost
    }
    const jsPipeTime = performance.now() - jsPipeStart;
    lines.push(`  JS  Pipeline (build 3 filters): ${jsPipeTime.toFixed(2)}ms`);

    // WASM Pipeline
    const wasmPipeStart = performance.now();
    for (let i = 0; i < pipeIters; i++) {
      const pipeline = new WasmPipeline();
      pipeline.addFilter('A', (p) => p.insert('a', 1));
      pipeline.addFilter('B', (p) => p.insert('b', 2));
      pipeline.addFilter('C', (p) => p.insert('c', 3));
      const result = pipeline.run(new WasmPayload({ i }));
      result.free();
      pipeline.free();
    }
    const wasmPipeTime = performance.now() - wasmPipeStart;
    lines.push(`  WASM Pipeline (build + run 3 filters): ${wasmPipeTime.toFixed(2)}ms`);

  } else {
    lines.push(`  WASM not available — JS-only benchmark.`);
  }

  output.textContent = lines.join('\n');
}

// ── Footer Filter ───────────────────────────────────────────────
class BuildFooter {
  async call(payload) {
    const el = document.getElementById('build-commit');
    if (!el) return payload;
    try {
      const res = await fetch('./version.json');
      if (!res.ok) throw new Error('not found');
      const { commit, date } = await res.json();
      const sha = commit === 'dev' ? 'dev' : commit;
      const dateStr = date ? ` · ${date}` : '';
      const href = sha !== 'dev'
        ? `https://github.com/orchestrate-solutions/cup-ui/commit/${sha}`
        : null;
      el.innerHTML = href
        ? `cup/core · <a href="${href}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;">${sha}</a>${dateStr}`
        : `cup/core · ${sha}${dateStr}`;
    } catch {
      el.textContent = 'cup/core';
    }
    return payload.insert('footerBuilt', true);
  }
}

// ── Build Pipeline ────────────────────────────────────────────────
async function main() {
  // Initialize WASM runtime (non-blocking, falls back to JS)
  await initCupWasm();

  const pipeline = new Pipeline()
    .addFilter(new RenderSections(),    'RenderSections')
    .addFilter(new WireThemeToggle(),   'WireThemeToggle')
    .addFilter(new WireMobileNav(),     'WireMobileNav')
    .addFilter(new WireClipboard(),     'WireClipboard')
    .addFilter(new BuildTokenEditor(),  'BuildTokenEditor')
    .addFilter(new BuildPresets(),      'BuildPresets')
    .addFilter(new BuildWasmBenchmark(),'BuildWasmBenchmark')
    .addFilter(new StyleMetrics(),      'StyleMetrics')
    .addFilter(new WireVariantPanel(), 'WireVariantPanel')
    .addFilter(new WireEffects(),       'WireEffects')
    .addFilter(new WireNavHighlight(),  'WireNavHighlight')
    .addFilter(new InjectSeo(),         'InjectSeo')
    .addFilter(new BuildFooter(),       'BuildFooter')
    .addTap(new ConsoleTap(),           'ConsoleTap')
    .addTap(new StyleTap(),             'StyleTap');

  pipeline.observe({ timing: true });

  const initialPayload = new Payload({
    sections,
    main: document.getElementById('main'),
  });

  const result = await pipeline.run(initialPayload);
  console.log(`[cup-pipe] playground pipeline complete (${getBackend()} backend)`, pipeline.state);

  // Expose StyleTap globally for console debugging:
  //   StyleTap.log('.cup-button');
  //   StyleTap.inspect(document.querySelector('.cup-card'));
  //   StyleTap.overlay(document.querySelector('.cup-field'));
  globalThis.StyleTap = StyleTap;
}

main();
