// cup-ui/components/cup-audio-wave.js — <cup-audio-wave> component
// A waveform of audio, in two modes:
//   Live:  el.stream = mediaStream   — level bars that move from right to left as the sound comes, and the time since the start.
//   File:  <cup-audio-wave src="a.wav" controls>  — the whole waveform of a WAV or an MP3, its duration, and with `controls`
//          a play and pause button; the part that was played has the strong color.
//          el.audio = audioElement makes it follow an audio element that the page owns: the progress, the time
//          ("0:12 / 0:31"), and a tap on the waveform moves that element to that place.
// It draws on a canvas, with the colors of the theme (--cup-color-primary, --cup-color-border). Zero dependencies.
import { CupElement } from '../cup-element.js';

/** How often a live bar is added, in milliseconds. */
const LIVE_STEP_MS = 60;

/** The time as m:ss. */
function clock(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** The peak of each of `count` equal parts of the samples, from 0 to 1. */
function peaksOf(samples, count) {
  const peaks = new Array(count).fill(0);
  const size = samples.length / count;
  for (let part = 0; part < count; part++) {
    let peak = 0;
    const end = Math.min(samples.length, Math.floor((part + 1) * size));
    for (let at = Math.floor(part * size); at < end; at++) {
      const value = Math.abs(samples[at]);
      if (value > peak) peak = value;
    }
    peaks[part] = peak;
  }
  const top = Math.max(...peaks, 0.0001);
  return peaks.map((peak) => peak / top);
}

class CupAudioWave extends CupElement {
  static get observedAttributes() {
    return ['src', 'controls', 'label'];
  }

  constructor() {
    super();
    this._levels = [];
    this._peaks = null;
    this._duration = 0;
    this._stream = null;
  }

  /** A MediaStream to show live. Null stops the live view. */
  get stream() {
    return this._stream;
  }

  set stream(stream) {
    this._stopLive();
    this._stream = stream || null;
    if (this._stream && this.isConnected) this._startLive();
  }

  /** An audio element of the page to follow, in file mode. Its time is shown, and a tap on the waveform seeks it. */
  get audio() {
    return this._audio || null;
  }

  set audio(audio) {
    if (this._followed) for (const [name, fn] of this._followed) this._audio.removeEventListener(name, fn);
    this._followed = null;
    this._audio = audio || null;
    if (!this._audio) return;
    const update = () => { this._showTime(); this._draw(); };
    this._followed = [['timeupdate', update], ['durationchange', update], ['progress', update], ['seeked', update], ['ratechange', update],
      ['play', () => { this._showPlay(true); this._follow(); }], ['pause', () => this._showPlay(false)], ['ended', update]];
    for (const [name, fn] of this._followed) this._audio.addEventListener(name, fn);
    update();
  }

  /** The seconds since the live view started, or the duration of the file. */
  get seconds() {
    return this._stream ? (performance.now() - this._started) / 1000 : this._duration;
  }

  /** The bars that are drawn now, from 0 to 1. For tests and for an inspector. */
  get bars() {
    return this._stream ? [...this._levels] : [...(this._peaks || [])];
  }

  connectedCallback() {
    super.connectedCallback();
    this._resize = new ResizeObserver(() => this._draw());
    if (this._stream) queueMicrotask(() => this._startLive());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopLive();
    if (this._resize) this._resize.disconnect();
    if (this._playFrame) cancelAnimationFrame(this._playFrame);
    // An audio that this element made stops with it. An audio of the page is the page's to stop.
    if (this._ownAudio && this._audio) this._audio.pause();
  }

  render() {
    if (!this._canvas) {
      this.classList.add('cup-audio-wave');
      this._button = document.createElement('button');
      this._button.type = 'button';
      this._button.className = 'cup-audio-wave___play';
      this._button.addEventListener('click', () => this._toggle());
      this._canvas = document.createElement('canvas');
      this._canvas.className = 'cup-audio-wave___canvas';
      // A tap on the waveform of a file moves the audio to that place.
      this._canvas.addEventListener('click', (event) => {
        const audio = this._audio;
        const length = this._length();
        if (!audio || !length || this._stream) return;
        const box = this._canvas.getBoundingClientRect();
        audio.currentTime = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)) * length;
      });
      this._time = document.createElement('span');
      this._time.className = 'cup-audio-wave___time';
      this._time.setAttribute('aria-live', 'off');
      this.replaceChildren(this._button, this._canvas, this._time);
      this._resize.observe(this._canvas);
    }
    this.setAttribute('role', 'img');
    this.setAttribute('aria-label', this.attr('label') || (this._stream ? 'Recording' : 'Audio'));
    this._button.hidden = !this.bool('controls') || !!this._stream;
    this._showPlay(false);
    const src = this.attr('src');
    if (src && src !== this._loaded) this._load(src);
    this._draw();
  }

  // ── Live ──────────────────────────────────────────────────────────
  _startLive() {
    const Context = window.AudioContext || window.webkitAudioContext;
    this._context = new Context();
    this._context.resume().catch(() => {});
    const analyser = this._context.createAnalyser();
    analyser.fftSize = 1024;
    this._context.createMediaStreamSource(this._stream).connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    this._levels = [];
    this._started = performance.now();
    // One bar for each step of time. A browser can call the timer less often (a hidden page, a slow phone), so each
    // call adds the bars of all the steps that passed: the bars move at the same speed at any rate of calls.
    let next = this._started + LIVE_STEP_MS;
    this._timer = setInterval(() => {
      if (!this._stream) return;
      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (const value of data) sum += value * value;
      // The loudness of the last moment: speech is near 0.05 to 0.3, so the root of the RMS spreads it on the bar.
      const level = Math.min(1, Math.sqrt(Math.sqrt(sum / data.length)) * 1.6);
      const now = performance.now();
      for (let added = 0; now >= next && added < 50; added++, next += LIVE_STEP_MS) this._levels.push(level);
      if (now >= next) next = now + LIVE_STEP_MS;
      if (this._levels.length > 400) this._levels.splice(0, this._levels.length - 400);
      this._time.textContent = clock(this.seconds);
      if (!this._frame) this._frame = requestAnimationFrame(() => { this._frame = null; this._draw(); });
    }, LIVE_STEP_MS);
    this._time.textContent = clock(0);
    this.render();
  }

  _stopLive() {
    clearInterval(this._timer);
    this._timer = null;
    if (this._frame) cancelAnimationFrame(this._frame);
    this._frame = null;
    if (this._context) this._context.close().catch(() => {});
    this._context = null;
  }

  // ── File ──────────────────────────────────────────────────────────
  async _load(src) {
    this._loaded = src;
    try {
      const bytes = await (await fetch(src)).arrayBuffer();
      const Context = window.AudioContext || window.webkitAudioContext;
      const context = new Context();
      const audio = await context.decodeAudioData(bytes);
      context.close().catch(() => {});
      if (this._loaded !== src) return;
      this._duration = audio.duration;
      this._peaks = peaksOf(audio.getChannelData(0), 120);
      this._showTime();
      this.dispatchEvent(new CustomEvent('cup-audio-wave-ready', { bubbles: true, detail: { duration: this._duration } }));
    } catch (error) {
      this._peaks = [];
      this._time.textContent = '';
      this.dispatchEvent(new CustomEvent('cup-audio-wave-error', { bubbles: true, detail: { reason: String(error) } }));
    }
    this._draw();
  }

  _toggle() {
    const src = this.attr('src');
    if (!src) return;
    if (!this._audio) {
      this._audio = new Audio(src);
      this.audio = new Audio(src);
      this._ownAudio = true;
    }
    if (this._audio.paused) this._audio.play().catch(() => {});
    else this._audio.pause();
  }

  /** While the audio plays, draw the progress at the rate of the screen. */
  _follow() {
    const tick = () => {
      if (!this._audio || this._audio.paused) return;
      this._showTime();
      this._draw();
      this._playFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  /** How long the audio is: its duration, or while it still comes (a stream), the end of what is there, or of the file. */
  _length() {
    const audio = this._audio;
    if (audio && isFinite(audio.duration) && audio.duration > 0) return audio.duration;
    if (audio && audio.buffered && audio.buffered.length) return audio.buffered.end(audio.buffered.length - 1);
    return this._duration;
  }

  /** The time: of the file, or with a followed audio that has started, "where / how long". */
  _showTime() {
    if (!this._time || this._stream) return;
    const audio = this._audio;
    const length = this._length();
    this._time.textContent = audio && (audio.currentTime > 0 || !audio.paused) ? `${clock(audio.currentTime)} / ${clock(length)}` : (length ? clock(length) : '');
  }

  _showPlay(playing) {
    if (!this._button) return;
    this._button.textContent = playing ? '❚❚' : '▶';
    this._button.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  // ── Drawing ───────────────────────────────────────────────────────
  _draw() {
    const canvas = this._canvas;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const pen = canvas.getContext('2d');
    pen.clearRect(0, 0, width, height);
    const style = getComputedStyle(this);
    const strong = style.getPropertyValue('--cup-color-primary').trim() || '#4a90d9';
    const soft = style.getPropertyValue('--cup-color-border').trim() || '#888';
    const bar = 3 * ratio;
    const gap = 2 * ratio;
    const fits = Math.max(1, Math.floor(width / (bar + gap)));
    let bars;
    let played = 1;
    if (this._stream) {
      // The newest bar is at the right. Before the first bars come, the line is flat.
      bars = this._levels.slice(-fits);
      bars = new Array(fits - bars.length).fill(0).concat(bars);
    } else {
      bars = this._spread(this._peaks || [], fits);
      const length = this._length();
      played = this._audio && length ? this._audio.currentTime / length : 0;
    }
    bars.forEach((level, index) => {
      const tall = Math.max(2 * ratio, level * height * 0.9);
      pen.fillStyle = this._stream || index / bars.length < played ? strong : soft;
      const x = index * (bar + gap);
      pen.beginPath();
      if (pen.roundRect) pen.roundRect(x, (height - tall) / 2, bar, tall, bar / 2);
      else pen.rect(x, (height - tall) / 2, bar, tall);
      pen.fill();
    });
  }

  /** The peaks, stretched or shrunk to `count` values, so a file fills the width at any size. */
  _spread(peaks, count) {
    if (peaks.length === 0) return new Array(count).fill(0);
    return Array.from({ length: count }, (_, index) => peaks[Math.min(peaks.length - 1, Math.floor((index / count) * peaks.length))]);
  }
}

customElements.define('cup-audio-wave', CupAudioWave);
export { CupAudioWave, peaksOf };
