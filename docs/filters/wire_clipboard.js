// wire_clipboard.js — Filter: wires copy buttons + chip removal.
// Reads: main (DOM element)
// Writes: clipboardWired (boolean)

export class WireClipboard {
  async call(payload) {
    const main = payload.get('main');

    // Copy code snippets
    main.addEventListener('click', (e) => {
      const btn = e.target.closest('.pg-code-copy');
      if (!btn) return;
      const code = btn.closest('.pg-code').querySelector('pre').textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      });
    });

    // Chip removal
    main.addEventListener('remove', (e) => {
      if (e.target.tagName === 'CUP-CHIP') e.target.remove();
    });

    return payload.insert('clipboardWired', true);
  }
}
