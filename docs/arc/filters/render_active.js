// render_active.js — Filter: renders living organism cards with progress bars.
// Reads: active
// Writes: activeRendered

export class RenderActive {
  async call(payload) {
    const organisms = payload.get('active', []);
    const container = document.getElementById('active-view');
    const badge = document.getElementById('active-count');

    if (!container) return payload.insert('activeRendered', false);

    // Update sidebar badge
    if (badge) {
      if (organisms.length > 0) {
        badge.textContent = organisms.length;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }

    // Empty state
    if (organisms.length === 0) {
      container.innerHTML = `
        <div class="arc-empty arc-empty--watching">
          <span class="arc-pulse-ring"></span>
          Watching for organism activity…
          <button class="cup-button cup-button--sm cup-button--primary" style="margin-left:var(--cup-space-md)"
                  onclick="window.arcDashboard?.showPanel?.('builder')">
            Spawn One →
          </button>
        </div>`;
      return payload.insert('activeRendered', true);
    }

    // Render organism cards
    const cards = organisms.map(o => this._renderOrganism(o)).join('');
    container.innerHTML = `<div class="arc-organisms-grid">${cards}</div>`;

    return payload.insert('activeRendered', true);
  }

  _renderOrganism(org) {
    const sessionShort = (org.session_id || '').substring(0, 8);
    const percent = org.percent || 0;
    const completed = org.completed_experiments || 0;
    const total = org.total_experiments || 1;
    const models = (org.models || []).join(', ') || 'unknown';
    const task = org.task || 'Research session';
    const elapsed = this._elapsed(org.started_at);

    // Current experiment info
    const current = org.current_experiment;
    const currentLabel = current
      ? `${current.type} — ${current.label}`
      : 'Waiting…';
    const currentIdx = current ? current.index : completed;

    // Completed experiment mini-dots
    const dots = (org.completed || []).map((exp, i) => {
      const cls = exp.success ? 'arc-dot--ok' : 'arc-dot--fail';
      const title = `${exp.type}: ${exp.label} — ${exp.score_label || 'n/a'} (${exp.score?.toFixed(3) || '?'})`;
      return `<span class="arc-exp-dot ${cls}" title="${this._esc(title)}"></span>`;
    }).join('');

    // Progress bar color based on completion
    const barClass = percent >= 100 ? 'arc-bar--done'
      : percent >= 50 ? 'arc-bar--mid'
      : 'arc-bar--early';

    return `
      <article class="arc-organism-card">
        <div class="arc-organism-header">
          <div class="arc-organism-pulse"></div>
          <h3 class="arc-organism-title">${this._esc(task) || 'Organism ' + sessionShort}</h3>
          <span class="arc-organism-session">${sessionShort}</span>
        </div>

        <div class="arc-organism-meta">
          <span class="arc-organism-models">${this._esc(models)}</span>
          <span class="arc-organism-elapsed">${elapsed}</span>
        </div>

        <div class="arc-organism-progress">
          <div class="arc-organism-bar-track">
            <div class="arc-organism-bar-fill ${barClass}"
                 style="width: ${percent}%"
                 role="progressbar"
                 aria-valuenow="${percent}"
                 aria-valuemin="0"
                 aria-valuemax="100">
            </div>
          </div>
          <div class="arc-organism-progress-label">
            <span>${completed} / ${total} experiments</span>
            <span>${percent}%</span>
          </div>
        </div>

        <div class="arc-organism-current">
          <span class="arc-organism-current-label">Now:</span>
          <span class="arc-organism-current-value ${current ? 'arc-organism-current--running' : ''}">${this._esc(currentLabel)}</span>
        </div>

        <div class="arc-organism-dots">${dots}</div>
      </article>`;
  }

  _elapsed(startedAt) {
    if (!startedAt) return '';
    const secs = Math.floor(Date.now() / 1000 - startedAt);
    if (secs < 60) return secs + 's';
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    if (mins < 60) return `${mins}m ${remSecs}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  }

  _esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
