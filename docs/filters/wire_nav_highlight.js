// wire_nav_highlight.js — Filter: highlights active sidebar nav link on scroll.
// Reads: main (DOM element)
// Writes: navWired (boolean)

export class WireNavHighlight {
  async call(payload) {
    const main = payload.get('main');
    const navLinks = document.querySelectorAll('.pg-nav-link');

    function update() {
      const scrollY = main.scrollTop;
      let active = null;
      for (const s of document.querySelectorAll('.pg-section')) {
        if (s.offsetTop - main.offsetTop <= scrollY + 80) {
          active = s.id;
        }
      }
      navLinks.forEach(link => {
        link.setAttribute('aria-current', link.dataset.section === active ? 'true' : 'false');
      });
    }

    main.addEventListener('scroll', update);
    update();

    return payload.insert('navWired', true);
  }
}
