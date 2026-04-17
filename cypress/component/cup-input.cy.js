// Component tests for <cup-input>
describe('cup-input', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders a text input by default', () => {
    cy.mount('<cup-input></cup-input>');
    cy.get('cup-input input.cup-input').should('have.attr', 'type', 'text');
  });

  it('applies type attribute', () => {
    cy.mount('<cup-input type="email"></cup-input>');
    cy.get('cup-input input.cup-input').should('have.attr', 'type', 'email');
  });

  it('applies placeholder', () => {
    cy.mount('<cup-input placeholder="Enter name"></cup-input>');
    cy.get('cup-input input.cup-input').should('have.attr', 'placeholder', 'Enter name');
  });

  it('applies disabled state', () => {
    cy.mount('<cup-input disabled></cup-input>');
    cy.get('cup-input input.cup-input').should('be.disabled');
  });

  it('applies readonly state', () => {
    cy.mount('<cup-input readonly></cup-input>');
    cy.get('cup-input input.cup-input').should('have.attr', 'readonly');
  });

  it('applies value attribute', () => {
    cy.mount('<cup-input value="hello"></cup-input>');
    cy.get('cup-input input.cup-input').should('have.value', 'hello');
  });

  it('applies name attribute', () => {
    cy.mount('<cup-input name="username"></cup-input>');
    cy.get('cup-input input.cup-input').should('have.attr', 'name', 'username');
  });

  it('sets aria-required when required', () => {
    cy.mount('<cup-input required></cup-input>');
    cy.get('cup-input input.cup-input').should('have.attr', 'aria-required', 'true');
  });

  it('accepts user input', () => {
    cy.mount('<cup-input></cup-input>');
    cy.get('cup-input input.cup-input').type('typed text');
    cy.get('cup-input input.cup-input').should('have.value', 'typed text');
  });
});
