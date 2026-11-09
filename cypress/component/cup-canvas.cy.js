// Component tests for <cup-canvas>
describe('cup-canvas', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders one drawing canvas with an accessible name', () => {
    cy.mount('<cup-canvas width="200" height="100"></cup-canvas>');
    cy.get('cup-canvas canvas').should('have.length', 1).and('have.attr', 'aria-label', 'Drawing canvas');
  });

  it('is dimmed and ignores the pointer when disabled', () => {
    cy.mount('<cup-canvas disabled></cup-canvas>');
    cy.get('cup-canvas canvas').should('have.css', 'opacity', '0.5').and('have.css', 'pointer-events', 'none');
  });

  it('is fully active when not disabled', () => {
    cy.mount('<cup-canvas></cup-canvas>');
    cy.get('cup-canvas canvas').should('have.css', 'opacity', '1').and('have.css', 'pointer-events', 'auto');
  });

  it('clear() and undo() run without a stroke', () => {
    cy.mount('<cup-canvas></cup-canvas>');
    cy.get('cup-canvas').then(($c) => {
      expect(() => { $c[0].clear(); $c[0].undo(); }).to.not.throw();
    });
  });
});
