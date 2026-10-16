// cup-ui/components/cup-graph.js — <cup-graph> diagram surface
// Children are the graph: <cup-node node-id x y> and <cup-edge from to>. Edges name
// the nodes they join; the graph derives their coordinates from measured node boxes and
// picks the facing sides (pin one with from-side / to-side on the edge). Where the two
// nodes overlap it slides the attachment points so the wire is straight. Nodes without
// x and y are laid out automatically, top to bottom, or left to right with direction="right".
// Load a spec file with src.
// Also emits: cup-graph-load ({document}), cup-graph-error ({src, message}).
// Emits: cup-graph-select ({id}), cup-graph-change ({spec}) after a node moves.
import { CupElement } from '../cup-element.js';

const DRAG_THRESHOLD = 3;
const KEY_STEP = 10;
const PADDING = 40;
const CORNER_MARGIN = 8;
const NODE_MAX_WIDTH = 256;
const MIN_COLUMN_GAP = 64;
const LABEL_CHAR_WIDTH = 6;
const ROW_HEIGHT = 180;
const SIBLING_GAP = 24;
const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

const NODE_FIELDS = [
  ['label', 'label'], ['shape', 'shape'], ['role', 'role-tag'], ['metricLabel', 'metric-label'],
  ['verification', 'verification'], ['evidence', 'evidence'], ['why', 'why'],
];

const SIDES = ['right', 'left', 'top', 'bottom'];
const VERIFICATIONS = ['none', 'claimed', 'verified', 'failed'];
const OPPOSITE = { right: 'left', left: 'right', top: 'bottom', bottom: 'top' };

/** Facing sides along whichever axis has more room between the two boxes. */
function pickSides(a, b) {
  const hGap = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w));
  const vGap = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h));
  if (hGap >= vGap) return b.x + b.w / 2 >= a.x + a.w / 2 ? ['right', 'left'] : ['left', 'right'];
  return b.y + b.h / 2 >= a.y + a.h / 2 ? ['bottom', 'top'] : ['top', 'bottom'];
}

function anchor(box, side) {
  if (side === 'right') return [box.x + box.w, box.y + box.h / 2];
  if (side === 'left') return [box.x, box.y + box.h / 2];
  if (side === 'top') return [box.x + box.w / 2, box.y];
  return [box.x + box.w / 2, box.y + box.h];
}

/**
 * Positions for nodes that have none: a column per step of the flow (a node sits
 * after everything that feeds it), rows ordered to follow their sources, and each
 * column centered so parents line up with their children.
 */
function autoLayout(ids, edges, columnWidth, down) {
  const known = new Set(ids);
  const preds = new Map(ids.map((id) => [id, []]));
  for (const [from, to] of edges) {
    if (known.has(from) && known.has(to) && from !== to) preds.get(to).push(from);
  }
  const column = new Map();
  const visiting = new Set();
  const columnOf = (id) => {
    if (column.has(id)) return column.get(id);
    if (visiting.has(id)) return -1;
    visiting.add(id);
    const col = preds.get(id).reduce((max, p) => Math.max(max, columnOf(p) + 1), 0);
    visiting.delete(id);
    column.set(id, col);
    return col;
  };
  ids.forEach(columnOf);

  const columns = [];
  for (const id of ids) (columns[column.get(id)] = columns[column.get(id)] || []).push(id);
  const row = new Map();
  const tallest = Math.max(0, ...Array.from(columns, (c) => (c ? c.length : 0)));
  const out = new Map();
  columns.forEach((members, col) => {
    if (!members) return;
    const weight = (id) => {
      const rows = preds.get(id).filter((p) => row.has(p)).map((p) => row.get(p));
      return rows.length ? rows.reduce((a, b) => a + b, 0) / rows.length : Infinity;
    };
    const ordered = members
      .map((id, i) => ({ id, i, w: weight(id) }))
      .sort((a, b) => (a.w === b.w ? a.i - b.i : a.w - b.w));
    const offset = (tallest - ordered.length) / 2;
    ordered.forEach(({ id }, i) => {
      row.set(id, i + offset);
      // Flowing down, steps stack vertically and siblings sit side by side.
      out.set(id, down
        ? { x: PADDING + (i + offset) * (NODE_MAX_WIDTH + SIBLING_GAP), y: PADDING + col * ROW_HEIGHT }
        : { x: PADDING + col * columnWidth, y: PADDING + (i + offset) * ROW_HEIGHT });
    });
  });
  return out;
}

