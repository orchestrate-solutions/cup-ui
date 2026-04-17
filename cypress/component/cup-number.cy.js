// Component tests for <cup-number>
describe('cup-number', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders label and number input', () => {
    cy.mount('<cup-number label="Quantity" placeholder="0"></cup-number>');
    cy.get('cup-number label.cup-label').should('contain.text', 'Quantity');
    cy.get('cup-number input.cup-input').should('have.attr', 'type', 'number');
    cy.get('cup-number input.cup-input').should('have.attr', 'placeholder', '0');
  });

  it('applies min, max, step constraints', () => {
    cy.mount('<cup-number label="Qty" min="0" max="100" step="5"></cup-number>');
    cy.get('cup-number input.cup-input').should('have.attr', 'min', '0');
    cy.get('cup-number input.cup-input').should('have.attr', 'max', '100');
    cy.get('cup-number input.cup-input').should('have.attr', 'step', '5');
  });

  it('applies value', () => {
    cy.mount('<cup-number label="Qty" value="42"></cup-number>');
    cy.get('cup-number input.cup-input').should('have.value', '42');
  });

  it('renders required state', () => {
    cy.mount('<cup-number label="Qty" required></cup-number>');
    cy.get('cup-number label.cup-label span[aria-hidden="true"]').should('contain.text', '*');
    cy.get('cup-number input.cup-input').should('have.attr', 'aria-required', 'true');
  });

  it('renders error state', () => {
    cy.mount('<cup-number label="Qty" error="Must be positive"></cup-number>');
    cy.get('cup-number').should('have.attr', 'data-state', 'error');
    cy.get('cup-number .cup-error[role="alert"]').should('contain.text', 'Must be positive');
  });

  it('renders hint', () => {
    cy.mount('<cup-number label="Age" hint="Must be 18+"></cup-number>');
    cy.get('cup-number .cup-hint').should('contain.text', 'Must be 18+');
  });

  it('applies disabled', () => {
    cy.mount('<cup-number label="Qty" disabled></cup-number>');
    cy.get('cup-number input.cup-input').should('be.disabled');
  });

  it('accepts numeric input', () => {
    cy.mount('<cup-number label="Qty"></cup-number>');
    cy.get('cup-number input.cup-input').type('25');
    cy.get('cup-number input.cup-input').should('have.value', '25');
  });
});
