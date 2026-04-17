// Component tests for <cup-file>
describe('cup-file', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders label and file input', () => {
    cy.mount('<cup-file label="Upload"></cup-file>');
    cy.get('cup-file label.cup-label').should('contain.text', 'Upload');
    cy.get('cup-file input.cup-input').should('have.attr', 'type', 'file');
  });

  it('applies accept attribute', () => {
    cy.mount('<cup-file label="Image" accept="image/*"></cup-file>');
    cy.get('cup-file input.cup-input').should('have.attr', 'accept', 'image/*');
  });

  it('applies multiple attribute', () => {
    cy.mount('<cup-file label="Files" multiple></cup-file>');
    cy.get('cup-file input.cup-input').should('have.attr', 'multiple');
  });

  it('renders required state', () => {
    cy.mount('<cup-file label="Document" required></cup-file>');
    cy.get('cup-file label.cup-label span[aria-hidden="true"]').should('contain.text', '*');
    cy.get('cup-file input.cup-input').should('have.attr', 'aria-required', 'true');
  });

  it('renders error state', () => {
    cy.mount('<cup-file label="Upload" error="File too large"></cup-file>');
    cy.get('cup-file').should('have.attr', 'data-state', 'error');
    cy.get('cup-file .cup-error[role="alert"]').should('contain.text', 'File too large');
  });

  it('renders hint', () => {
    cy.mount('<cup-file label="Upload" hint="Max 5MB"></cup-file>');
    cy.get('cup-file .cup-hint').should('contain.text', 'Max 5MB');
  });

  it('applies disabled', () => {
    cy.mount('<cup-file label="Upload" disabled></cup-file>');
    cy.get('cup-file input.cup-input').should('be.disabled');
  });
});
