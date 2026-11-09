// Component tests for <cup-theme-picker>
describe('cup-theme-picker', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
    // Not in cup.js: cup-powered-by loads it on demand. Load it into the page under test.
    cy.window().then((win) => new Promise((resolve, reject) => {
      const s = win.document.createElement('script');
      s.type = 'module';
      s.src = '/components/cup-theme-picker.js';
      s.onload = resolve;
      s.onerror = reject;
      win.document.head.appendChild(s);
    }));
  });

  it('opens its panel and sets the open attribute', () => {
    cy.mount('<cup-theme-picker></cup-theme-picker>');
    cy.get('cup-theme-picker').then(($p) => {
      $p[0].open();
    });
    cy.get('cup-theme-picker').should('have.attr', 'open');
    cy.get('.cup-tp').should('be.visible');
  });

  it('closes and removes the open attribute', () => {
    cy.mount('<cup-theme-picker></cup-theme-picker>');
    cy.get('cup-theme-picker').then(($p) => {
      $p[0].open();
      $p[0].close();
    });
    cy.get('cup-theme-picker').should('not.have.attr', 'open');
    cy.get('.cup-tp').should('not.be.visible');
  });

  it('toggle() switches between open and closed', () => {
    cy.mount('<cup-theme-picker></cup-theme-picker>');
    cy.get('cup-theme-picker').then(($p) => {
      $p[0].toggle();
      expect($p[0].hasAttribute('open')).to.equal(true);
      $p[0].toggle();
      expect($p[0].hasAttribute('open')).to.equal(false);
    });
  });
});
