// E2E tests for the cup-ui playground site
describe('Playground E2E', () => {
  beforeEach(() => {
    cy.visit('/docs/index.html');
    // Wait for playground.js pipeline to render sections
    cy.get('#main', { timeout: 10000 }).should('not.be.empty');
  });

  describe('Navigation', () => {
    it('renders sidebar with all component nav links', () => {
      cy.get('#sidebar .pg-nav-link').should('have.length.at.least', 20);
    });

    it('has nano, micro, and tools section headings', () => {
      cy.get('#sidebar .pg-nav-heading').should('contain.text', 'Nano');
      cy.get('#sidebar .pg-nav-heading').should('contain.text', 'Micro');
      cy.get('#sidebar .pg-nav-heading').should('contain.text', 'Tools');
    });

    it('clicking a nav link scrolls to that section', () => {
      cy.get('a[data-section="button"]').click();
      cy.get('#button').should('be.visible');
    });
  });

  describe('Theme Toggle', () => {
    it('toggle switch exists in header', () => {
      cy.get('#theme-toggle').should('exist');
    });

    it('toggles data-theme on html element', () => {
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      cy.get('#theme-toggle').shadow().find('button[role="switch"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');
      cy.get('#theme-toggle').shadow().find('button[role="switch"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });
  });

  describe('Component Sections Rendered', () => {
    const sections = [
      'label', 'input', 'hint', 'error', 'icon', 'skeleton', 'divider',
      'field', 'select', 'textarea', 'number', 'password', 'date', 'file',
      'checkbox', 'radio', 'button', 'toggle', 'badge', 'chip'
    ];

    sections.forEach((section) => {
      it(`renders #${section} section`, () => {
        cy.get(`#${section}`).should('exist');
      });
    });
  });

  describe('Live Component Interaction', () => {
    it('cup-field accepts input in playground', () => {
      cy.get('#field cup-field input.cup-input').first().type('Playground test');
      cy.get('#field cup-field input.cup-input').first().should('have.value', 'Playground test');
    });

    it('cup-password toggle works in playground', () => {
      cy.get('#password cup-password input.cup-input').first().type('secret');
      cy.get('#password cup-password [data-toggle-visibility]').first().click();
      cy.get('#password cup-password input.cup-input').first().should('have.attr', 'type', 'text');
      cy.get('#password cup-password input.cup-input').first().should('have.value', 'secret');
    });

    it('cup-checkbox toggles in playground', () => {
      cy.get('#checkbox cup-checkbox input[type="checkbox"]').first().check();
      cy.get('#checkbox cup-checkbox input[type="checkbox"]').first().should('be.checked');
    });

    it('cup-toggle switches in playground', () => {
      cy.get('#toggle cup-toggle').first().shadow().find('button[role="switch"]').click();
      cy.get('#toggle cup-toggle').first().should('have.attr', 'pressed');
    });

    it('cup-select allows selection in playground', () => {
      cy.get('#select cup-select select.cup-input').first().then(($select) => {
        if ($select.find('option').length > 1) {
          const lastOption = $select.find('option:not([disabled])').last().val();
          cy.wrap($select).select(lastOption);
          cy.wrap($select).should('have.value', lastOption);
        }
      });
    });
  });

  describe('Token Editor', () => {
    it('renders token editor section', () => {
      cy.get('#tokens').should('exist');
    });
  });

  describe('Theme Presets', () => {
    it('renders preset section', () => {
      cy.get('#presets').should('exist');
    });
  });

  describe('Style Metrics', () => {
    it('renders metrics section', () => {
      cy.get('#metrics').should('exist');
    });

    it('has paint timing, layout, CSS budget, and theme switch cards', () => {
      cy.get('#metrics-paint').should('exist');
      cy.get('#metrics-layout').should('exist');
      cy.get('#metrics-css').should('exist');
      cy.get('#metrics-theme').should('exist');
    });

    it('theme switch benchmark button works', () => {
      cy.get('#metrics-theme-btn').click();
      cy.get('#metrics-theme-result').should('not.be.empty');
    });
  });

  describe('Mobile Navigation', () => {
    it('hamburger button exists with correct ARIA', () => {
      cy.get('#menu-btn').should('exist');
      cy.get('#menu-btn').should('have.attr', 'aria-label', 'Toggle navigation');
      cy.get('#menu-btn').should('have.attr', 'aria-expanded', 'false');
      cy.get('#menu-btn').should('have.attr', 'aria-controls', 'sidebar');
    });
  });

  describe('Footer', () => {
    it('renders footer with build commit', () => {
      cy.get('#site-footer').should('exist');
      cy.get('#build-commit').should('exist');
    });
  });
});
