// cup-pipe-wasm.js — WASM-backed CUP runtime loader.
//
// Initializes the Rust-compiled WASM module, then re-exports
// Payload, MutablePayload, Pipeline, and State from the WASM binary.
//
// Falls back to the pure-JS runtime (cup-pipe.js) if WASM fails to load.
//
// Usage:
//   import { initCupWasm, Payload, Pipeline } from './cup-pipe-wasm.js';
//   await initCupWasm();            // must call once before using classes
//   const p = new Payload({ x: 1 });

let wasmModule = null;
let backend = 'pending';

// Re-export placeholders — filled after init
let Payload, MutablePayload, Pipeline, State;

/**
 * Initialize the CUP WASM runtime.
 * Call once on page load, before using any CUP classes.
 * Returns 'wasm' or 'js' indicating which backend is active.
 */
async function initCupWasm() {
  if (backend !== 'pending') return backend;

  try {
    // Dynamic import of the wasm-bindgen glue
    const wasm = await import('./wasm/codeupipe_core.js');

    // Initialize WASM module (fetches .wasm, compiles, links)
    await wasm.default();

    // Bind exports
    Payload = wasm.Payload;
    MutablePayload = wasm.MutablePayload;
    Pipeline = wasm.Pipeline;
    State = wasm.State;

    wasmModule = wasm;
    backend = 'wasm';
    console.log('[cup-pipe] WASM runtime loaded (59KB gzipped)');
  } catch (err) {
    console.warn('[cup-pipe] WASM load failed, falling back to JS runtime:', err.message);

    // Fallback to pure-JS runtime
    const js = await import('./cup-pipe.js');
    Payload = js.Payload;
    MutablePayload = js.MutablePayload;
    Pipeline = js.Pipeline;
    State = js.State;

    backend = 'js';
    console.log('[cup-pipe] JS runtime loaded (fallback)');
  }

  return backend;
}

/**
 * Which backend is active: 'wasm', 'js', or 'pending'.
 */
function getBackend() {
  return backend;
}

export { initCupWasm, getBackend, Payload, MutablePayload, Pipeline, State };
