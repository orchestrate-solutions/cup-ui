// arc-dashboard.js — Pipeline orchestrator for the ARC Observatory dashboard.
// Assembles filters, builds a pipeline, and runs it on page load.
// Provides refresh(), loadDetail(), and loadTimeline() for interactivity.

import { Payload, Pipeline } from '/cup-pipe.js';
import { FetchSessions, FetchQueue, FetchSessionDetail } from './filters/fetch_data.js';
import { FetchActive } from './filters/fetch_active.js';
import { FetchShapes, RenderBuilder } from './filters/render_builder.js';
import { RenderQueue } from './filters/render_queue.js';
import { RenderSessions } from './filters/render_sessions.js';
import { RenderActive } from './filters/render_active.js';
import { RenderDetail } from './filters/render_detail.js';
import { RenderTimeline } from './filters/render_timeline.js';
import { WireControls } from './filters/wire_controls.js';
import { WireApiStatus } from './filters/wire_api_status.js';

// ── Filters ───────────────────────────────────────────────────────

const fetchSessions = new FetchSessions();
const fetchQueue = new FetchQueue();
const fetchActive = new FetchActive();
const fetchShapes = new FetchShapes();
const fetchDetail = new FetchSessionDetail();
const renderQueue = new RenderQueue();
const renderSessions = new RenderSessions();
const renderActive = new RenderActive();
const renderBuilder = new RenderBuilder();
const renderDetail = new RenderDetail();
const renderTimeline = new RenderTimeline();
const wireControls = new WireControls();
const wireApiStatus = new WireApiStatus();

// ── Pipeline: initial load ────────────────────────────────────────

async function initialLoad() {
  const pipeline = new Pipeline();
  pipeline.addFilter(fetchSessions, 'fetch_sessions');
  pipeline.addFilter(fetchQueue, 'fetch_queue');
  pipeline.addFilter(fetchActive, 'fetch_active');
  pipeline.addFilter(fetchShapes, 'fetch_shapes');
  pipeline.addFilter(renderQueue, 'render_queue');
  pipeline.addFilter(renderSessions, 'render_sessions');
  pipeline.addFilter(renderActive, 'render_active');
  pipeline.addFilter(renderBuilder, 'render_builder');
  pipeline.addFilter(wireApiStatus, 'wire_api_status');
  pipeline.addFilter(wireControls, 'wire_controls');

  const payload = new Payload({});
  await pipeline.run(payload);
  console.log('[arc-observatory] Dashboard loaded');
}

// ── Refresh: re-fetch and re-render ───────────────────────────────

async function refresh() {
  const pipeline = new Pipeline();
  pipeline.addFilter(fetchSessions, 'fetch_sessions');
  pipeline.addFilter(fetchQueue, 'fetch_queue');
  pipeline.addFilter(fetchActive, 'fetch_active');
  pipeline.addFilter(renderQueue, 'render_queue');
  pipeline.addFilter(renderSessions, 'render_sessions');
  pipeline.addFilter(renderActive, 'render_active');
  pipeline.addFilter(wireApiStatus, 'wire_api_status');

  const payload = new Payload({});
  await pipeline.run(payload);
  console.log('[arc-observatory] Refreshed');
}

// ── Refresh active organisms only (fast poll) ─────────────────────

async function refreshActive() {
  const pipeline = new Pipeline();
  pipeline.addFilter(fetchActive, 'fetch_active');
  pipeline.addFilter(renderActive, 'render_active');

  const payload = new Payload({});
  await pipeline.run(payload);
}

// ── Load session detail ───────────────────────────────────────────

async function loadDetail(sessionId) {
  const pipeline = new Pipeline();
  pipeline.addFilter(fetchDetail, 'fetch_detail');
  pipeline.addFilter(renderDetail, 'render_detail');

  const payload = new Payload({ selectedSessionId: sessionId });
  await pipeline.run(payload);

  // Show detail panel
  document.querySelectorAll('.arc-panel').forEach(p => p.classList.remove('arc-panel--active'));
  const detailPanel = document.getElementById('panel-detail');
  if (detailPanel) {
    detailPanel.style.display = 'block';
    detailPanel.classList.add('arc-panel--active');
  }

  console.log('[arc-observatory] Detail loaded:', sessionId.substring(0, 8));
}

// ── Load timeline for a session ───────────────────────────────────

async function loadTimeline(sessionId) {
  const pipeline = new Pipeline();
  pipeline.addFilter(fetchDetail, 'fetch_detail');
  pipeline.addFilter(renderTimeline, 'render_timeline');

  const payload = new Payload({ selectedSessionId: sessionId });
  await pipeline.run(payload);

  console.log('[arc-observatory] Timeline loaded:', sessionId.substring(0, 8));
}

// ── Auto-refresh timers ───────────────────────────────────────────

let refreshInterval = null;
let activeInterval = null;

function startAutoRefresh(fullMs = 15000, activeMs = 3000) {
  if (refreshInterval) clearInterval(refreshInterval);
  if (activeInterval) clearInterval(activeInterval);
  refreshInterval = setInterval(refresh, fullMs);
  activeInterval = setInterval(refreshActive, activeMs);
}

// ── Expose to window for control wiring ───────────────────────────

window.arcDashboard = {
  refresh,
  refreshActive,
  loadDetail,
  loadTimeline,
  startAutoRefresh,
  showPanel: null, // will be set by WireControls
};

// ── Boot ──────────────────────────────────────────────────────────

initialLoad().then(() => {
  startAutoRefresh(15000, 3000);
});
