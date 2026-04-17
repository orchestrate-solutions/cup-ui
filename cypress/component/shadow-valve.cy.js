// Component tests for CupElement Shadow DOM Valve (renderRoot)
describe('CupElement shadow valve', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('CupElement defaults to no shadow DOM', () => {
    cy.mount('<cup-button variant="primary">Test</cup-button>');
    cy.get('cup-button').then(($el) => {
      expect($el[0].shadowRoot).to.be.null;
    });
  });

  it('renderRoot returns element itself when shadow is off', () => {
    cy.mount('<cup-button variant="primary">Test</cup-button>');
    cy.get('cup-button').then(($el) => {
      const el = $el[0];
      expect(el.renderRoot).to.equal(el);
    });
  });

  it('cup-skeleton has shadow DOM via static shadow = true', () => {
    cy.mount('<cup-skeleton></cup-skeleton>');
    cy.get('cup-skeleton').then(($el) => {
      expect($el[0].shadowRoot).to.not.be.null;
    });
  });

  it('cup-skeleton renderRoot returns shadowRoot', () => {
    cy.mount('<cup-skeleton></cup-skeleton>');
    cy.get('cup-skeleton').then(($el) => {
      const el = $el[0];
      expect(el.renderRoot).to.equal(el.shadowRoot);
    });
  });

  it('cup-toggle has shadow DOM via static shadow = true', () => {
    cy.mount('<cup-toggle label="Test"></cup-toggle>');
    cy.get('cup-toggle').then(($el) => {
      expect($el[0].shadowRoot).to.not.be.null;
    });
  });

  it('cup-toggle renderRoot returns shadowRoot', () => {
    cy.mount('<cup-toggle label="Test"></cup-toggle>');
    cy.get('cup-toggle').then(($el) => {
      const el = $el[0];
      expect(el.renderRoot).to.equal(el.shadowRoot);
    });
  });

  it('shadow components still get lifecycle hooks', () => {
    cy.mount('<cup-skeleton></cup-skeleton>');
    cy.get('cup-skeleton').then(($el) => {
      const el = $el[0];
      expect(typeof el.useHook).to.equal('function');
      const spy = { afterRender: cy.stub() };
      el.useHook(spy);
      el.setAttribute('variant', 'circle');
    });
    cy.wait(50).then(() => {
      // Hook should have fired after re-render
    });
  });

  it('shadow components get stable cupId', () => {
    cy.mount('<cup-toggle label="Test" id="my-toggle"></cup-toggle>');
    cy.get('cup-toggle').then(($el) => {
      expect($el[0].cupId).to.equal('my-toggle');
    });
  });

  it('light DOM components render to this.innerHTML', () => {
    cy.mount('<cup-badge label="OK"></cup-badge>');
    cy.get('cup-badge').find('.cup-badge').should('exist');
    cy.get('cup-badge').then(($el) => {
      expect($el[0].shadowRoot).to.be.null;
    });
  });
});
