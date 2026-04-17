// wire_mobile_nav.js — Filter: wires hamburger menu for mobile sidebar toggle.
// Reads: (none — uses DOM)
// Writes: mobileNavWired (boolean)

export class WireMobileNav {
  async call(payload) {
    const btn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return payload;

    btn.addEventListener('click', () => {
      const isOpen = sidebar.hasAttribute('data-open');
      if (isOpen) {
        sidebar.removeAttribute('data-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        sidebar.setAttribute('data-open', '');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close sidebar when clicking a nav link (mobile)
    sidebar.querySelectorAll('.pg-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.removeAttribute('data-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close sidebar on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.hasAttribute('data-open')) {
        sidebar.removeAttribute('data-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });

    return payload.insert('mobileNavWired', true);
  }
}
