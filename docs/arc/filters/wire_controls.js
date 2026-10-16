// wire_controls.js — Filter: wires interactive controls (nav, forms, clicks).
// Reads: (DOM)
// Writes: controlsWired

export class WireControls {
  async call(payload) {

    // ── Panel navigation ──
    const navLinks = document.querySelectorAll('.arc-nav-link');
    const panels = document.querySelectorAll('.arc-panel');

    function showPanel(panelId) {
      panels.forEach(p => p.classList.remove('arc-panel--active'));
      navLinks.forEach(l => l.classList.remove('arc-nav-link--active'));

      const target = document.getElementById(`panel-${panelId}`);
      if (target) target.classList.add('arc-panel--active');

      const link = document.querySelector(`[data-panel="${panelId}"]`);
      if (link) link.classList.add('arc-nav-link--active');
    }

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const panel = link.dataset.panel;
        if (panel) showPanel(panel);
      });
    });

    // ── Session card clicks → detail view ──
    document.getElementById('sessions-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.arc-session-card');
      if (!card) return;
      const sessionId = card.dataset.sessionId;
      if (sessionId) {
        window.arcDashboard?.loadDetail(sessionId);
      }
    });

    // ── Detail back button ──
    document.getElementById('detail-back')?.addEventListener('click', () => {
      showPanel('sessions');
      // Hide detail panel
      document.getElementById('panel-detail').style.display = 'none';
    });

    // ── Refresh buttons ──
    document.getElementById('refresh-queue')?.addEventListener('click', () => {
      window.arcDashboard?.refresh();
    });
    document.getElementById('refresh-sessions')?.addEventListener('click', () => {
      window.arcDashboard?.refresh();
    });
    document.getElementById('refresh-active')?.addEventListener('click', () => {
      window.arcDashboard?.refreshActive();
    });

    // ── Timeline session selector ──
    document.getElementById('timeline-session-select')?.addEventListener('change', (e) => {
      const id = e.target.value;
      if (id) window.arcDashboard?.loadTimeline(id);
    });

    // ── Create task form ──
    document.getElementById('create-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('create-status');

      const title = document.getElementById('task-title')?.value?.trim();
      const scale = document.getElementById('task-scale')?.value || 'small';
      const concepts = document.getElementById('task-concepts')?.value?.trim();
      const timeout = document.getElementById('task-timeout')?.value || '120';

      if (!title) {
        status.textContent = 'Title is required';
        status.className = 'arc-form-status arc-form-status--error';
        return;
      }

      let body = `scale: ${scale}\ntimeout: ${timeout}`;
      if (concepts) body += `\nconcepts: ${concepts}`;

      status.textContent = 'Creating…';
      status.className = 'arc-form-status';

      try {
        const resp = await fetch('/api/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body }),
        });
        const data = await resp.json();
        if (data.number) {
          status.textContent = `Created #${data.number}`;
          status.className = 'arc-form-status arc-form-status--ok';
          document.getElementById('task-title').value = '';
          document.getElementById('task-concepts').value = '';
          // Refresh queue after a beat
          setTimeout(() => window.arcDashboard?.refresh(), 1000);
        } else {
          status.textContent = data.error || 'Failed';
          status.className = 'arc-form-status arc-form-status--error';
        }
      } catch (err) {
        status.textContent = String(err);
        status.className = 'arc-form-status arc-form-status--error';
      }
    });

    // ── Theme toggle ──
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('cup-toggle', () => {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
      });
    }

    // ── Mobile nav ──
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !expanded);
        sidebar.classList.toggle('cup-shell___sidebar--open');
      });
    }

    // Expose panel switching
    window.arcDashboard = window.arcDashboard || {};
    window.arcDashboard.showPanel = showPanel;

    return payload.insert('controlsWired', true);
  }
}
