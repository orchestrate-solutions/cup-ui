// Component tests for <cup-textarea>
describe('cup-textarea', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders label and textarea', () => {
    cy.mount('<cup-textarea label="Bio" placeholder="Tell us about yourself"></cup-textarea>');
    cy.get('cup-textarea label.cup-label').should('contain.text', 'Bio');
    cy.get('cup-textarea textarea.cup-input').should('have.attr', 'placeholder', 'Tell us about yourself');
  });

  it('defaults to 4 rows', () => {
    cy.mount('<cup-textarea label="Bio"></cup-textarea>');
    cy.get('cup-textarea textarea.cup-input').should('have.attr', 'rows', '4');
  });

  it('accepts custom rows', () => {
    cy.mount('<cup-textarea label="Bio" rows="8"></cup-textarea>');
    cy.get('cup-textarea textarea.cup-input').should('have.attr', 'rows', '8');
  });

  it('renders character counter with maxlength', () => {
    cy.mount('<cup-textarea label="Bio" maxlength="100"></cup-textarea>');
    cy.get('cup-textarea textarea.cup-input').should('have.attr', 'maxlength', '100');
    cy.get('cup-textarea .cup-char-count').should('contain.text', '0/100');
  });

  it('renders character counter with initial value', () => {
    cy.mount('<cup-textarea label="Bio" maxlength="100" value="hello"></cup-textarea>');
    cy.get('cup-textarea .cup-char-count').should('contain.text', '5/100');
  });

  it('renders required state', () => {
    cy.mount('<cup-textarea label="Bio" required></cup-textarea>');
    cy.get('cup-textarea').should('have.attr', 'data-required');
    cy.get('cup-textarea textarea.cup-input').should('have.attr', 'aria-required', 'true');
  });

  it('renders error state', () => {
    cy.mount('<cup-textarea label="Bio" error="Too long"></cup-textarea>');
    cy.get('cup-textarea').should('have.attr', 'data-state', 'error');
    cy.get('cup-textarea .cup-error[role="alert"]').should('contain.text', 'Too long');
  });

  it('renders hint', () => {
    cy.mount('<cup-textarea label="Bio" hint="Max 200 chars"></cup-textarea>');
    cy.get('cup-textarea .cup-hint').should('contain.text', 'Max 200 chars');
  });

  it('applies disabled and readonly', () => {
    cy.mount('<cup-textarea label="Bio" disabled readonly></cup-textarea>');
    cy.get('cup-textarea textarea.cup-input').should('be.disabled');
    cy.get('cup-textarea textarea.cup-input').should('have.attr', 'readonly');
  });

  it('accepts user input', () => {
    cy.mount('<cup-textarea label="Bio"></cup-textarea>');
    cy.get('cup-textarea textarea.cup-input').type('Hello world');
    cy.get('cup-textarea textarea.cup-input').should('have.value', 'Hello world');
  });
});
