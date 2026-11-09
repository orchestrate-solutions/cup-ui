// Component tests for <cup-stepper>
describe('cup-stepper', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  const STEPS = `steps='["Plan","Build","Ship"]'`;

  it('renders one step per label with the active and completed states', () => {
    cy.mount(`<cup-stepper ${STEPS} active="1"></cup-stepper>`);
    cy.get('cup-stepper .cup-stepper___step').should('have.length', 3);
    cy.get('cup-stepper .cup-stepper___step').eq(0).should('have.class', 'cup-stepper___step--completed');
    cy.get('cup-stepper .cup-stepper___step').eq(1).should('have.class', 'cup-stepper___step--active').and('have.attr', 'aria-current', 'step');
    cy.get('cup-stepper .cup-stepper___step').eq(2).should('have.class', 'cup-stepper___step').and('not.have.class', 'cup-stepper___step--active');
  });

  it('sends step-change when a step is clicked', () => {
    cy.mount(`<cup-stepper ${STEPS} active="0"></cup-stepper>`);
    cy.get('cup-stepper').then(($s) => {
      const handler = cy.stub().as('change');
      $s[0].addEventListener('step-change', (e) => handler(e.detail.step, e.detail.label));
    });
    cy.get('cup-stepper .cup-stepper___step').eq(2).click();
    cy.get('@change').should('have.been.calledWith', 2, 'Ship');
    cy.get('cup-stepper').should('have.attr', 'active', '2');
  });

  it('does not allow skipping ahead when linear', () => {
    cy.mount(`<cup-stepper ${STEPS} active="0" linear></cup-stepper>`);
    cy.get('cup-stepper .cup-stepper___step').eq(2).should('have.attr', 'aria-disabled', 'true');
    cy.get('cup-stepper .cup-stepper___step').eq(2).click({ force: true });
    cy.get('cup-stepper').should('have.attr', 'active', '0');
  });

  it('moves with next() and prev()', () => {
    cy.mount(`<cup-stepper ${STEPS} active="0"></cup-stepper>`);
    cy.get('cup-stepper').then(($s) => {
      $s[0].next();
      expect($s[0].getAttribute('active')).to.equal('1');
      $s[0].prev();
      expect($s[0].getAttribute('active')).to.equal('0');
    });
  });
});
