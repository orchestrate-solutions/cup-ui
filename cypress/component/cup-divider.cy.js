// Component tests for <cup-divider>
describe('cup-divider', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders horizontal separator by default', () => {
    cy.mount('<cup-divider></cup-divider>');
    cy.get('cup-divider hr.cup-divider').should('have.attr', 'role', 'separator');
    cy.get('cup-divider hr.cup-divider').should('not.have.attr', 'data-vertical');
    cy.get('cup-divider hr.cup-divider').should('not.have.attr', 'aria-orientation');
  });

  it('renders vertical separator', () => {
    cy.mount('<cup-divider vertical></cup-divider>');
    cy.get('cup-divider hr.cup-divider').should('have.attr', 'data-vertical');
    cy.get('cup-divider hr.cup-divider').should('have.attr', 'aria-orientation', 'vertical');
  });
});
