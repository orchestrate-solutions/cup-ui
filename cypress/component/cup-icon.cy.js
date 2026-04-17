// Component tests for <cup-icon>
describe('cup-icon', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders icon wrapper with aria-hidden when no label', () => {
    cy.mount('<cup-icon><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></cup-icon>');
    cy.get('cup-icon .cup-icon').should('have.attr', 'aria-hidden', 'true');
    cy.get('cup-icon .cup-icon svg').should('exist');
  });

  it('renders with role="img" and aria-label when label provided', () => {
    cy.mount('<cup-icon label="Settings">⚙</cup-icon>');
    cy.get('cup-icon .cup-icon').should('have.attr', 'role', 'img');
    cy.get('cup-icon .cup-icon').should('have.attr', 'aria-label', 'Settings');
  });

  it('applies data-size attribute', () => {
    cy.mount('<cup-icon size="lg">★</cup-icon>');
    cy.get('cup-icon .cup-icon').should('have.attr', 'data-size', 'lg');
  });
});
