// E2E tests for CSS effects, StyleTap, and CupElement lifecycle hooks
describe('Effects, StyleTap & Lifecycle Hooks', () => {
  beforeEach(() => {
    cy.visit('/docs/index.html');
    cy.get('#main', { timeout: 10000 }).should('not.be.empty');
  });

  // ── Effects ─────────────────────────────────────────────────
  describe('Effects Section', () => {
    it('renders effects section in playground', () => {
      cy.get('#effects').should('exist');
    });

    it('effects cards have data-effect attributes', () => {
      cy.get('#effects-demo [data-effect="fade-in"]').should('exist');
      cy.get('#effects-demo [data-effect="slide-up"]').should('exist');
      cy.get('#effects-demo [data-effect="scale-in"]').should('exist');
    });

    it('replay button re-triggers animations', () => {
      cy.get('#effect-replay-btn').click();
      // After replay, effects should still be present
      cy.get('#effects-demo [data-effect="fade-in"]').should('exist');
    });

    it('pulse button applies pulse effect temporarily', () => {
      cy.get('#effect-pulse-btn').click();
      cy.get('#effect-pulse-btn').should('have.attr', 'data-effect', 'pulse');
      // Pulse is removed after 2s
      cy.get('#effect-pulse-btn', { timeout: 3000 }).should('not.have.attr', 'data-effect');
    });

    it('shake button applies shake effect and removes on animationend', () => {
      cy.get('#effect-shake-btn').click();
      cy.get('#effect-shake-btn').should('have.attr', 'data-effect', 'shake');
      // Shake effect removed after animation completes (~400ms)
      cy.get('#effect-shake-btn', { timeout: 1000 }).should('not.have.attr', 'data-effect');
    });
  });

  // ── Style Inspector ─────────────────────────────────────────
  describe('Style Inspector', () => {
    it('renders style inspector section', () => {
      cy.get('#style-inspector').should('exist');
    });

    it('has inspect toggle and console log buttons', () => {
      cy.get('#style-inspect-toggle').should('contain.text', 'Enable Inspect Mode');
      cy.get('#style-inspect-console').should('contain.text', 'Log All to Console');
    });

    it('toggles inspect mode on/off', () => {
      cy.get('#style-inspect-toggle').click();
      cy.get('#style-inspect-toggle').should('contain.text', 'Disable Inspect Mode');
      cy.get('#style-inspect-toggle').click();
      cy.get('#style-inspect-toggle').should('contain.text', 'Enable Inspect Mode');
    });

    it('inspect mode changes cursor to crosshair', () => {
      cy.get('#style-inspect-toggle').click();
      cy.get('body').should('have.css', 'cursor', 'crosshair');
      cy.get('#style-inspect-toggle').click();
      cy.get('body').should('not.have.css', 'cursor', 'crosshair');
    });

    it('clicking a cup element in inspect mode shows report', () => {
      cy.get('#style-inspect-toggle').click();
      // Click a button in the button demo section
      cy.get('#button .cup-button').first().click();
      cy.get('#style-inspect-output').invoke('text').should('include', 'cup-button');
      // Disable inspect mode
      cy.get('#style-inspect-toggle').click();
    });

    it('log all button populates output with element count', () => {
      cy.get('#style-inspect-console').click();
      cy.get('#style-inspect-output').invoke('text').should('include', 'elements');
    });
  });

  // ── Navigation ──────────────────────────────────────────────
  describe('New Nav Links', () => {
    it('effects nav link exists', () => {
      cy.get('a[data-section="effects"]').should('exist');
      cy.get('a[data-section="effects"]').should('contain.text', 'Effects');
    });

    it('style inspector nav link exists', () => {
      cy.get('a[data-section="style-inspector"]').should('exist');
      cy.get('a[data-section="style-inspector"]').should('contain.text', 'Style Inspector');
    });

    it('clicking effects nav scrolls to section', () => {
      cy.get('a[data-section="effects"]').click();
      cy.get('#effects').should('be.visible');
    });
  });
});
