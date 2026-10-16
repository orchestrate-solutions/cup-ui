// wire_api_status.js — Filter: checks API health and updates status indicator.
// Reads: apiOk
// Writes: statusWired

export class WireApiStatus {
  async call(payload) {
    const apiOk = payload.get('apiOk');
    const dot = document.querySelector('.arc-status-dot');
    const text = document.getElementById('api-status-text');

    if (dot && text) {
      dot.className = 'arc-status-dot';
      if (apiOk) {
        dot.classList.add('arc-status-dot--ok');
        text.textContent = 'Connected';
      } else {
        dot.classList.add('arc-status-dot--error');
        text.textContent = 'API Offline';
      }
    }

    return payload.insert('statusWired', true);
  }
}
