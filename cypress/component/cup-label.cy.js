// Component tests for <cup-label>
describe('cup-label', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders label text from slotted content', () => {
    cy.mount('<cup-label>Username</cup-label>');
    cy.get('cup-label label.cup-label').should('contain.text', 'Username');
  });

  it('applies for attribute', () => {
    cy.mount('<cup-label for="email-input">Email</cup-label>');
    cy.get('cup-label label.cup-label').should('have.attr', 'for', 'email-input');
  });

  it('shows required marker when required', () => {
    cy.mount('<cup-label required>Name</cup-label>');
    cy.get('cup-label label.cup-label').should('have.attr', 'data-required');
    cy.get('cup-label label.cup-label span[aria-hidden="true"]').should('contain.text', '*');
  });

  it('does not show required marker when not required', () => {
    cy.mount('<cup-label>Name</cup-label>');
    cy.get('cup-label label.cup-label').should('not.have.attr', 'data-required');
    cy.get('cup-label label span[aria-hidden="true"]').should('not.exist');
  });
});
