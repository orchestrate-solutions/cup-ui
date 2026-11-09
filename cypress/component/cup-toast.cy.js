// Component tests for <cup-toast>
describe('cup-toast', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('shows its message as a live status', () => {
    cy.mount('<cup-toast variant="success" duration="0">Saved</cup-toast>');
    cy.get('cup-toast').should('have.attr', 'role', 'status').and('have.attr', 'aria-live', 'polite');
    cy.get('cup-toast .cup-toast').should('have.class', 'cup-toast--success');
    cy.get('cup-toast .cup-toast___message').should('have.text', 'Saved');
  });

  it('has a dismiss button when dismissible', () => {
    cy.mount('<cup-toast duration="0" dismissible>Hi</cup-toast>');
    cy.get('cup-toast .cup-toast___close').should('have.attr', 'aria-label', 'Dismiss notification');
  });

  it('has no dismiss button when not dismissible', () => {
    cy.mount('<cup-toast duration="0">Hi</cup-toast>');
    cy.get('cup-toast .cup-toast___close').should('not.exist');
  });

  it('marks itself as dismissing when the close button is clicked', () => {
    cy.mount('<cup-toast duration="0" dismissible>Hi</cup-toast>');
    cy.get('cup-toast .cup-toast___close').click();
    cy.get('cup-toast .cup-toast').should('have.attr', 'data-dismissing');
  });
});
