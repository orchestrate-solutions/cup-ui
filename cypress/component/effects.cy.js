// Component tests for CSS effects (data-effect attribute system)
describe('CSS Effects', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  describe('Entrance Effects', () => {
    it('fade-in applies cup-fade-in animation', () => {
      cy.mount('<div data-effect="fade-in" style="width:100px;height:100px;background:red;">Test</div>');
      cy.get('[data-effect="fade-in"]')
        .should('have.css', 'animation-name', 'cup-fade-in');
    });

    it('slide-up applies cup-slide-up animation', () => {
      cy.mount('<div data-effect="slide-up">Slide Up</div>');
      cy.get('[data-effect="slide-up"]')
        .should('have.css', 'animation-name', 'cup-slide-up');
    });

    it('scale-in applies cup-scale-in animation', () => {
      cy.mount('<div data-effect="scale-in">Scale In</div>');
      cy.get('[data-effect="scale-in"]')
        .should('have.css', 'animation-name', 'cup-scale-in');
    });
  });

  describe('Exit Effects', () => {
    it('fade-out applies cup-fade-out animation', () => {
      cy.mount('<div data-effect="fade-out">Fade Out</div>');
      cy.get('[data-effect="fade-out"]')
        .should('have.css', 'animation-name', 'cup-fade-out');
    });

    it('slide-down applies cup-slide-down animation', () => {
      cy.mount('<div data-effect="slide-down">Slide Down</div>');
      cy.get('[data-effect="slide-down"]')
        .should('have.css', 'animation-name', 'cup-slide-down');
    });
  });

  describe('Emphasis Effects', () => {
    it('pulse applies cup-pulse animation with infinite iteration', () => {
      cy.mount('<div data-effect="pulse">Pulse</div>');
      cy.get('[data-effect="pulse"]')
        .should('have.css', 'animation-name', 'cup-pulse')
        .should('have.css', 'animation-iteration-count', 'infinite');
    });

    it('shake applies cup-shake animation', () => {
      cy.mount('<div data-effect="shake">Shake</div>');
      cy.get('[data-effect="shake"]')
        .should('have.css', 'animation-name', 'cup-shake');
    });
  });

  describe('Speed Modifier', () => {
    it('data-effect-speed="fast" sets 150ms duration', () => {
      cy.mount('<div data-effect="fade-in" data-effect-speed="fast">Fast</div>');
      cy.get('[data-effect="fade-in"]')
        .should('have.css', 'animation-duration', '0.15s');
    });

    it('data-effect-speed="slow" sets 400ms duration', () => {
      cy.mount('<div data-effect="fade-in" data-effect-speed="slow">Slow</div>');
      cy.get('[data-effect="fade-in"]')
        .should('have.css', 'animation-duration', '0.4s');
    });
  });

  describe('Delay Modifier', () => {
    it('data-effect-delay="200" sets 200ms delay', () => {
      cy.mount('<div data-effect="fade-in" data-effect-delay="200">Delayed</div>');
      cy.get('[data-effect="fade-in"]')
        .should('have.css', 'animation-delay', '0.2s');
    });

    it('data-effect-delay="500" sets 500ms delay', () => {
      cy.mount('<div data-effect="slide-up" data-effect-delay="500">Delayed</div>');
      cy.get('[data-effect="slide-up"]')
        .should('have.css', 'animation-delay', '0.5s');
    });
  });

  describe('No Effect When Absent', () => {
    it('element without data-effect has no cup animation', () => {
      cy.mount('<div class="cup-button">No effect</div>');
      cy.get('.cup-button')
        .should('have.css', 'animation-name', 'none');
    });
  });
});
