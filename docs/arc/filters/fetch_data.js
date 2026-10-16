// fetch_data.js — Filter: fetches sessions and queue data from the API.
// Reads: apiBase (string)
// Writes: sessions, queue, apiOk

const API_BASE = '/api';

export class FetchSessions {
  async call(payload) {
    try {
      const resp = await fetch(`${API_BASE}/sessions`);
      const data = await resp.json();
      return payload
        .insert('sessions', data.sessions || [])
        .insert('apiOk', true);
    } catch {
      return payload.insert('sessions', []).insert('apiOk', false);
    }
  }
}

export class FetchQueue {
  async call(payload) {
    try {
      const resp = await fetch(`${API_BASE}/queue`);
      const data = await resp.json();
      return payload
        .insert('queue', data)
        .insert('apiOk', true);
    } catch {
      return payload.insert('queue', { ready: [], claimed: [], done: [] }).insert('apiOk', false);
    }
  }
}

export class FetchSessionDetail {
  async call(payload) {
    const id = payload.get('selectedSessionId');
    if (!id) return payload;
    try {
      const resp = await fetch(`${API_BASE}/sessions/${encodeURIComponent(id)}`);
      const data = await resp.json();
      return payload.insert('sessionDetail', data);
    } catch {
      return payload.insert('sessionDetail', null);
    }
  }
}