/** The stretch of a side a wire can attach to. A pill's left and right are only its tips. */
function span(box, side) {
  const center = side === 'left' || side === 'right' ? box.y + box.h / 2 : box.x + box.w / 2;
  let lo;
  let hi;
  if (side === 'left' || side === 'right') {
    if (box.shape === 'pill') return [center, center];
    [lo, hi] = [box.y + CORNER_MARGIN, box.y + box.h - CORNER_MARGIN];
  } else {
    const inset = box.shape === 'pill' ? box.h / 2 : CORNER_MARGIN;
    [lo, hi] = [box.x + inset, box.x + box.w - inset];
  }
  return lo <= hi ? [lo, hi] : [center, center];
}

/** Where two facing sides overlap, the shared coordinate that makes the wire straight. */
function straightAt(a, startSide, b, endSide) {
  const [aLo, aHi] = span(a, startSide);
  const [bLo, bHi] = span(b, endSide);
  const lo = Math.max(aLo, bLo);
  const hi = Math.min(aHi, bHi);
  return lo <= hi ? (lo + hi) / 2 : null;
}

function setAttr(el, name, value) {
  if (value === null || value === undefined || value === false) {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  } else if (el.getAttribute(name) !== String(value)) {
    el.setAttribute(name, String(value));
  }
}

class CupGraph extends CupElement {
  static get observedAttributes() {
    return ['selected', 'readonly', 'src'];
  }

  constructor() {
    super();
    this._drag = null;
    this._layoutQueued = false;
    this._hadSelection = false;
    this._suppressClick = false;
    this._mutations = null;
    this._resizes = null;
    this._onDown = (e) => this._pointerDown(e);
    this._onMove = (e) => this._pointerMove(e);
    this._onUp = () => this._pointerUp();
    this._onClick = (e) => this._click(e);
    this._onKey = (e) => this._keyDown(e);
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Diagram');

    this._mutations = new MutationObserver(() => this._queueLayout());
    this._mutations.observe(this, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['x', 'y', 'from', 'to', 'from-side', 'to-side', 'node-id'],
    });
    this._resizes = new ResizeObserver(() => this._queueLayout());

