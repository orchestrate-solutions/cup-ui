// Component tests for <cup-progress>
describe('cup-progress', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('is a progressbar with the value and its percentage', () => {
    cy.mount('<cup-progress value="30" max="100" label="Upload"></cup-progress>');
    cy.get('cup-progress [role="progressbar"]')
      .should('have.attr', 'aria-valuenow', '30')
      .and('have.attr', 'aria-valuemax', '100');
    cy.get('cup-progress .cup-progress___value').should('have.text', '30%');
  });

  it('fills the bar to the percentage', () => {
    cy.mount('<cup-progress value="25" max="100"></cup-progress>');
    cy.get('cup-progress .cup-progress___fill').should('have.attr', 'style').and('contain', '25%');
  });

  it('is busy and has no value when indeterminate', () => {
    cy.mount('<cup-progress indeterminate></cup-progress>');
    cy.get('cup-progress [role="progressbar"]').should('have.attr', 'aria-busy', 'true');
    cy.get('cup-progress .cup-progress___value').should('not.exist');
  });

  it('keeps the value within 0 to 100 percent', () => {
    cy.mount('<cup-progress value="250" max="100" label="Done"></cup-progress>');
    cy.get('cup-progress .cup-progress___value').should('have.text', '100%');
  });
});
