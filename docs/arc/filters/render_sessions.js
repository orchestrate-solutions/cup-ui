// render_sessions.js — Filter: renders session history cards.
// Reads: sessions
// Writes: sessionsRendered

function esc(s) {
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

function scoreLabel(score) {
  if (score >= 0.9) return 'excellent';
  if (score >= 0.6) return 'good';
  if (score >= 0.4) return 'fair';
  return 'poor';
}

function sessionCard(session) {
  const score = session.overall_score || 0;
  const label = scoreLabel(score);
  const task = session.task || 'Unnamed session';
  const id = session.session_id || '';
  const shortId = id.substring(0, 8);
  const duration = session.duration_ms
    ? (session.duration_ms / 1000).toFixed(1) + 's'
    : '–';
  const models = (session.models || []).join(', ') || '–';

  return `
    <div class="arc-session-card" data-session-id="${esc(id)}">
      <div class="arc-score-ring arc-score-ring--${label}">
        ${(score * 100).toFixed(0)}
      </div>
      <span class="arc-session-id">${esc(shortId)}</span>
      <p class="arc-session-task">${esc(task)}</p>
      <div class="arc-session-meta">
        <span class="arc-session-meta-item">
          <span class="arc-session-meta-value">${session.successful || 0}</span>/${session.total_experiments || 0} passed
        </span>
        <span class="arc-session-meta-item">
          <span class="arc-session-meta-value">${esc(duration)}</span>
        </span>
        <span class="arc-session-meta-item">
          ${esc(models)}
        </span>
      </div>
    </div>
  `;
}

export class RenderSessions {
  async call(payload) {
    const sessions = payload.get('sessions') || [];
    const grid = document.getElementById('sessions-grid');
    if (!grid) return payload;

    if (sessions.length === 0) {
      grid.innerHTML = '<p class="arc-empty">No research sessions found.</p>';
    } else {
      grid.innerHTML = sessions.map(sessionCard).join('');
    }

    // Populate timeline session selector
    const select = document.getElementById('timeline-session-select');
    if (select) {
      const currentVal = select.value;
      select.innerHTML = '<option value="">Select a session…</option>';
      for (const s of sessions) {
        const id = s.session_id || '';
        const short = id.substring(0, 8);
        const task = s.task || 'Unnamed';
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = `${short} — ${task.substring(0, 50)}`;
        select.appendChild(opt);
      }
      if (currentVal) select.value = currentVal;
    }

    return payload.insert('sessionsRendered', true);
  }
}
