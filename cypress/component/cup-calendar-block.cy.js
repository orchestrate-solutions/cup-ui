// Component tests for <cup-calendar-block>
describe('cup-calendar-block', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('shows its label as a calendar event pill', () => {
    cy.mount('<cup-calendar-block label="Standup" kind="event"></cup-calendar-block>');
    cy.get('cup-calendar-block .cup-cal-event').should('have.class', 'cup-cal-event--event').and('contain.text', 'Standup');
  });

  it('takes its tone and state as classes', () => {
    cy.mount('<cup-calendar-block label="Off" tone="warn" state="blocked"></cup-calendar-block>');
    cy.get('cup-calendar-block .cup-cal-event').should('have.class', 'cup-cal-event--warn').and('have.class', 'cup-cal-event--blocked');
  });

  it('hides the pill when hidden', () => {
    cy.mount('<cup-calendar-block label="Gone" hidden></cup-calendar-block>');
    cy.get('cup-calendar-block .cup-cal-event').should('have.class', 'cup-cal-event--hidden');
  });
});
