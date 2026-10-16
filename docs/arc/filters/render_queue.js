// render_queue.js — Filter: renders the task queue lanes.
// Reads: queue
// Writes: queueRendered

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function issueCard(issue) {
  const title = issue.title || 'Untitled';
  const number = issue.number || '?';
  const url = issue.url || '#';
  return `
    <div class="arc-issue-card" onclick="window.open('${esc(url)}', '_blank')">
      <span class="arc-issue-number">#${number}</span>
      <p class="arc-issue-title">${esc(title)}</p>
    </div>
  `;
}

export class RenderQueue {
  async call(payload) {
    const queue = payload.get('queue') || { ready: [], claimed: [], done: [] };

    const laneReady = document.getElementById('lane-ready');
    const laneClaimed = document.getElementById('lane-claimed');
    const laneDone = document.getElementById('lane-done');

    if (laneReady) {
      laneReady.innerHTML = queue.ready.length
        ? queue.ready.map(issueCard).join('')
        : '<p class="arc-empty" style="font-size:var(--cup-font-size-xs)">No tasks waiting</p>';
      document.getElementById('lane-ready-count').textContent = queue.ready.length;
    }

    if (laneClaimed) {
      laneClaimed.innerHTML = queue.claimed.length
        ? queue.claimed.map(issueCard).join('')
        : '<p class="arc-empty" style="font-size:var(--cup-font-size-xs)">No active organisms</p>';
      document.getElementById('lane-claimed-count').textContent = queue.claimed.length;
    }

    if (laneDone) {
      laneDone.innerHTML = queue.done.length
        ? queue.done.map(issueCard).join('')
        : '<p class="arc-empty" style="font-size:var(--cup-font-size-xs)">No completed tasks</p>';
      document.getElementById('lane-done-count').textContent = queue.done.length;
    }

    // Sidebar stats
    document.getElementById('stat-ready').textContent = queue.ready.length;
    document.getElementById('stat-running').textContent = queue.claimed.length;
    document.getElementById('stat-done').textContent = queue.done.length;

    return payload.insert('queueRendered', true);
  }
}
