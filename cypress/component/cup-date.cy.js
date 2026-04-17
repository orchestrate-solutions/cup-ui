// Component tests for <cup-date>
describe('cup-date', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders label and date input', () => {
    cy.mount('<cup-date label="Birthday"></cup-date>');
    cy.get('cup-date label.cup-label').should('contain.text', 'Birthday');
    cy.get('cup-date input.cup-input').should('have.attr', 'type', 'date');
  });

  it('applies min and max constraints', () => {
    cy.mount('<cup-date label="Event" min="2024-01-01" max="2024-12-31"></cup-date>');
    cy.get('cup-date input.cup-input').should('have.attr', 'min', '2024-01-01');
    cy.get('cup-date input.cup-input').should('have.attr', 'max', '2024-12-31');
  });

  it('applies value', () => {
    cy.mount('<cup-date label="Start" value="2024-06-15"></cup-date>');
    cy.get('cup-date input.cup-input').should('have.value', '2024-06-15');
  });

  it('renders required state', () => {
    cy.mount('<cup-date label="Date" required></cup-date>');
    cy.get('cup-date label.cup-label span[aria-hidden="true"]').should('contain.text', '*');
    cy.get('cup-date input.cup-input').should('have.attr', 'aria-required', 'true');
  });

  it('renders error state', () => {
    cy.mount('<cup-date label="Date" error="Invalid date"></cup-date>');
    cy.get('cup-date').should('have.attr', 'data-state', 'error');
    cy.get('cup-date .cup-error[role="alert"]').should('contain.text', 'Invalid date');
  });

  it('renders hint', () => {
    cy.mount('<cup-date label="Date" hint="YYYY-MM-DD format"></cup-date>');
    cy.get('cup-date .cup-hint').should('contain.text', 'YYYY-MM-DD format');
  });

  it('applies disabled', () => {
    cy.mount('<cup-date label="Date" disabled></cup-date>');
    cy.get('cup-date input.cup-input').should('be.disabled');
  });
});
