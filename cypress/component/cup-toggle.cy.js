// Component tests for <cup-toggle>
describe('cup-toggle', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders toggle switch in shadow DOM', () => {
    cy.mount('<cup-toggle label="Dark mode"></cup-toggle>');
    cy.get('cup-toggle').shadow().find('button[role="switch"]').should('exist');
    cy.get('cup-toggle').shadow().find('span').should('contain.text', 'Dark mode');
  });

  it('starts unpressed by default', () => {
    cy.mount('<cup-toggle label="Feature"></cup-toggle>');
    cy.get('cup-toggle').shadow().find('button[role="switch"]').should('have.attr', 'aria-checked', 'false');
  });

  it('starts pressed when pressed attribute set', () => {
    cy.mount('<cup-toggle label="Feature" pressed></cup-toggle>');
    cy.get('cup-toggle').shadow().find('button[role="switch"]').should('have.attr', 'aria-checked', 'true');
  });

  it('toggles pressed state on click', () => {
    cy.mount('<cup-toggle label="Feature"></cup-toggle>');
    cy.get('cup-toggle').shadow().find('button[role="switch"]').click();
    cy.get('cup-toggle').should('have.attr', 'pressed');
    cy.get('cup-toggle').shadow().find('button[role="switch"]').should('have.attr', 'aria-checked', 'true');
  });

  it('fires change event on toggle', () => {
    cy.mount('<cup-toggle label="Feature"></cup-toggle>');
    cy.get('cup-toggle').then(($toggle) => {
      const handler = cy.stub().as('changeHandler');
      $toggle[0].addEventListener('change', handler);
    });
    cy.get('cup-toggle').shadow().find('button[role="switch"]').click();
    cy.get('@changeHandler').should('have.been.calledOnce');
  });

  it('does not toggle when disabled', () => {
    cy.mount('<cup-toggle label="Locked" disabled></cup-toggle>');
    cy.get('cup-toggle').shadow().find('button[role="switch"]').click({ force: true });
    cy.get('cup-toggle').should('not.have.attr', 'pressed');
  });

  it('applies aria-label from label attribute', () => {
    cy.mount('<cup-toggle label="Enable notifications"></cup-toggle>');
    cy.get('cup-toggle').shadow().find('button[role="switch"]').should('have.attr', 'aria-label', 'Enable notifications');
  });
});
