// Component tests for <cup-button>
describe('cup-button', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders primary button by default', () => {
    cy.mount('<cup-button>Click Me</cup-button>');
    cy.get('cup-button button.cup-button').should('contain.text', 'Click Me');
    cy.get('cup-button button.cup-button').should('have.class', 'cup-button--primary');
  });

  it('applies variant class', () => {
    cy.mount('<cup-button variant="ghost">Ghost</cup-button>');
    cy.get('cup-button button.cup-button').should('have.class', 'cup-button--ghost');
  });

  it('applies size class', () => {
    cy.mount('<cup-button size="sm">Small</cup-button>');
    cy.get('cup-button button.cup-button').should('have.class', 'cup-button--sm');
  });

  it('sets disabled attribute', () => {
    cy.mount('<cup-button disabled>Disabled</cup-button>');
    cy.get('cup-button button.cup-button').should('be.disabled');
  });

  it('sets loading state (disabled + data-loading)', () => {
    cy.mount('<cup-button loading>Loading</cup-button>');
    cy.get('cup-button button.cup-button').should('be.disabled');
    cy.get('cup-button button.cup-button').should('have.attr', 'data-loading');
  });

  it('defaults to type="button"', () => {
    cy.mount('<cup-button>Btn</cup-button>');
    cy.get('cup-button button.cup-button').should('have.attr', 'type', 'button');
  });

  it('accepts type="submit"', () => {
    cy.mount('<cup-button type="submit">Submit</cup-button>');
    cy.get('cup-button button.cup-button').should('have.attr', 'type', 'submit');
  });

  it('is clickable', () => {
    cy.mount('<cup-button>Click</cup-button>');
    cy.get('cup-button button.cup-button').click();
    // No error means click works (no event assertion needed for basic click)
  });
});
