// Component tests for <cup-field>
describe('cup-field', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders label and text input', () => {
    cy.mount('<cup-field label="Username" placeholder="Enter username"></cup-field>');
    cy.get('cup-field label.cup-label').should('contain.text', 'Username');
    cy.get('cup-field input.cup-input').should('have.attr', 'type', 'text');
    cy.get('cup-field input.cup-input').should('have.attr', 'placeholder', 'Enter username');
  });

  it('label for links to input id', () => {
    cy.mount('<cup-field label="Email"></cup-field>');
    cy.get('cup-field label.cup-label').then(($label) => {
      const forAttr = $label.attr('for');
      cy.get(`#${forAttr}`).should('exist');
    });
  });

  it('renders with custom type', () => {
    cy.mount('<cup-field label="Email" type="email"></cup-field>');
    cy.get('cup-field input.cup-input').should('have.attr', 'type', 'email');
  });

  it('sets required state', () => {
    cy.mount('<cup-field label="Name" required></cup-field>');
    cy.get('cup-field').should('have.attr', 'data-required');
    cy.get('cup-field label span[aria-hidden="true"]').should('contain.text', '*');
    cy.get('cup-field input.cup-input').should('have.attr', 'aria-required', 'true');
  });

  it('renders error state', () => {
    cy.mount('<cup-field label="Email" error="Invalid email"></cup-field>');
    cy.get('cup-field').should('have.attr', 'data-state', 'error');
    cy.get('cup-field input.cup-input').should('have.attr', 'aria-invalid', 'true');
    cy.get('cup-field .cup-error[role="alert"]').should('contain.text', 'Invalid email');
  });

  it('renders hint text', () => {
    cy.mount('<cup-field label="Bio" hint="Keep it short"></cup-field>');
    cy.get('cup-field .cup-hint').should('contain.text', 'Keep it short');
  });

  it('applies disabled state', () => {
    cy.mount('<cup-field label="Locked" disabled></cup-field>');
    cy.get('cup-field').should('have.attr', 'data-state').and('include', 'disabled');
    cy.get('cup-field input.cup-input').should('be.disabled');
  });

  it('applies readonly state', () => {
    cy.mount('<cup-field label="Fixed" readonly value="constant"></cup-field>');
    cy.get('cup-field input.cup-input').should('have.attr', 'readonly');
  });

  it('applies value and name', () => {
    cy.mount('<cup-field label="City" value="Austin" name="city"></cup-field>');
    cy.get('cup-field input.cup-input').should('have.value', 'Austin');
    cy.get('cup-field input.cup-input').should('have.attr', 'name', 'city');
  });

  it('links aria-describedby to hint and error', () => {
    cy.mount('<cup-field label="Name" hint="Required" error="Missing"></cup-field>');
    cy.get('cup-field input.cup-input').then(($input) => {
      const describedBy = $input.attr('aria-describedby');
      expect(describedBy).to.include('hint');
      expect(describedBy).to.include('error');
    });
  });

  it('accepts user input', () => {
    cy.mount('<cup-field label="Name"></cup-field>');
    cy.get('cup-field input.cup-input').type('John Doe');
    cy.get('cup-field input.cup-input').should('have.value', 'John Doe');
  });
});
