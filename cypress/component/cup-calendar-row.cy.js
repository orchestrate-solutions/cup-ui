// Component tests for <cup-calendar-row>
describe('cup-calendar-row', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('shows the name of the row from its data', () => {
    cy.mount('<cup-calendar-row></cup-calendar-row>');
    cy.get('cup-calendar-row').then(($r) => {
      $r[0].data = { row: { id: 'p1', title: 'Ana' }, slots: [] };
    });
    cy.get('cup-calendar-row .cup-calendar-row___name').should('have.text', 'Ana');
    cy.get('cup-calendar-row .cup-calendar-row___label').should('have.attr', 'data-resource-id', 'p1');
  });

  it('renders one slot cell per slot', () => {
    cy.mount('<cup-calendar-row></cup-calendar-row>');
    cy.get('cup-calendar-row').then(($r) => {
      $r[0].data = { row: { id: 'p2', title: 'Ben' }, slots: [{}, {}, {}] };
    });
    cy.get('cup-calendar-row .cup-calendar-row___slot').should('have.length', 3);
  });
});
