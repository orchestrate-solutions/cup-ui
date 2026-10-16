// cup-ui/components/cup-agent-chat.js — <cup-agent-chat> component
// Renders an agent run as a chat transcript: the operator's objective as a
// user bubble, model narration as agent bubbles, and tool calls/approvals as
// single collapsible system lines (call + its eventual result merged into
// one row, click to expand full args/output) — turn boundaries as thin
// dividers, and the terminal run_finished/error as a closing banner. Built
// for streaming: call `post()`/`event()` as milestones arrive (e.g. from an
// EventSource), and the transcript autoscrolls to the newest entry unless
// the reader has scrolled up to review history.
//
// A composer is pinned at the bottom so the operator can send a follow-up
// message into whatever session the host page currently has this element
// pointed at — the component doesn't know about sessions itself, it just
// emits a `cup-chat-send` CustomEvent (detail: { text }) and clears the
// input; the host wires that to its own "which session is this" logic and
// disables the composer (`disabled` attribute) when there's no live target.
import { CupElement } from '../cup-element.js';

class CupAgentChat extends CupElement {
  static get observedAttributes() {
    return ['max-items', 'empty-text', 'placeholder', 'disabled'];
  }

  constructor() {
    super();
    this._entries = [];
    this._pendingTools = new Map();
    this._pendingApprovals = new Map();
    this._pinned = true;
    this._listEl = null;
    this._composerEl = null;
    this._inputEl = null;
    this._sendEl = null;
  }

  connectedCallback() {
    this._ensureSkeleton();
    super.connectedCallback();
  }

  // Builds the persistent list + composer DOM once. `render()` only ever
  // rewrites `_listEl.innerHTML` afterwards — the composer (and whatever
  // draft the operator is mid-typing) is never touched by a streamed event.
  _ensureSkeleton() {
    if (this._listEl) return;
    this.innerHTML = '';

    this._listEl = document.createElement('div');
    this._listEl.className = 'cup-agent-chat___list';
    this._listEl.setAttribute('role', 'log');
    this._listEl.setAttribute('aria-live', 'polite');
    this._listEl.addEventListener('scroll', () => {
      const el = this._listEl;
      this._pinned = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    }, { passive: true });
    this._listEl.addEventListener('click', e => this._onListClick(e));
    this.appendChild(this._listEl);

    this._composerEl = document.createElement('form');
    this._composerEl.className = 'cup-agent-chat___composer';
    this._composerEl.innerHTML = `
      <input type="text" class="cup-agent-chat___input" autocomplete="off" />
      <button type="submit" class="cup-agent-chat___send" aria-label="Send message">&#10148;</button>
    `;
    this._composerEl.addEventListener('submit', e => {
      e.preventDefault();
      this._submitComposer();
    });
    this.appendChild(this._composerEl);
    this._inputEl = this._composerEl.querySelector('.cup-agent-chat___input');
    this._sendEl = this._composerEl.querySelector('.cup-agent-chat___send');
  }

  _onListClick(e) {
    const more = e.target.closest('[data-more]');
    if (more) {
      const bubble = more.closest('.cup-agent-chat___bubble');
      if (bubble) {
        const open = bubble.classList.toggle('cup-agent-chat___bubble--open');
        more.textContent = open ? 'show less' : 'show more';
        more.setAttribute('aria-expanded', String(open));
      }
      return;
    }
    const sys = e.target.closest('.cup-agent-chat___system[data-id]');
    if (sys) {
      const en = this._entries.find(x => x.id === sys.dataset.id);
      if (en && en.detail) {
        en.open = !en.open;
        this._scheduleRender();
      }
    }
  }

  _submitComposer() {
    if (this.bool('disabled')) return;
    const text = (this._inputEl.value || '').trim();
    if (!text) return;
    this._inputEl.value = '';
    this.dispatchEvent(new CustomEvent('cup-chat-send', { bubbles: true, detail: { text } }));
  }

  render() {
    this.className = 'cup-agent-chat';
    this._ensureSkeleton();

    if (!this._entries.length) {
      this._listEl.innerHTML = `<div class="cup-agent-chat___empty">${this._esc(this.attr('empty-text') || 'waiting for activity…')}</div>`;
    } else {
      this._listEl.innerHTML = this._entries.map(en => this._renderEntry(en)).join('');
      if (this._pinned) this._listEl.scrollTop = this._listEl.scrollHeight;
    }

    const disabled = this.bool('disabled');
    this._inputEl.placeholder = this.attr('placeholder') || 'Send a message…';
    this._inputEl.disabled = disabled;
    this._sendEl.disabled = disabled;
  }

