// Component tests for the layer files. Old file names must still give the same styles.
const PAIRS = [
  ['/css/nano.css', '/css/layers/elements.css'],
  ['/css/micro.css', '/css/layers/components.css'],
  ['/css/components.css', '/css/layers/patterns.css'],
];

// Every .cup-* class name that a stylesheet mentions.
const classesIn = (css) => [...new Set((css.match(/\.cup-[a-z][a-z0-9_-]*/g) || []).map((c) => c.slice(1)))];

// Load a page with the tokens and the given stylesheet (or none), and return the computed style
// of one element per class. Each element is a plain <div> with that class.
const stylesWith = (sheet, classes) => new Promise((resolve, reject) => {
  const frame = document.createElement('iframe');
  frame.style.display = 'none';
  const links = [`<link rel="stylesheet" href="/tokens.css">`];
  if (sheet) links.push(`<link rel="stylesheet" href="${sheet}">`);
  const body = classes.map((c, i) => `<div id="e${i}" class="${c}"></div>`).join('');
  frame.onload = () => {
    try {
      const doc = frame.contentDocument;
      const out = classes.map((_, i) => {
        const cs = frame.contentWindow.getComputedStyle(doc.getElementById(`e${i}`));
        const props = {};
        for (let k = 0; k < cs.length; k++) props[cs[k]] = cs.getPropertyValue(cs[k]);
        return props;
      });
      frame.remove();
      resolve(out);
    } catch (error) {
      frame.remove();
      reject(error);
    }
  };
  frame.srcdoc = `<!doctype html><html><head>${links.join('')}</head><body>${body}</body></html>`;
  document.body.appendChild(frame);
});

describe('layer files', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('each old file imports its new file', () => {
    cy.request('/css/nano.css').its('body').should('contain', "@import './layers/elements.css';");
    cy.request('/css/micro.css').its('body').should('contain', "@import './layers/components.css';");
    cy.request('/css/components.css').its('body').should('contain', "@import './layers/patterns.css';");
  });

  it('the new layer files declare the new layer names', () => {
    cy.request('/css/layers/elements.css').its('body').should('contain', '@layer cup-elements {');
    cy.request('/css/layers/components.css').its('body').should('contain', '@layer cup-components {');
    cy.request('/css/layers/patterns.css').its('body').should('contain', '@layer cup-patterns {');
  });

  it('an old file name gives the same computed styles as its new file', () => {
    cy.wrap(null).then(async () => {
      for (const [oldSheet, newSheet] of PAIRS) {
        const css = await fetch(newSheet).then((r) => r.text());
        const classes = classesIn(css);
        expect(classes.length, `classes in ${newSheet}`).to.be.greaterThan(0);

        const bare = await stylesWith(null, classes);
        const oldStyles = await stylesWith(oldSheet, classes);
        const newStyles = await stylesWith(newSheet, classes);

        expect(oldStyles, `${oldSheet} vs ${newSheet}`).to.deep.equal(newStyles);
        // Sanity: the sheet changes something, so an equal result means the styles really loaded.
        expect(newStyles, `${newSheet} changes styles`).to.not.deep.equal(bare);
      }
    });
  });
});
