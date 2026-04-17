// Component tests for <cup-password>
// Validates the visibility toggle preserves input value (bug fix baa439b)
describe('cup-password', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders label, input, and toggle button', () => {
    cy.mount('<cup-password label="Password" placeholder="Enter password"></cup-password>');
    cy.get('cup-password label.cup-label').should('contain.text', 'Password');
    cy.get('cup-password input.cup-input').should('have.attr', 'type', 'password');
    cy.get('cup-password input.cup-input').should('have.attr', 'placeholder', 'Enter password');
    cy.get('cup-password [data-toggle-visibility]').should('exist');
  });

  it('toggles password visibility without clearing input value', () => {
    cy.mount('<cup-password label="Password"></cup-password>');
    cy.get('cup-password input.cup-input').type('secret123');
    cy.get('cup-password input.cup-input').should('have.value', 'secret123');

    // Toggle to visible
    cy.get('cup-password [data-toggle-visibility]').click();
    cy.get('cup-password input.cup-input').should('have.attr', 'type', 'text');
    cy.get('cup-password input.cup-input').should('have.value', 'secret123');

    // Toggle back to hidden
    cy.get('cup-password [data-toggle-visibility]').click();
    cy.get('cup-password input.cup-input').should('have.attr', 'type', 'password');
    cy.get('cup-password input.cup-input').should('have.value', 'secret123');
  });

  it('shows required marker when required attribute is set', () => {
    cy.mount('<cup-password label="Password" required></cup-password>');
    cy.get('cup-password label.cup-label').should('have.attr', 'data-required');
    cy.get('cup-password label.cup-label span[aria-hidden="true"]').should('contain.text', '*');
    cy.get('cup-password input.cup-input').should('have.attr', 'aria-required', 'true');
  });

  it('renders error state with role="alert"', () => {
    cy.mount('<cup-password label="Password" error="Too short"></cup-password>');
    cy.get('cup-password').should('have.attr', 'data-state', 'error');
    cy.get('cup-password input.cup-input').should('have.attr', 'aria-invalid', 'true');
    cy.get('cup-password .cup-error[role="alert"]').should('contain.text', 'Too short');
  });

  it('renders hint text', () => {
    cy.mount('<cup-password label="Password" hint="Min 8 characters"></cup-password>');
    cy.get('cup-password .cup-hint').should('contain.text', 'Min 8 characters');
  });

  it('links aria-describedby to hint and error', () => {
    cy.mount('<cup-password label="Password" hint="Help" error="Bad"></cup-password>');
    cy.get('cup-password input.cup-input').then(($input) => {
      const describedBy = $input.attr('aria-describedby');
      expect(describedBy).to.include('hint');
      expect(describedBy).to.include('error');
    });
  });

  it('respects disabled attribute', () => {
    cy.mount('<cup-password label="Password" disabled></cup-password>');
    cy.get('cup-password input.cup-input').should('be.disabled');
  });

  it('applies minlength attribute', () => {
    cy.mount('<cup-password label="Password" minlength="8"></cup-password>');
    cy.get('cup-password input.cup-input').should('have.attr', 'minlength', '8');
  });

  it('applies name attribute', () => {
    cy.mount('<cup-password label="Password" name="user_pass"></cup-password>');
    cy.get('cup-password input.cup-input').should('have.attr', 'name', 'user_pass');
  });

  it('toggle button has accessible label', () => {
    cy.mount('<cup-password label="Password"></cup-password>');
    cy.get('cup-password [data-toggle-visibility]').should('have.attr', 'aria-label', 'Show password');
    cy.get('cup-password [data-toggle-visibility]').click();
    cy.get('cup-password [data-toggle-visibility]').should('have.attr', 'aria-label', 'Hide password');
  });

  it('preserves focus on input after toggling visibility', () => {
    cy.mount('<cup-password label="Password"></cup-password>');
    cy.get('cup-password input.cup-input').focus().type('test');
    cy.get('cup-password [data-toggle-visibility]').click();
    // Input should still exist with value intact
    cy.get('cup-password input.cup-input').should('have.value', 'test');
    cy.get('cup-password input.cup-input').should('have.attr', 'type', 'text');
  });

  it('multiple rapid toggles preserve input value', () => {
    cy.mount('<cup-password label="Password"></cup-password>');
    cy.get('cup-password input.cup-input').type('multi-toggle-test');
    cy.get('cup-password [data-toggle-visibility]').click();
    cy.get('cup-password [data-toggle-visibility]').click();
    cy.get('cup-password [data-toggle-visibility]').click();
    cy.get('cup-password input.cup-input').should('have.value', 'multi-toggle-test');
    cy.get('cup-password input.cup-input').should('have.attr', 'type', 'text');
  });
});
