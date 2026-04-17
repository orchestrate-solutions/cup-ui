// Component tests for <cup-select>
describe('cup-select', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders label and select element', () => {
    cy.mount('<cup-select label="Color" options=\'[{"value":"r","label":"Red"},{"value":"b","label":"Blue"}]\'></cup-select>');
    cy.get('cup-select label.cup-label').should('contain.text', 'Color');
    cy.get('cup-select select.cup-input').should('exist');
  });

  it('parses JSON options', () => {
    cy.mount('<cup-select label="Color" options=\'[{"value":"r","label":"Red"},{"value":"b","label":"Blue"}]\'></cup-select>');
    cy.get('cup-select select option').should('have.length', 2);
    cy.get('cup-select select option').first().should('have.value', 'r').and('contain.text', 'Red');
  });

  it('parses comma-separated value:Label options', () => {
    cy.mount('<cup-select label="Size" options="sm:Small,md:Medium,lg:Large"></cup-select>');
    cy.get('cup-select select option').should('have.length', 3);
    cy.get('cup-select select option').eq(1).should('have.value', 'md').and('contain.text', 'Medium');
  });

  it('renders placeholder option', () => {
    cy.mount('<cup-select label="Color" placeholder="Pick one" options="r:Red,b:Blue"></cup-select>');
    cy.get('cup-select select option').first().should('contain.text', 'Pick one').and('be.disabled');
  });

  it('selects value from attribute', () => {
    cy.mount('<cup-select label="Color" value="b" options=\'[{"value":"r","label":"Red"},{"value":"b","label":"Blue"}]\'></cup-select>');
    cy.get('cup-select select').should('have.value', 'b');
  });

  it('renders required state', () => {
    cy.mount('<cup-select label="Color" required options="r:Red"></cup-select>');
    cy.get('cup-select').should('have.attr', 'data-required');
    cy.get('cup-select select').should('have.attr', 'aria-required', 'true');
  });

  it('renders error state', () => {
    cy.mount('<cup-select label="Color" error="Required" options="r:Red"></cup-select>');
    cy.get('cup-select').should('have.attr', 'data-state', 'error');
    cy.get('cup-select .cup-error[role="alert"]').should('contain.text', 'Required');
  });

  it('renders hint', () => {
    cy.mount('<cup-select label="Color" hint="Pick your favorite" options="r:Red"></cup-select>');
    cy.get('cup-select .cup-hint').should('contain.text', 'Pick your favorite');
  });

  it('applies disabled state', () => {
    cy.mount('<cup-select label="Color" disabled options="r:Red"></cup-select>');
    cy.get('cup-select select').should('be.disabled');
  });

  it('allows user selection', () => {
    cy.mount('<cup-select label="Color" options="r:Red,b:Blue,g:Green"></cup-select>');
    cy.get('cup-select select').select('b');
    cy.get('cup-select select').should('have.value', 'b');
  });
});
