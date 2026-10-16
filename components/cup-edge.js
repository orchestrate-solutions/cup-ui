// cup-ui/components/cup-edge.js — <cup-edge> orthogonal diagram connector
// Right-angle path from (x1,y1) to (x2,y2), leaving and entering by any side (start-side,
// end-side), with an arrowhead and optional label at the bend.
// Renders into the parent's coordinate space: place it inside a positioned container.
import { CupElement } from '../cup-element.js';

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML.replace(/"/g, '&quot;');
}

const HORIZONTAL = ['right', 'left'];
const SIDES = ['right', 'left', 'top', 'bottom'];
const STUB = 24;

/**
 * Right-angle route from (x1,y1) to (x2,y2). The sides say which way the path
 * leaves the source and enters the target; every segment is horizontal or vertical.
 */
export function orthogonalPath(x1, y1, x2, y2, startSide = 'right', endSide = 'left') {
  const startH = HORIZONTAL.includes(startSide);
  const endH = HORIZONTAL.includes(endSide);
  let pts;
  let mid;
  if (startH && endH) {
    let mx = x1 + (x2 - x1) / 2;
    if (startSide === endSide) mx = startSide === 'right' ? Math.max(x1, x2) + STUB : Math.min(x1, x2) - STUB;
    pts = [[x1, y1], [mx, y1], [mx, y2], [x2, y2]];
    mid = { x: mx, y: (y1 + y2) / 2 };
  } else if (!startH && !endH) {
    let my = y1 + (y2 - y1) / 2;
    if (startSide === endSide) my = startSide === 'bottom' ? Math.max(y1, y2) + STUB : Math.min(y1, y2) - STUB;
    pts = [[x1, y1], [x1, my], [x2, my], [x2, y2]];
    mid = { x: (x1 + x2) / 2, y: my };
  } else if (startH) {
    pts = [[x1, y1], [x2, y1], [x2, y2]];
    mid = { x: x2, y: y1 };
  } else {
    pts = [[x1, y1], [x1, y2], [x2, y2]];
    mid = { x: x1, y: y2 };
  }
  return { d: `M ${pts.map((p) => `${p[0]} ${p[1]}`).join(' L ')}`, mid };
}

class CupEdge extends CupElement {
  static get observedAttributes() {
    return ['x1', 'y1', 'x2', 'y2', 'start-side', 'end-side', 'label', 'active', 'from', 'to'];
  }

  render() {
    const n = (name) => parseFloat(this.attr(name)) || 0;
    const side = (name, fallback) => (SIDES.includes(this.attr(name)) ? this.attr(name) : fallback);
    const { d, mid } = orthogonalPath(
      n('x1'), n('y1'), n('x2'), n('y2'), side('start-side', 'right'), side('end-side', 'left')
    );
    const label = this.attr('label') || '';
    const from = this.attr('from');
    const to = this.attr('to');
    const active = this.bool('active');
    const markerId = `${this.cupId}-arrow`;

    const aria = from && to
      ? `role="img" aria-label="${esc(`${from} to ${to}${label ? `: ${label}` : ''}`)}"`
      : 'aria-hidden="true"';

    const labelWidth = Math.max(40, label.length * 6 + 16);
    const labelHtml = label
      ? `<g class="cup-edge___label" transform="translate(${mid.x}, ${mid.y})">
          <rect class="cup-edge___label-box" x="${-labelWidth / 2}" y="-10" width="${labelWidth}" height="20" rx="2"></rect>
          <text class="cup-edge___label-text">${esc(label)}</text>
        </g>`
      : '';

    this.innerHTML = `<svg class="cup-edge" ${aria}>
      <defs>
        <marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path class="cup-edge___arrow" d="M 0 1 L 10 5 L 0 9 z"></path>
        </marker>
      </defs>
      <path class="${CupElement.classList('cup-edge___path', active && 'cup-edge___path--active')}" d="${d}" marker-end="url(#${markerId})"></path>
      ${labelHtml}
    </svg>`;
  }
}

customElements.define('cup-edge', CupEdge);
export { CupEdge };
