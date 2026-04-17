// Component tests for <cup-radio-group>
describe('cup-radio-group', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders fieldset with legend and radio buttons', () => {
    cy.mount('<cup-radio-group label="Size" options=\'[{"value":"s","label":"Small"},{"value":"m","label":"Medium"},{"value":"l","label":"Large"}]\'></cup-radio-group>');
    cy.get('cup-radio-group fieldset legend').should('contain.text', 'Size');
    cy.get('cup-radio-group input[type="radio"]').should('have.length', 3);
  });

  it('parses comma-separated options', () => {
    cy.mount('<cup-radio-group label="Color" options="r:Red,b:Blue,g:Green"></cup-radio-group>');
    cy.get('cup-radio-group input[type="radio"]').should('have.length', 3);
    cy.get('cup-radio-group input[type="radio"]').first().should('have.value', 'r');
  });

  it('selects value from attribute', () => {
    cy.mount('<cup-radio-group label="Color" value="b" options="r:Red,b:Blue,g:Green"></cup-radio-group>');
    cy.get('cup-radio-group input[type="radio"][value="b"]').should('be.checked');
    cy.get('cup-radio-group input[type="radio"][value="r"]').should('not.be.checked');
  });

  it('renders required marker on legend', () => {
    cy.mount('<cup-radio-group label="Priority" required options="h:High,l:Low"></cup-radio-group>');
    cy.get('cup-radio-group fieldset legend span[aria-hidden="true"]').should('contain.text', '*');
    cy.get('cup-radio-group input[type="radio"]').first().should('have.attr', 'aria-required', 'true');
  });

  it('applies disabled to all radios', () => {
    cy.mount('<cup-radio-group label="Size" disabled options="s:Small,m:Medium"></cup-radio-group>');
    cy.get('cup-radio-group input[type="radio"]').each(($radio) => {
      expect($radio).to.be.disabled;
    });
  });

  it('allows user selection', () => {
    cy.mount('<cup-radio-group label="Color" options="r:Red,b:Blue,g:Green"></cup-radio-group>');
    cy.get('cup-radio-group input[type="radio"][value="g"]').check();
    cy.get('cup-radio-group input[type="radio"][value="g"]').should('be.checked');
    cy.get('cup-radio-group input[type="radio"][value="r"]').should('not.be.checked');
  });

  it('shares name attribute across all radios', () => {
    cy.mount('<cup-radio-group label="Size" name="shirt_size" options="s:Small,m:Medium"></cup-radio-group>');
    cy.get('cup-radio-group input[type="radio"]').each(($radio) => {
      expect($radio).to.have.attr('name', 'shirt_size');
    });
  });
});
