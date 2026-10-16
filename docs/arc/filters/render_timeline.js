// render_timeline.js — Filter: renders lifecycle event timeline.
// Reads: sessionDetail
// Writes: timelineRendered

function esc(s) {
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

function formatTimestamp(ts) {
  if (!ts) return '–';
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

function eventClass(event) {
  const type = event.event_type || event.type || '';
  if (type.includes('error') || type === 'on_error') return 'arc-timeline-event--error';
  if (type.includes('after') || type === 'metric') return 'arc-timeline-event--success';
  return '';
}

export class RenderTimeline {
  async call(payload) {
    const detail = payload.get('sessionDetail');
    const view = document.getElementById('timeline-view');
    if (!view) return payload;

    if (!detail || !detail.lifecycle) {
      view.innerHTML = '<p class="arc-empty">No lifecycle data for this session.</p>';
      return payload;
    }

    const events = detail.lifecycle.events || [];
    if (events.length === 0) {
      view.innerHTML = '<p class="arc-empty">No events recorded.</p>';
      return payload;
    }

    let html = '';
    for (const ev of events) {
      const time = formatTimestamp(ev.timestamp);
      const type = ev.event_type || ev.type || 'event';
      const filterName = ev.filter_name || ev.step || '';
      const cls = eventClass(ev);

      let detail_text = '';
      if (ev.error) {
        detail_text = esc(String(ev.error).substring(0, 200));
      } else if (ev.duration_ms) {
        detail_text = `${ev.duration_ms.toFixed(0)}ms`;
      }

      html += `
        <div class="arc-timeline-event ${cls}">
          <span class="arc-timeline-time">${esc(time)}</span>
          <span class="arc-timeline-label">${esc(type)} ${esc(filterName)}</span>
          ${detail_text ? `<span class="arc-timeline-detail">${detail_text}</span>` : ''}
        </div>
      `;
    }

    view.innerHTML = html;
    return payload.insert('timelineRendered', true);
  }
}
