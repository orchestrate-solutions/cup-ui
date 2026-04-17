// Component tests for <cup-badge>
describe('cup-badge', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders badge with slotted text', () => {
    cy.mount('<cup-badge>New</cup-badge>');
    cy.get('cup-badge .cup-badge').should('contain.text', 'New');
  });

  it('prefers label attribute over slotted text', () => {
    cy.mount('<cup-badge label="Hot">Old text</cup-badge>');
    cy.get('cup-badge .cup-badge').should('contain.text', 'Hot');
  });

  it('applies default variant class', () => {
    cy.mount('<cup-badge>Info</cup-badge>');
    cy.get('cup-badge .cup-badge').should('have.class', 'cup-badge--default');
  });

  it('applies custom variant class', () => {
    cy.mount('<cup-badge variant="success">Done</cup-badge>');
    cy.get('cup-badge .cup-badge').should('have.class', 'cup-badge--success');
  });

  it('applies error variant', () => {
    cy.mount('<cup-badge variant="error">Failed</cup-badge>');
    cy.get('cup-badge .cup-badge').should('have.class', 'cup-badge--error');
  });
});
