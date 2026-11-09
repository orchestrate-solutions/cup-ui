// Component tests for <cup-agent-chat>
describe('cup-agent-chat', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('shows the empty text before there are entries', () => {
    cy.mount('<cup-agent-chat empty-text="Nothing yet"></cup-agent-chat>');
    cy.get('cup-agent-chat .cup-agent-chat___empty').should('have.text', 'Nothing yet');
  });

  it('shows a posted message as a user bubble', () => {
    cy.mount('<cup-agent-chat></cup-agent-chat>');
    cy.get('cup-agent-chat').then(($c) => $c[0].post('hello there'));
    cy.get('cup-agent-chat .cup-agent-chat___bubble--user').should('have.text', 'hello there');
  });

  it('uses the placeholder for its composer', () => {
    cy.mount('<cup-agent-chat placeholder="Ask anything"></cup-agent-chat>');
    cy.get('cup-agent-chat textarea, cup-agent-chat input').first().should('have.attr', 'placeholder', 'Ask anything');
  });
});