    this.addEventListener('pointerdown', this._onDown);
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKey);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._mutations) this._mutations.disconnect();
    if (this._resizes) this._resizes.disconnect();
    this._endDrag();
    this.removeEventListener('pointerdown', this._onDown);
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKey);
  }

  get nodes() {
    return [...this.children].filter((c) => c.localName === 'cup-node');
  }

  get edges() {
    return [...this.children].filter((c) => c.localName === 'cup-edge');
  }

  /** The graph as plain data: the form an agent reads and writes. */
  get spec() {
    const nodes = this.nodes.map((n) => {
      const out = { id: n.getAttribute('node-id') || '' };
      for (const [key, attr] of NODE_FIELDS) {
        if (n.hasAttribute(attr)) out[key] = n.getAttribute(attr);
      }
      if (!out.shape) out.shape = 'rect';
      // Always stated: a reader should never have to notice a missing key.
      if (!out.verification) out.verification = 'none';
      out.x = parseFloat(n.getAttribute('x')) || 0;
      out.y = parseFloat(n.getAttribute('y')) || 0;
      if (n.hasAttribute('metric')) out.metric = parseFloat(n.getAttribute('metric'));
      return out;
    });
    const edges = this.edges.map((e) => {
      const out = { from: e.getAttribute('from') || '', to: e.getAttribute('to') || '' };
      if (e.hasAttribute('label')) out.label = e.getAttribute('label');
      if (e.hasAttribute('from-side')) out.fromSide = e.getAttribute('from-side');
      if (e.hasAttribute('to-side')) out.toSide = e.getAttribute('to-side');
      return out;
    });
    return { nodes, edges };
  }

  set spec(value) {
    const nodes = (value && value.nodes) || [];
    const edges = (value && value.edges) || [];
    const children = [];
    for (const e of edges) {
      const el = document.createElement('cup-edge');
      setAttr(el, 'from', e.from);
      setAttr(el, 'to', e.to);
      setAttr(el, 'label', e.label);
      setAttr(el, 'from-side', e.fromSide);
      setAttr(el, 'to-side', e.toSide);
      children.push(el);
    }
    for (const n of nodes) {
      const el = document.createElement('cup-node');
      setAttr(el, 'node-id', n.id);
      for (const [key, attr] of NODE_FIELDS) setAttr(el, attr, n[key]);
      setAttr(el, 'x', n.x);
      setAttr(el, 'y', n.y);
      setAttr(el, 'metric', n.metric);
      children.push(el);
    }
    this.replaceChildren(...children);
    this._queueLayout();
  }

  /** What is wrong with the graph as written. Empty when it is sound. */
  get problems() {
    const out = [];
    const counts = new Map();
    for (const n of this.nodes) {
      const id = n.getAttribute('node-id');
      if (!id) out.push('a node has no id');
      else counts.set(id, (counts.get(id) || 0) + 1);
    }
    for (const [id, count] of counts) {
      if (count > 1) out.push(`node id "${id}" is used ${count} times`);
    }
    for (const n of this.nodes) {
      const verification = n.getAttribute('verification');
      if (verification && !VERIFICATIONS.includes(verification)) {
        out.push(`node "${n.getAttribute('node-id')}": unknown verification "${verification}"`);
      }
      if (verification === 'verified' && !n.getAttribute('evidence')) {
        out.push(`node "${n.getAttribute('node-id')}": verified without evidence, shown as claimed`);
      }
    }
    for (const e of this.edges) {
      const from = e.getAttribute('from');
      const to = e.getAttribute('to');
      for (const end of [from, to]) {
        if (!counts.has(end)) out.push(`edge ${from} -> ${to}: no node with id "${end}"`);
      }
    }
    return out;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'src' && newValue && newValue !== oldValue) this._load(newValue);
  }

  async _load(src) {
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`${src}: HTTP ${response.status}`);
      const doc = await response.json();
      if (this.getAttribute('src') !== src) return;
      this.spec = doc;
      this.dispatchEvent(new CustomEvent('cup-graph-load', { bubbles: true, detail: { document: doc } }));
    } catch (error) {
      this.dispatchEvent(new CustomEvent('cup-graph-error', { bubbles: true, detail: { src, message: error.message } }));
    }
  }

  select(id) {
    setAttr(this, 'selected', id || null);
    this.dispatchEvent(new CustomEvent('cup-graph-select', { bubbles: true, detail: { id: id || null } }));
  }

  render() {
    this._layout();
  }

  _queueLayout() {
    if (this._layoutQueued) return;
    this._layoutQueued = true;
    // A microtask, not an animation frame: frames do not fire in a hidden tab.
    queueMicrotask(() => {
      this._layoutQueued = false;
      if (this.isConnected) this._layout();
    });
  }

  _layout() {
    const selected = this.attr('selected');
    const nodes = this.nodes;
    const edges = this.edges;
    const boxes = new Map();
    let maxX = 0;
    let maxY = 0;

    const unplaced = nodes.filter((n) => !n.hasAttribute('x') || !n.hasAttribute('y'));
    if (unplaced.length) {
      // Columns sit far enough apart for the longest edge label to fit between them.
      const longestLabel = Math.max(0, ...edges.map((e) => (e.getAttribute('label') || '').length));
      const placed = autoLayout(
        nodes.map((n) => n.getAttribute('node-id')),
        edges.map((e) => [e.getAttribute('from'), e.getAttribute('to')]),
        NODE_MAX_WIDTH + Math.max(MIN_COLUMN_GAP, longestLabel * LABEL_CHAR_WIDTH + 2 * PADDING),
        this.attr('direction') !== 'right'
      );
      for (const n of unplaced) {
        const at = placed.get(n.getAttribute('node-id')) || { x: PADDING, y: PADDING };
        setAttr(n, 'x', at.x);
        setAttr(n, 'y', at.y);
      }
    }

    for (const n of nodes) {
      const x = parseFloat(n.getAttribute('x')) || 0;
      const y = parseFloat(n.getAttribute('y')) || 0;
      n.style.left = `${x}px`;
      n.style.top = `${y}px`;
      setAttr(n, 'tabindex', '0');
      this._resizes.observe(n);
      const box = { x, y, w: n.offsetWidth, h: n.offsetHeight, shape: n.getAttribute('shape') };
      boxes.set(n.getAttribute('node-id'), box);
      maxX = Math.max(maxX, x + box.w);
      maxY = Math.max(maxY, y + box.h);
    }

    const causes = new Set();
    const effects = new Set();
    for (const e of edges) {
      const from = e.getAttribute('from');
      const to = e.getAttribute('to');
      const a = boxes.get(from);
      const b = boxes.get(to);
      if (!a || !b) {
        setAttr(e, 'hidden', '');
        continue;
      }
      setAttr(e, 'hidden', null);
      const auto = pickSides(a, b);
      const startSide = SIDES.includes(e.getAttribute('from-side')) ? e.getAttribute('from-side') : auto[0];
      const endSide = SIDES.includes(e.getAttribute('to-side')) ? e.getAttribute('to-side') : auto[1];
      let [x1, y1] = anchor(a, startSide);
      let [x2, y2] = anchor(b, endSide);
      if (OPPOSITE[startSide] === endSide) {
        const at = straightAt(a, startSide, b, endSide);
        if (at !== null && (startSide === 'left' || startSide === 'right')) y1 = y2 = at;
        else if (at !== null) x1 = x2 = at;
      }
      setAttr(e, 'start-side', startSide);
      setAttr(e, 'end-side', endSide);
      setAttr(e, 'x1', x1);
      setAttr(e, 'y1', y1);
      setAttr(e, 'x2', x2);
      setAttr(e, 'y2', y2);
      setAttr(e, 'active', selected && (from === selected || to === selected) ? '' : null);
      if (selected && to === selected) causes.add(from);
      if (selected && from === selected) effects.add(to);
    }

    if (selected || this._hadSelection) {
      for (const n of nodes) {
        const id = n.getAttribute('node-id');
        let state = null;
        if (selected) {
          if (id === selected) state = 'focused';
          else if (causes.has(id)) state = 'upstream';
          else if (effects.has(id)) state = 'downstream';
        }
        setAttr(n, 'state', state);
      }
    }
    this._hadSelection = Boolean(selected);

    this.style.minWidth = `${maxX + PADDING}px`;
    this.style.minHeight = `${maxY + PADDING}px`;
  }

  _nodeFrom(target) {
    const node = target instanceof Element ? target.closest('cup-node') : null;
    return node && node.parentElement === this ? node : null;
  }

  _pointerDown(e) {
    if (e.button !== 0) return;
    const node = this._nodeFrom(e.target);
    if (!node) return;
    this._drag = {
      node,
      startX: e.clientX,
      startY: e.clientY,
      originX: parseFloat(node.getAttribute('x')) || 0,
      originY: parseFloat(node.getAttribute('y')) || 0,
      moved: false,
    };
    window.addEventListener('pointermove', this._onMove);
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
  }

  _pointerMove(e) {
    const d = this._drag;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    if (this.bool('readonly')) return;
    d.node.classList.add('cup-graph___dragging');
    setAttr(d.node, 'x', Math.max(0, Math.round(d.originX + dx)));
    setAttr(d.node, 'y', Math.max(0, Math.round(d.originY + dy)));
    this._layout();
  }

  _pointerUp() {
    const d = this._drag;
    this._endDrag();
    if (!d || !d.moved) return;
    // A drag that ends over the background would otherwise fire a deselecting click.
    this._suppressClick = true;
    setTimeout(() => { this._suppressClick = false; }, 0);
    if (!this.bool('readonly')) this._emitChange();
  }

  _endDrag() {
    if (this._drag) this._drag.node.classList.remove('cup-graph___dragging');
    this._drag = null;
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
  }

  _click(e) {
    if (this._suppressClick) return;
    const node = this._nodeFrom(e.target);
    this.select(node ? node.getAttribute('node-id') : null);
  }

  _keyDown(e) {
    const node = this._nodeFrom(e.target);
    if (!node || e.target !== node) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.select(node.getAttribute('node-id'));
      return;
    }
    const step = ARROWS[e.key];
    if (!step || this.bool('readonly')) return;
    e.preventDefault();
    setAttr(node, 'x', Math.max(0, (parseFloat(node.getAttribute('x')) || 0) + step[0] * KEY_STEP));
    setAttr(node, 'y', Math.max(0, (parseFloat(node.getAttribute('y')) || 0) + step[1] * KEY_STEP));
    this._layout();
    this._emitChange();
  }

  _emitChange() {
    this.dispatchEvent(new CustomEvent('cup-graph-change', { bubbles: true, detail: { spec: this.spec } }));
  }
}

customElements.define('cup-graph', CupGraph);
export { CupGraph };
