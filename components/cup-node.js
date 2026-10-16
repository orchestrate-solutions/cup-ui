// cup-ui/components/cup-node.js — <cup-node> diagram node
// A labelled proposition with shape, focus state, an optional in-place metric bar,
// a verification status that only reads "verified" when evidence is attached, and an
// optional reason (why) shown on the node itself, where the reader is already looking.
import { CupElement } from '../cup-element.js';

const SHAPES = ['rect', 'diamond', 'cylinder', 'pill'];
const STATES = ['focused', 'upstream', 'downstream', 'dimmed'];
const FLOW_CUES = { upstream: 'cause', downstream: 'effect' };
const VERIFICATIONS = { claimed: 'claimed', verified: '\u2713 verified', failed: '\u2717 failed' };

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML.replace(/"/g, '&quot;');
}

class CupNode extends CupElement {
  static get observedAttributes() {
    return ['node-id', 'label', 'shape', 'role-tag', 'state', 'metric', 'metric-label', 'verification', 'evidence', 'why'];
  }

  render() {
    const id = this.attr('node-id') || '';
    const label = this.attr('label') || '';
    const shape = SHAPES.includes(this.attr('shape')) ? this.attr('shape') : 'rect';
    const state = STATES.includes(this.attr('state')) ? this.attr('state') : '';
    const roleTag = this.attr('role-tag') || '';
    const metric = this.attr('metric');
    const metricLabel = this.attr('metric-label') || 'Metric';
    const why = this.attr('why') || '';

    const flow = FLOW_CUES[state] || '';
    const evidence = this.attr('evidence') || '';
    let verification = Object.keys(VERIFICATIONS).includes(this.attr('verification')) ? this.attr('verification') : '';
    if (verification === 'verified' && !evidence) verification = 'claimed';

    const classes = CupElement.classList(
      'cup-node', `cup-node--${shape}`, state && `cup-node--${state}`, verification && `cup-node--${verification}`
    );
    const ariaLabel = [label, flow, verification].filter(Boolean).join(', ');

    const meta = id || roleTag || flow
      ? `<div class="cup-node___meta">
          <span class="cup-node___id">${id ? `#${esc(id)}` : ''}</span>
          ${flow ? `<span class="cup-node___flow">${flow}</span>` : ''}
          ${roleTag ? `<span class="cup-node___role">${esc(roleTag)}</span>` : ''}
        </div>`
      : '';

    const statusHtml = verification
      ? `<div class="cup-node___status cup-node___status--${verification}">
          <span class="cup-node___status-tag">${VERIFICATIONS[verification]}</span>
          ${evidence ? `<span class="cup-node___evidence">${esc(evidence)}</span>` : ''}
        </div>`
      : '';

    const metricHtml = metric !== null && metric !== ''
      ? `<cup-progress size="sm" value="${esc(metric)}" label="${esc(metricLabel)}"></cup-progress>`
      : '';

    this.innerHTML = `<article class="${classes}" role="group" aria-label="${esc(ariaLabel)}">
      ${meta}
      <div class="cup-node___label">${esc(label)}</div>
      ${why ? `<p class="cup-node___why">${esc(why)}</p>` : ''}
      ${metricHtml}
      ${statusHtml}
    </article>`;
  }
}

customElements.define('cup-node', CupNode);
export { CupNode };
