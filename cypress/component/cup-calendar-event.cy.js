// Component tests for <cup-calendar-event>
describe('cup-calendar-event', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('shows its label as a calendar event', () => {
    cy.mount('<cup-calendar-event label="Lunch" kind="event"></cup-calendar-event>');
    cy.get('cup-calendar-event .cup-cal-event').should('have.class', 'cup-cal-event--event').and('contain.text', 'Lunch');
  });

  it('uses the slot text when there is no label attribute', () => {
    cy.mount('<cup-calendar-event>Review</cup-calendar-event>');
    cy.get('cup-calendar-event .cup-cal-event').should('contain.text', 'Review');
  });

  it('is laid out horizontally when axis is h', () => {
    cy.mount('<cup-calendar-event label="H" axis="h"></cup-calendar-event>');
    cy.get('cup-calendar-event .cup-cal-event').should('exist');
  });
});
