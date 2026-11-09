// Component tests for <cup-powered-by>
describe('cup-powered-by', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('links the organisation name to its href', () => {
    cy.mount('<cup-powered-by org="Acme" href="https://example.com"></cup-powered-by>');
    cy.get('cup-powered-by .cup-powered-by__link', { timeout: 5000 })
      .should('have.text', 'Acme')
      .and('have.attr', 'href', 'https://example.com')
      .and('have.attr', 'rel', 'noopener');
  });

  it('has a Solution control that is keyboard reachable', () => {
    cy.mount('<cup-powered-by></cup-powered-by>');
    cy.get('cup-powered-by .cup-powered-by__sol', { timeout: 5000 })
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'tabindex', '0');
  });
});
