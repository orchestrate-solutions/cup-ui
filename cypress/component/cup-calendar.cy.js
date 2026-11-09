// Component tests for <cup-calendar>
describe('cup-calendar', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders a calendar host with the default view', () => {
    cy.mount('<cup-calendar></cup-calendar>');
    cy.get('cup-calendar').should('have.class', 'cup-calendar-host');
  });

  it('renders the rows of its data', () => {
    cy.mount('<cup-calendar></cup-calendar>');
    cy.get('cup-calendar').then(($c) => {
      $c[0].data = {
        rows: [{ id: 'p1', title: 'Ana' }, { id: 'p2', title: 'Ben' }],
        events: [],
      };
    });
    cy.get('cup-calendar').should('contain.text', 'Ana').and('contain.text', 'Ben');
  });
});
