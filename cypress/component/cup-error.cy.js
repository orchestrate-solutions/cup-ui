// Component tests for <cup-error>
describe('cup-error', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders error text with role="alert"', () => {
    cy.mount('<cup-error>Field is required</cup-error>');
    cy.get('cup-error .cup-error').should('contain.text', 'Field is required');
    cy.get('cup-error .cup-error').should('have.attr', 'role', 'alert');
  });

  it('generates id from for attribute', () => {
    cy.mount('<cup-error for="email">Invalid</cup-error>');
    cy.get('cup-error .cup-error').should('have.attr', 'id', 'email-error');
  });

  it('generates id from cupId when no for attribute', () => {
    cy.mount('<cup-error>Error</cup-error>');
    cy.get('cup-error .cup-error').then(($err) => {
      expect($err.attr('id')).to.match(/-error$/);
    });
  });

  it('does not render ⚠ prefix via CSS ::before', () => {
    cy.mount('<cup-error>Something went wrong</cup-error>');
    cy.get('cup-error .cup-error').then(($el) => {
      const before = window.getComputedStyle($el[0], '::before');
      expect(before.content).to.be.oneOf(['none', '""', 'normal']);
    });
  });
});
