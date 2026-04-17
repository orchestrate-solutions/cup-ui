// Component tests for <cup-checkbox>
describe('cup-checkbox', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders label and checkbox input', () => {
    cy.mount('<cup-checkbox label="Agree to terms"></cup-checkbox>');
    cy.get('cup-checkbox label.cup-checkbox').should('contain.text', 'Agree to terms');
    cy.get('cup-checkbox input[type="checkbox"]').should('exist');
  });

  it('starts unchecked by default', () => {
    cy.mount('<cup-checkbox label="Opt in"></cup-checkbox>');
    cy.get('cup-checkbox input[type="checkbox"]').should('not.be.checked');
  });

  it('starts checked when checked attribute set', () => {
    cy.mount('<cup-checkbox label="Opt in" checked></cup-checkbox>');
    cy.get('cup-checkbox input[type="checkbox"]').should('be.checked');
  });

  it('toggles on click', () => {
    cy.mount('<cup-checkbox label="Toggle me"></cup-checkbox>');
    cy.get('cup-checkbox input[type="checkbox"]').check();
    cy.get('cup-checkbox input[type="checkbox"]').should('be.checked');
    cy.get('cup-checkbox input[type="checkbox"]').uncheck();
    cy.get('cup-checkbox input[type="checkbox"]').should('not.be.checked');
  });

  it('applies disabled state', () => {
    cy.mount('<cup-checkbox label="Locked" disabled></cup-checkbox>');
    cy.get('cup-checkbox input[type="checkbox"]').should('be.disabled');
  });

  it('applies name and value', () => {
    cy.mount('<cup-checkbox label="Accept" name="terms" value="yes"></cup-checkbox>');
    cy.get('cup-checkbox input[type="checkbox"]').should('have.attr', 'name', 'terms');
    cy.get('cup-checkbox input[type="checkbox"]').should('have.attr', 'value', 'yes');
  });

  it('renders error message when error attribute set', () => {
    cy.mount('<cup-checkbox label="Agree" error="Consent is required"></cup-checkbox>');
    cy.get('cup-checkbox .cup-error').should('contain.text', 'Consent is required');
    cy.get('cup-checkbox .cup-error').should('have.attr', 'role', 'alert');
  });

  it('sets data-state=error when error attribute set', () => {
    cy.mount('<cup-checkbox label="Agree" error="Required"></cup-checkbox>');
    cy.get('cup-checkbox').should('have.attr', 'data-state', 'error');
  });

  it('sets aria-invalid on input when error attribute set', () => {
    cy.mount('<cup-checkbox label="Agree" error="Required"></cup-checkbox>');
    cy.get('cup-checkbox input[type="checkbox"]').should('have.attr', 'aria-invalid', 'true');
  });

  it('removes error when error attribute cleared', () => {
    cy.mount('<cup-checkbox label="Agree" error="Required"></cup-checkbox>');
    cy.get('cup-checkbox .cup-error').should('exist');
    cy.get('cup-checkbox').then(($el) => $el[0].removeAttribute('error'));
    cy.get('cup-checkbox .cup-error').should('not.exist');
    cy.get('cup-checkbox').should('not.have.attr', 'data-state');
  });

  it('renders hint when hint attribute set', () => {
    cy.mount('<cup-checkbox label="Agree" hint="You must check this"></cup-checkbox>');
    cy.get('cup-checkbox .cup-hint').should('contain.text', 'You must check this');
  });

  it('sets aria-required when required attribute set', () => {
    cy.mount('<cup-checkbox label="Agree" required></cup-checkbox>');
    cy.get('cup-checkbox input[type="checkbox"]').should('have.attr', 'aria-required', 'true');
  });

  it('sets data-required when required attribute set', () => {
    cy.mount('<cup-checkbox label="Agree" required></cup-checkbox>');
    cy.get('cup-checkbox').should('have.attr', 'data-required');
  });


  it('renders required * marker on label when required', () => {
    cy.mount('<cup-checkbox label="Agree" required></cup-checkbox>');
    cy.get('cup-checkbox .cup-checkbox span[aria-hidden="true"]').should('contain.text', '*');
  });

  it('error message has no warning prefix', () => {
    cy.mount('<cup-checkbox label="Agree" error="Required"></cup-checkbox>');
    cy.get('cup-checkbox .cup-error').then(($el) => {
      const before = window.getComputedStyle($el[0], '::before');
      expect(before.content).to.be.oneOf(['none', '""', 'normal']);
    });
  });
});
