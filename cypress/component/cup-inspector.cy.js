// Component tests for the cup-inspector module (no custom element; its exports are tested here)
import { buildSelector, createEntry, extractStyles, STYLE_GROUPS } from '../../components/cup-inspector.js';

describe('cup-inspector', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('builds a selector that names the element', () => {
    cy.mount('<div id="target" class="card-x">hi</div>');
    cy.get('#target').then(($el) => {
      expect(buildSelector($el[0])).to.be.a('string').and.to.contain('target');
    });
  });

  it('creates an entry with a selector for an element', () => {
    cy.mount('<div id="entry-me">hi</div>');
    cy.get('#entry-me').then(($el) => {
      const entry = createEntry($el[0]);
      expect(entry).to.be.an('object');
      expect(entry.selector).to.be.a('string');
    });
  });

  it('extracts computed styles and exposes the style groups', () => {
    cy.mount('<div id="styled" style="color: rgb(1, 2, 3)">hi</div>');
    cy.get('#styled').then(($el) => {
      expect(extractStyles($el[0])).to.be.an('object');
      expect(STYLE_GROUPS).to.be.an('object');
    });
  });
});
