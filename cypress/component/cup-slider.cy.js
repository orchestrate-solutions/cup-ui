// Component tests for <cup-slider>
describe('cup-slider', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders a range input with its min, max and value', () => {
    cy.mount('<cup-slider label="Volume" min="0" max="10" value="4"></cup-slider>');
    cy.get('cup-slider input.cup-slider')
      .should('have.attr', 'type', 'range')
      .and('have.attr', 'min', '0')
      .and('have.attr', 'max', '10')
      .and('have.attr', 'value', '4');
  });

  it('shows the label text', () => {
    cy.mount('<cup-slider label="Volume"></cup-slider>');
    cy.get('cup-slider').should('contain.text', 'Volume');
  });

  it('marks an error state', () => {
    cy.mount('<cup-slider label="Level" error="Too low"></cup-slider>');
    cy.get('cup-slider').should('have.attr', 'data-state', 'error');
    cy.get('cup-slider').should('contain.text', 'Too low');
  });
});