  _renderEntry(en) {
    switch (en.kind) {
      case 'user': return this._renderUser(en);
      case 'divider': return this._renderDivider(en);
      case 'run_finished': return this._renderFinished(en);
      case 'agent': return this._renderAgent(en);
      default: return this._renderSystem(en);
    }
  }

  _renderUser(en) {
    return `
      <div class="cup-agent-chat___row cup-agent-chat___row--user">
        <div class="cup-agent-chat___bubble cup-agent-chat___bubble--user">${this._esc(en.text)}</div>
      </div>`;
  }

  _renderAgent(en) {
    const long = en.text.length > 320;
    return `
      <div class="cup-agent-chat___row cup-agent-chat___row--agent">
        <span class="cup-agent-chat___avatar" aria-hidden="true">&#9670;</span>
        <div class="cup-agent-chat___bubble cup-agent-chat___bubble--agent${en.error ? ' cup-agent-chat___bubble--error' : ''}${long ? ' cup-agent-chat___bubble--clamped' : ''}">
          <div class="cup-agent-chat___text">${this._esc(en.text)}</div>
          ${long ? `<button type="button" class="cup-agent-chat___more" data-more aria-expanded="false">show more</button>` : ''}
          ${en.time ? `<span class="cup-agent-chat___time">${this._esc(en.time)}</span>` : ''}
        </div>
      </div>`;
  }

  _renderSystem(en) {
    const expandable = !!en.detail;
    return `
      <div class="cup-agent-chat___system cup-agent-chat___system--${en.variant || 'neutral'}${en.pending ? ' cup-agent-chat___system--pending' : ''}${expandable ? ' cup-agent-chat___system--expandable' : ''}"${en.id ? ` data-id="${en.id}"` : ''} role="${expandable ? 'button' : ''}" ${expandable ? 'tabindex="0"' : ''}>
        <span class="cup-agent-chat___system-dot" aria-hidden="true"></span>
        <span class="cup-agent-chat___system-text">${this._esc(en.text)}</span>
        ${expandable ? `<span class="cup-agent-chat___system-chevron" aria-hidden="true">${en.open ? '&#9662;' : '&#9656;'}</span>` : ''}
        ${en.time ? `<span class="cup-agent-chat___time">${this._esc(en.time)}</span>` : ''}
        ${expandable && en.open ? `<pre class="cup-agent-chat___detail">${this._esc(en.detail)}</pre>` : ''}
      </div>`;
  }

  _renderDivider(en) {
    return `<div class="cup-agent-chat___divider"><span>${this._esc(en.text)}</span></div>`;
  }

  _renderFinished(en) {
    const ok = en.variant !== 'error';
    return `
      <div class="cup-agent-chat___finished ${ok ? 'cup-agent-chat___finished--ok' : 'cup-agent-chat___finished--error'}">
        ${this._esc(en.text)}
      </div>`;
  }

