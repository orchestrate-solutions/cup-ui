// Component tests for <cup-calendar-toolbar>
describe('cup-calendar-toolbar', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('shows the title', () => {
    cy.mount('<cup-calendar-toolbar title="Week 42"></cup-calendar-toolbar>');
    cy.get('cup-calendar-toolbar .cup-toolbar___title').should('have.text', 'Week 42');
  });

  it('marks the current view as pressed', () => {
    cy.mount('<cup-calendar-toolbar view="timeGridWeek"></cup-calendar-toolbar>');
    cy.get('cup-calendar-toolbar [data-view="timeGridWeek"]').should('have.attr', 'aria-pressed', 'true');
    cy.get('cup-calendar-toolbar [data-view="timeline"]').should('have.attr', 'aria-pressed', 'false');
  });

  it('has a button for each view in views', () => {
    cy.mount('<cup-calendar-toolbar views="timeGridDay,dayGridMonth"></cup-calendar-toolbar>');
    cy.get('cup-calendar-toolbar .cup-toolbar___view-btn').should('have.length', 2);
  });

  it('has Today, previous and next navigation buttons', () => {
    cy.mount('<cup-calendar-toolbar></cup-calendar-toolbar>');
    cy.get('cup-calendar-toolbar [data-action="today"]').should('exist');
    cy.get('cup-calendar-toolbar [data-action="prev"]').should('exist');
    cy.get('cup-calendar-toolbar [data-action="next"]').should('exist');
  });
});
