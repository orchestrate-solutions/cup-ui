// Component tests for <cup-skeleton>
describe('cup-skeleton', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders text variant by default', () => {
    cy.mount('<cup-skeleton></cup-skeleton>');
    cy.get('cup-skeleton').shadow().find('.cup-skeleton').should('have.attr', 'data-variant', 'text');
  });

  it('renders circle variant', () => {
    cy.mount('<cup-skeleton variant="circle"></cup-skeleton>');
    cy.get('cup-skeleton').shadow().find('.cup-skeleton').should('have.attr', 'data-variant', 'circle');
  });

  it('renders rect variant', () => {
    cy.mount('<cup-skeleton variant="rect"></cup-skeleton>');
    cy.get('cup-skeleton').shadow().find('.cup-skeleton').should('have.attr', 'data-variant', 'rect');
  });

  it('applies custom width and height', () => {
    cy.mount('<cup-skeleton width="200px" height="50px"></cup-skeleton>');
    cy.get('cup-skeleton').shadow().find('.cup-skeleton').should(($el) => {
      expect($el[0].style.width).to.eq('200px');
      expect($el[0].style.height).to.eq('50px');
    });
  });
});