  _esc(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  _push(entry) {
    this._entries.push(entry);
    const max = parseInt(this.attr('max-items') || '200', 10);
    while (this._entries.length > max) this._entries.shift();
    this._scheduleRender();
  }

  // ── Public API ──

  /** Post the operator's objective as a right-aligned user bubble. */
  post(text) {
    this._push({ kind: 'user', text: String(text || ''), id: nextId() });
  }

  /** Feed one streamed milestone. `kind` and `data` match agent-serve's SSE
   *  contract exactly (see codeupipe/ai/agents/raw_terminal/{filters/
   *  call_model.py, filters/run_tool.py, serve.py, serve_approvers.py}):
   *    turn_started      {}
   *    model_text        { content }
   *    tool_call         { tool_call_id, name, arguments }        (arguments: raw JSON string)
   *    tool_result       { tool_call_id, result: { output, error } }
   *    end_turn          { summary }
   *    awaiting_approval { approval_id, command }
   *    approval_resolved { approval_id, approved, reason, source }
   *    run_finished      { status }                                (done | stopped | error)
   *    error             { message }
   *  `at` is its timestamp (optional). Calls and their eventual results, and
   *  approval requests and their eventual resolution, are matched by id and
   *  merged into a single collapsible row rather than appended as separate
   *  lines. Empty model text (thinking-only turns) is dropped rather than
   *  shown as a blank bubble. */
  event(kind, data = {}, at) {
    const time = fmtTime(at);

    switch (kind) {
      case 'turn_started':
        this._push({ kind: 'divider', text: 'Turn started', id: nextId() });
        return;

      case 'end_turn':
        this._push({ kind: 'system', variant: 'neutral', text: data.summary ? truncate(data.summary, 100) : 'Turn ended', time, id: nextId() });
        return;

      case 'model_text': {
        const text = (data.content || '').trim();
        if (!text) return;
        this._push({ kind: 'agent', text, time, id: nextId() });
        return;
      }

      case 'tool_call': {
        const tool = data.name || 'tool';
        const args = parseMaybeJson(data.arguments) ?? data.arguments;
        const en = {
          kind: 'system', variant: 'tool', pending: true, id: nextId(),
          tool, argsShort: shortArgs(args), time, text: `${tool}(${shortArgs(args)})`,
          detail: args ? safeJson(args) : null, open: false,
        };
        this._push(en);
        if (data.tool_call_id) this._pendingTools.set(data.tool_call_id, en);
        return;
      }

      case 'tool_result': {
        const en = data.tool_call_id ? this._pendingTools.get(data.tool_call_id) : null;
        if (data.tool_call_id) this._pendingTools.delete(data.tool_call_id);
        const result = data.result || {};
        const ok = !result.error;
        const summary = result.error || result.output || (ok ? 'ok' : 'failed');
        if (en) {
          en.pending = false;
          en.variant = ok ? 'tool' : 'error';
          en.text = `${en.tool}(${en.argsShort}) → ${truncate(String(summary), 80)}`;
          en.detail = joinDetail(en.detail, result.error ? `error: ${result.error}` : (result.output != null ? safeJson(result.output) : null));
          en.time = time || en.time;
          this._scheduleRender();
        } else {
          this._push({ kind: 'system', variant: ok ? 'tool' : 'error', text: truncate(String(summary), 80), time, id: nextId(), detail: result.output != null ? safeJson(result.output) : null });
        }
        return;
      }

      case 'awaiting_approval': {
        const en = {
          kind: 'system', variant: 'warn', pending: true, id: nextId(),
          text: `approval requested — ${truncate(data.command || '', 60)}`.trim(),
          time, detail: data.command || null, open: false,
        };
        this._push(en);
        if (data.approval_id) this._pendingApprovals.set(data.approval_id, en);
        return;
      }

      case 'approval_resolved': {
        const en = data.approval_id ? this._pendingApprovals.get(data.approval_id) : null;
        if (data.approval_id) this._pendingApprovals.delete(data.approval_id);
        const granted = !!data.approved;
        const verb = granted ? 'approved' : 'denied';
        const suffix = data.reason ? ` — ${data.reason}` : '';
        if (en) {
          en.pending = false;
          en.variant = granted ? 'ok' : 'error';
          en.text = `${verb}${suffix} (${data.source || 'auto'})`;
          en.time = time || en.time;
          this._scheduleRender();
        } else {
          this._push({ kind: 'system', variant: granted ? 'ok' : 'error', text: `${verb}${suffix} (${data.source || 'auto'})`, time, id: nextId() });
        }
        return;
      }

      case 'run_finished': {
        const failed = data.status === 'error';
        const label = data.status === 'stopped' ? 'Mission stopped' : failed ? 'Run failed' : 'Mission complete';
        this._push({ kind: 'run_finished', text: label, variant: failed ? 'error' : 'ok', id: nextId() });
        return;
      }

      case 'error':
        this._push({ kind: 'agent', error: true, text: data.message || 'Error', time, id: nextId() });
        return;

      default:
        this._push({ kind: 'system', variant: 'neutral', text: data.summary || data.message || String(kind), time, id: nextId() });
    }
  }

  /** Clear the transcript. */
  reset() {
    this._entries = [];
    this._pendingTools.clear();
    this._pendingApprovals.clear();
    this._pinned = true;
    this._scheduleRender();
  }

  /** All entries currently held, oldest first. */
  get entries() { return this._entries.slice(); }

  /** Focus the composer input. */
  focusComposer() {
    this._ensureSkeleton();
    this._inputEl.focus();
  }
}

let idCounter = 0;
function nextId() { return `cac-${++idCounter}`; }

function fmtTime(at) {
  if (!at) return '';
  const ms = at > 1e12 ? at : at * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function parseMaybeJson(s) {
  if (typeof s !== 'string' || !s.trim()) return null;
  try {
    return JSON.parse(s);
  } catch (_) {
    return null;
  }
}

function shortArgs(args) {
  if (!args) return '';
  try {
    const s = typeof args === 'string' ? args : JSON.stringify(args);
    return s.length > 48 ? s.slice(0, 48) + '…' : s;
  } catch (_) {
    return '';
  }
}

function truncate(s, n) {
  s = String(s == null ? '' : s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function safeJson(v) {
  try {
    return typeof v === 'string' ? v : JSON.stringify(v, null, 2);
  } catch (_) {
    return String(v);
  }
}

function joinDetail(a, b) {
  const parts = [a, b].filter(Boolean);
  return parts.length ? parts.join('\n\n→ result:\n') : null;
}

customElements.define('cup-agent-chat', CupAgentChat);
export { CupAgentChat };
