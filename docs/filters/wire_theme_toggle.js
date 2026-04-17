// wire_theme_toggle.js — Filter: wires the theme toggle to data-theme.
// Reads: (none — uses DOM)
// Writes: themeWired (boolean)

export class WireThemeToggle {
  async call(payload) {
    const toggle = document.getElementById('theme-toggle');
    toggle.addEventListener('change', () => {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    });
    return payload.insert('themeWired', true);
  }
}
