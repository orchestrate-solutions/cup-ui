// Component tests for <cup-hint>
describe('cup-hint', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders hint text from slotted content', () => {
    cy.mount('<cup-hint>Enter your email address</cup-hint>');
    cy.get('cup-hint .cup-hint').should('contain.text', 'Enter your email address');
  });

  it('generates id from for attribute', () => {
    cy.mount('<cup-hint for="email">Help text</cup-hint>');
    cy.get('cup-hint .cup-hint').should('have.attr', 'id', 'email-hint');
  });

  it('generates id from cupId when no for attribute', () => {
    cy.mount('<cup-hint>Fallback hint</cup-hint>');
    cy.get('cup-hint .cup-hint').then(($hint) => {
      expect($hint.attr('id')).to.match(/-hint$/);
    });
  });
});
