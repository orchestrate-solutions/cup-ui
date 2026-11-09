// Component tests for <cup-audio-wave>

/** A WAV of a sine wave: `seconds` long at 8000 samples a second, loud for the first half and quiet for the second. */
function sineWav(seconds) {
  const rate = 8000;
  const count = rate * seconds;
  const bytes = new DataView(new ArrayBuffer(44 + count * 2));
  const text = (at, value) => [...value].forEach((c, i) => bytes.setUint8(at + i, c.charCodeAt(0)));
  text(0, 'RIFF'); bytes.setUint32(4, 36 + count * 2, true); text(8, 'WAVE'); text(12, 'fmt ');
  bytes.setUint32(16, 16, true); bytes.setUint16(20, 1, true); bytes.setUint16(22, 1, true); bytes.setUint32(24, rate, true);
  bytes.setUint32(28, rate * 2, true); bytes.setUint16(32, 2, true); bytes.setUint16(34, 16, true); text(36, 'data'); bytes.setUint32(40, count * 2, true);
  for (let i = 0; i < count; i++) {
    const loud = i < count / 2 ? 0.8 : 0.1;
    bytes.setInt16(44 + i * 2, Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * loud * 32767), true);
  }
  return URL.createObjectURL(new Blob([bytes.buffer], { type: 'audio/wav' }));
}

describe('cup-audio-wave', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('draws the waveform of a WAV file, and shows its duration', () => {
    cy.window().then((win) => {
      const url = sineWav.call(win, 2);
      cy.mount(`<cup-audio-wave src="${url}" controls style="width:300px"></cup-audio-wave>`);
    });
    cy.get('cup-audio-wave .cup-audio-wave___time').should('have.text', '0:02');
    cy.get('cup-audio-wave canvas.cup-audio-wave___canvas').should('exist');
    cy.get('cup-audio-wave').then(($el) => {
      const bars = $el[0].bars;
      expect(bars.length).to.equal(120);
      // The first half is loud, and the second half is quiet.
      expect(bars[10]).to.be.greaterThan(0.9);
      expect(bars[100]).to.be.lessThan(0.2);
    });
    cy.get('cup-audio-wave .cup-audio-wave___play').should('be.visible').and('have.attr', 'aria-label', 'Play');
  });

  it('has no play button with no controls', () => {
    cy.window().then((win) => cy.mount(`<cup-audio-wave src="${sineWav.call(win, 1)}"></cup-audio-wave>`));
    cy.get('cup-audio-wave .cup-audio-wave___time').should('have.text', '0:01');
    cy.get('cup-audio-wave .cup-audio-wave___play').should('not.be.visible');
  });

  it('says so when the file is not audio', () => {
    cy.window().then((win) => {
      const url = URL.createObjectURL(new Blob(['not audio'], { type: 'text/plain' }));
      cy.mount(`<cup-audio-wave src="${url}"></cup-audio-wave>`);
      win.document.addEventListener('cup-audio-wave-error', () => { win.waveFailed = true; });
    });
    cy.window().its('waveFailed').should('equal', true);
  });

  it('shows a live stream: bars come from the right, and the time counts', () => {
    cy.mount('<cup-audio-wave label="Recording" style="width:300px"></cup-audio-wave>');
    cy.window().then((win) => {
      const context = new win.AudioContext();
      const tone = context.createOscillator();
      const out = context.createMediaStreamDestination();
      tone.connect(out);
      tone.start();
      win.document.querySelector('cup-audio-wave').stream = out.stream;
    });
    cy.wait(1300);
    cy.get('cup-audio-wave').then(($el) => {
      const bars = $el[0].bars;
      expect(bars.length).to.be.greaterThan(10);
      expect(Math.max(...bars)).to.be.greaterThan(0.3);
      expect($el[0].seconds).to.be.greaterThan(1);
    });
    cy.get('cup-audio-wave .cup-audio-wave___time').should('have.text', '0:01');
    cy.get('cup-audio-wave').should('have.attr', 'aria-label', 'Recording');
    cy.get('cup-audio-wave').then(($el) => { $el[0].stream = null; });
  });

  it('follows an audio element of the page: its place and length, and a tap on the waveform seeks it', () => {
    cy.window().then((win) => {
      win.waveUrl = sineWav.call(win, 4);
      win.document.getElementById('mount').innerHTML = `<cup-audio-wave src="${win.waveUrl}" style="width:400px"></cup-audio-wave>`;
    });
    cy.get('cup-audio-wave .cup-audio-wave___time').should('have.text', '0:04');
    cy.window().then((win) => new Promise((resolve) => {
      const audio = new win.Audio(win.waveUrl);
      win.followed = audio;
      audio.addEventListener('loadedmetadata', () => {
        win.document.querySelector('cup-audio-wave').audio = audio;
        audio.currentTime = 2.2;
        resolve();
      });
    }));
    cy.get('cup-audio-wave .cup-audio-wave___time').should('have.text', '0:02 / 0:04');
    // A tap at 100 px is at 100 / width of the canvas, of 4 seconds.
    cy.get('cup-audio-wave canvas').then(($canvas) => { $canvas[0].wanted = (100 / $canvas[0].getBoundingClientRect().width) * 4; });
    cy.get('cup-audio-wave canvas').click(100, 10);
    cy.get('cup-audio-wave canvas').then(($canvas) => {
      cy.window().its('followed.currentTime').should('be.closeTo', $canvas[0].wanted, 0.05);
    });
    cy.get('cup-audio-wave .cup-audio-wave___time').should('have.text', '0:01 / 0:04');
  });
});
