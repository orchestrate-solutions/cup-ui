// render_sections.js — Filter: renders component demo sections into the DOM.
// Reads: sections (array), main (DOM element)
// Writes: rendered (boolean)

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function attr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export class RenderSections {
  async call(payload) {
    const sections = payload.get('sections');
    const main = payload.get('main');

    main.innerHTML = '';
    for (const s of sections) {
      const el = document.createElement('section');
      el.className = 'pg-section';
      el.id = s.id;
      el.innerHTML = `
        <h2 class="pg-section-title">${esc(s.title)}</h2>
        <p class="pg-section-tag">${esc(s.tag)}</p>
        ${s.desc ? `<p class="pg-section-desc">${esc(s.desc)}</p>` : ''}
        <div class="pg-demo">${s.demo}</div>
        <div class="pg-code">
          <button class="pg-code-copy">Copy</button>
          <pre>${esc(s.code)}</pre>
        </div>
      `;
      main.appendChild(el);
    }

    return payload.insert('rendered', true);
  }
}
