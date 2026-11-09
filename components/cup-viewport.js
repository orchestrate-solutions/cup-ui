// cup-ui/components/cup-viewport.js — <cup-viewport> component
// Shows HTML that this page did not write, apart from the page: in a frame
// with its own origin. The HTML can run scripts and load a library from an
// https address, and it still cannot read the storage or the cookies of the
// page, call a server as the page, touch the page, change its address, or
// send a form. The frame has the height of its content, so it reads as a
// part of the page and not as a box with a scroll bar.
//
// Give the HTML with the `html` property (not an attribute: it can be long,
// and an attribute would make it a part of the page's own markup):
//
//   const view = document.createElement('cup-viewport');
//   view.html = '<h1>Hello</h1><script>document.body.append("ran")</script>';
//
// Attributes:
//   max-height  the most that the frame grows to, in px (default 2000). Past
//               it, the content scrolls inside the frame.
//   label       the title of the frame, for a screen reader.
//   actions     shows two buttons under the frame: Copy (the HTML, to the
//               clipboard) and Download (the HTML, as a page in a file).
//   filename    the name of the file that Download saves (default
//               viewport.html).
//
// The content is shown on a white background with dark text, as a page with
// no styles is. It fires `cup-viewport-resize` (detail: { height }) when its
// height changes.
import { CupElement } from '../cup-element.js';

// What the frame can load: scripts, styles, fonts and pictures from https.
// Nothing from plain http, so that it cannot reach a device of the local
// network. No fetch, no frames, no forms.
const RULES = "default-src 'none'; script-src 'unsafe-inline' https:; style-src 'unsafe-inline' https:; "
  + "img-src data: blob: https:; font-src data: https:; connect-src 'none'; base-uri 'none'; form-action 'none'";

const BASE_STYLE = 'html,body{margin:0}body{padding:12px;font-family:system-ui,sans-serif;background:#fff;color:#111;'
  + 'overflow-wrap:anywhere}img,svg,canvas,video{max-width:100%;height:auto}';

// Runs in the frame: tells the page the height of the content. The height of
// the body is used, not of the document: a document is never shorter than
// its frame, so a frame that follows it could grow and never get smaller.
const REPORT = '(function(){var last=-1;function tell(){var h=Math.ceil(document.body.getBoundingClientRect().height);'
  + 'if(h!==last){last=h;parent.postMessage({cupViewportHeight:h},"*")}}'
  + 'new ResizeObserver(tell).observe(document.body);addEventListener("load",tell);'
  + 'var n=0,t=setInterval(function(){tell();if(++n>40)clearInterval(t)},250)})()';

class CupViewport extends CupElement {
  static get observedAttributes() {
    return ['max-height', 'label', 'actions', 'filename'];
  }

  constructor() {
    super();
    this._html = '';
    this._frame = null;
    this._bar = null;
    this._shown = null;
    this._height = 0;
    this._told = null; // the height that the last event gave
    this._onMessage = (event) => {
      if (!this._frame || event.source !== this._frame.contentWindow) return;
      const height = Number(event.data && event.data.cupViewportHeight);
      if (!Number.isFinite(height) || height < 0) return;
      this._height = height;
      this._fit();
    };
  }

  get html() { return this._html; }
  set html(value) {
    this._html = value == null ? '' : String(value);
    if (this.isConnected) this.render();
  }

  connectedCallback() {
    window.addEventListener('message', this._onMessage);
    super.connectedCallback();
  }

  disconnectedCallback() {
    window.removeEventListener('message', this._onMessage);
    super.disconnectedCallback();
  }

  /** The HTML as a page that can be opened alone. */
  _page() {
    return `<!doctype html>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${this._html}\n`;
  }

  // The clipboard of the browser, or the old way on a page that is not served with https.
  async _copy(button) {
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(this._html);
        ok = true;
      } else {
        const area = document.createElement('textarea');
        area.value = this._html;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand('copy');
        area.remove();
      }
    } catch (error) {
      ok = false;
    }
    button.textContent = ok ? 'Copied' : 'Not copied';
    setTimeout(() => { button.textContent = 'Copy'; }, 1500);
  }

  _download() {
    const url = URL.createObjectURL(new Blob([this._page()], { type: 'text/html' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = this.attr('filename') || 'viewport.html';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  _actions() {
    const wanted = this.bool('actions');
    if (wanted && !this._bar) {
      this._bar = document.createElement('div');
      this._bar.className = 'cup-viewport___actions';
      const make = (text, run) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cup-button cup-button--ghost cup-button--sm';
        button.textContent = text;
        button.addEventListener('click', () => run(button));
        return button;
      };
      this._bar.append(make('Copy', (button) => this._copy(button)), make('Download', () => this._download()));
      this.append(this._bar);
    } else if (!wanted && this._bar) {
      this._bar.remove();
      this._bar = null;
    }
  }

  _maxHeight() {
    const given = Number(this.attr('max-height'));
    return Number.isFinite(given) && given > 0 ? given : 2000;
  }

  _fit() {
    if (!this._frame) return;
    const height = Math.min(this._height, this._maxHeight());
    this._frame.style.height = `${height}px`;
    if (height === this._told) return;
    this._told = height;
    this.dispatchEvent(new CustomEvent('cup-viewport-resize', { detail: { height }, bubbles: true }));
  }

  render() {
    this.classList.add('cup-viewport');
    if (!this._frame) {
      this._frame = document.createElement('iframe');
      this._frame.className = 'cup-viewport___frame';
      // allow-scripts and nothing more: no allow-same-origin, so the frame has an origin of its own.
      this._frame.setAttribute('sandbox', 'allow-scripts');
      this._frame.setAttribute('referrerpolicy', 'no-referrer');
      this.replaceChildren(this._frame);
    }
    this._frame.setAttribute('title', this.attr('label') || 'Content shown apart from this page');
    this._actions();
    if (this._shown !== this._html) {
      this._shown = this._html;
      // The new content has no height yet. The frame tells it when it has one.
      this._height = 0;
      this._told = 0;
      this._frame.style.height = '0px';
      this._frame.srcdoc = '<!doctype html><meta charset="utf-8">'
        + `<meta http-equiv="Content-Security-Policy" content="${RULES}">`
        + `<style>${BASE_STYLE}</style><body>${this._html}<script>${REPORT}</` + 'script>';
    } else {
      this._fit();
    }
  }
}

customElements.define('cup-viewport', CupViewport);
export { CupViewport };
