// inject_seo.js — Filter: injects per-component JSON-LD and wires dynamic title.
// Reads: sections (array)
// Writes: seoInjected (boolean)

const BASE_URL = 'https://orchestrate-solutions.github.io/cup/docs/';
const BASE_TITLE = 'cup/core — Component Playground & Design System';

export class InjectSeo {
  async call(payload) {
    const sections = payload.get('sections');

    // ── Per-component JSON-LD (ItemList of components) ──
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'cup/core Web Components',
      'numberOfItems': sections.length,
      'itemListElement': sections.map((s, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'name': s.title,
        'description': s.desc || '',
        'url': `${BASE_URL}#${s.id}`,
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(itemList);
    document.head.appendChild(script);

    // ── Dynamic title on hash navigation ──
    const updateTitle = () => {
      const hash = location.hash.replace('#', '');
      if (!hash) {
        document.title = BASE_TITLE;
        return;
      }
      const section = sections.find(s => s.id === hash);
      if (section) {
        document.title = `${section.title} — cup/core`;
      }
    };

    window.addEventListener('hashchange', updateTitle);
    // Also set on initial load if hash is present
    updateTitle();

    // Update title when nav links are clicked
    document.querySelectorAll('.pg-nav-link[data-section]').forEach(link => {
      link.addEventListener('click', () => {
        requestAnimationFrame(updateTitle);
      });
    });

    return payload.insert('seoInjected', true);
  }
}
