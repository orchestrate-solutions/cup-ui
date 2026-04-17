// Component tests for <cup-chip>
describe('cup-chip', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders chip with label attribute', () => {
    cy.mount('<cup-chip label="JavaScript"></cup-chip>');
    cy.get('cup-chip .cup-chip').should('contain.text', 'JavaScript');
  });

  it('renders chip with slotted text', () => {
    cy.mount('<cup-chip>Python</cup-chip>');
    cy.get('cup-chip .cup-chip').should('contain.text', 'Python');
  });

  it('does not show remove button by default', () => {
    cy.mount('<cup-chip label="Tag"></cup-chip>');
    cy.get('cup-chip .cup-chip___remove').should('not.exist');
  });

  it('shows remove button when removable', () => {
    cy.mount('<cup-chip label="Tag" removable></cup-chip>');
    cy.get('cup-chip .cup-chip___remove').should('exist');
    cy.get('cup-chip .cup-chip___remove').should('have.attr', 'aria-label', 'Remove Tag');
  });

  it('fires remove event and removes self on click', () => {
    cy.mount('<cup-chip label="Removable" removable></cup-chip>');
    cy.document().then((doc) => {
      const handler = cy.stub().as('removeHandler');
      doc.querySelector('#mount').addEventListener('remove', handler);
    });
    cy.get('cup-chip .cup-chip___remove').click();
    cy.get('@removeHandler').should('have.been.calledOnce');
    cy.get('cup-chip').should('not.exist');
  });

  it('remove event contains label in detail', () => {
    cy.mount('<cup-chip label="React" removable></cup-chip>');
    cy.document().then((doc) => {
      const handler = cy.stub().as('removeHandler');
      doc.querySelector('#mount').addEventListener('remove', handler);
    });
    cy.get('cup-chip .cup-chip___remove').click();
    cy.get('@removeHandler').should('have.been.calledOnce').then(() => {
      const call = cy.get('@removeHandler').invoke('getCall', 0);
      call.its('args.0.detail.label').should('eq', 'React');
    });
  });
});
