// fetch_active.js — Filter: fetches currently running organisms.
// Reads: (none)
// Writes: active, activeOk

export class FetchActive {
  async call(payload) {
    try {
      const resp = await fetch('/api/active');
      const data = await resp.json();
      return payload
        .insert('active', data.organisms || [])
        .insert('activeOk', true);
    } catch {
      return payload
        .insert('active', [])
        .insert('activeOk', false);
    }
  }
}
