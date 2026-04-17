// Cypress E2E support file
// Shared commands and utilities for cup-ui component testing

/**
 * Mount a cup-ui component by injecting it into the harness page.
 * Usage: cy.mount('<cup-field label="Name"></cup-field>')
 */
Cypress.Commands.add('mount', (html) => {
  cy.get('#mount').then(($el) => {
    $el[0].innerHTML = html;
  });
  // Wait for queueMicrotask renders to complete
  cy.wait(0);
});

/**
 * Assert an element has a specific attribute value.
 */
Cypress.Commands.add('shouldHaveAttr', { prevSubject: true }, (subject, attr, value) => {
  if (value === undefined) {
    cy.wrap(subject).should('have.attr', attr);
  } else {
    cy.wrap(subject).should('have.attr', attr, value);
  }
});
