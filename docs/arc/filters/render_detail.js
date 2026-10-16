// render_detail.js — Filter: renders session detail view.
// Reads: sessionDetail
// Writes: detailRendered

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

function scoreColor(score) {
  if (score >= 0.9) return 'var(--cup-color-success, #22c55e)';
  if (score >= 0.6) return 'var(--cup-color-primary)';
  if (score >= 0.4) return 'var(--cup-color-warning, #f59e0b)';
  return 'var(--cup-color-error, #ef4444)';
}

function renderScoreCards(summary) {
  const scores = summary.scores_by_type || {};
  const overall = summary.overall_score || 0;
  const label = scoreLabel(overall);

  let html = '<div class="arc-detail-scores">';

  // Overall score card
  html += `
    <div class="arc-detail-score-card">
      <div class="arc-detail-score-label">Overall</div>
      <div class="arc-detail-score-value" style="color:${scoreColor(overall)}">${(overall * 100).toFixed(1)}%</div>
      <div style="font-size:var(--cup-font-size-xs);color:var(--cup-color-secondary)">${label}</div>
    </div>
  `;

  for (const [type, score] of Object.entries(scores)) {
    html += `
      <div class="arc-detail-score-card">
        <div class="arc-detail-score-label">${esc(type.replace(/_/g, ' '))}</div>
        <div class="arc-detail-score-value" style="color:${scoreColor(score)}">${(score * 100).toFixed(1)}%</div>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

function renderExperimentsTable(experiments) {
  if (!experiments || experiments.length === 0) return '';

  let html = `
    <h3 style="margin: var(--cup-space-lg) 0 var(--cup-space-md) 0;">Experiments</h3>
    <table class="arc-experiments-table">
      <thead>
        <tr>
          <th></th>
          <th>Type</th>
          <th>Model(s)</th>
          <th>Score</th>
          <th>Label</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const exp of experiments) {
    const success = exp.python_success;
    const icon = success ? '✅' : '❌';
    const type = exp.experiment_type || '–';
    const modelA = exp.model_a || '–';
    const modelB = exp.model_b ? ` × ${exp.model_b}` : '';
    const score = exp.score_overall != null ? (exp.score_overall * 100).toFixed(1) + '%' : '–';
    const label = exp.score_label || '–';
    const dur = exp._duration_ms ? (exp._duration_ms / 1000).toFixed(1) + 's' : '–';

    html += `
      <tr>
        <td class="arc-exp-status">${icon}</td>
        <td>${esc(type.replace(/_/g, ' '))}</td>
        <td>${esc(modelA)}${esc(modelB)}</td>
        <td style="color:${success ? scoreColor(exp.score_overall || 0) : 'var(--cup-color-error)'}">${score}</td>
        <td>${esc(label)}</td>
        <td>${dur}</td>
      </tr>
    `;

    // Concept cosines drilldown
    const er = exp.experiment_results || {};
    const cc = er.concept_cosines;
    if (cc && typeof cc === 'object') {
      html += `<tr><td colspan="6"><div class="arc-concept-cosines">`;
      for (const [concept, cosine] of Object.entries(cc)) {
        const pct = Math.max(0, Math.min(100, cosine * 100));
        html += `
          <div class="arc-concept-bar">
            <span class="arc-concept-bar-name">${esc(concept)}</span>
            <div class="arc-concept-bar-fill">
              <div class="arc-concept-bar-fill-inner" style="width:${pct}%;background:${scoreColor(cosine)}"></div>
            </div>
            <span class="arc-concept-bar-value">${cosine.toFixed(3)}</span>
          </div>
        `;
      }
      html += `</div></td></tr>`;
    }
  }

  html += '</tbody></table>';
  return html;
}

function renderLifecycleSummary(lifecycle) {
  if (!lifecycle) return '';
  return `
    <h3 style="margin: var(--cup-space-lg) 0 var(--cup-space-md) 0;">Lifecycle</h3>
    <div class="arc-session-meta">
      <span class="arc-session-meta-item">Events: <span class="arc-session-meta-value">${lifecycle.event_count || 0}</span></span>
      <span class="arc-session-meta-item">Errors: <span class="arc-session-meta-value">${lifecycle.error_count || 0}</span></span>
      <span class="arc-session-meta-item">Duration: <span class="arc-session-meta-value">${((lifecycle.duration_ms || 0) / 1000).toFixed(1)}s</span></span>
    </div>
  `;
}

export class RenderDetail {
  async call(payload) {
    const detail = payload.get('sessionDetail');
    const view = document.getElementById('detail-view');
    const title = document.getElementById('detail-title');
    if (!view || !detail) return payload;

    const summary = detail.summary || {};
    const manifest = detail.manifest || {};
    const lifecycle = summary.lifecycle_summary;

    title.textContent = (manifest.task || 'Session ' + detail.session_id.substring(0, 8));

    let html = '';

    // Manifest info
    const models = (manifest.models || []).map(m => m.name || m.model_id).join(', ');
    html += `
      <div class="arc-session-meta" style="margin-bottom:var(--cup-space-md)">
        <span class="arc-session-meta-item">ID: <span class="arc-session-meta-value">${esc(detail.session_id.substring(0, 8))}</span></span>
        <span class="arc-session-meta-item">Scale: <span class="arc-session-meta-value">${esc(manifest.scale || '–')}</span></span>
        <span class="arc-session-meta-item">Models: <span class="arc-session-meta-value">${esc(models)}</span></span>
      </div>
    `;

    // Score cards
    html += renderScoreCards(summary);

    // Experiments table with drilldown
    html += renderExperimentsTable(detail.experiments);

    // Lifecycle summary
    html += renderLifecycleSummary(lifecycle);

    view.innerHTML = html;
    return payload.insert('detailRendered', true);
  }
}
