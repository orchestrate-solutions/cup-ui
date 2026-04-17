// E2E tests — SEO baseline for the cup-ui playground
describe('SEO Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('/docs/index.html');
  });

  describe('Meta Tags', () => {
    it('has a descriptive <title>', () => {
      cy.title().should('include', 'cup/core');
      cy.title().should('have.length.greaterThan', 20);
    });

    it('has a meta description', () => {
      cy.get('meta[name="description"]')
        .should('have.attr', 'content')
        .and('have.length.greaterThan', 50);
    });

    it('has a canonical link', () => {
      cy.get('link[rel="canonical"]')
        .should('have.attr', 'href')
        .and('include', 'http');
    });

    it('has viewport meta', () => {
      cy.get('meta[name="viewport"]')
        .should('have.attr', 'content')
        .and('include', 'width=device-width');
    });

    it('has charset meta', () => {
      cy.get('meta[charset]').should('exist');
    });
  });

  describe('Open Graph', () => {
    it('has og:title', () => {
      cy.get('meta[property="og:title"]')
        .should('have.attr', 'content')
        .and('have.length.greaterThan', 5);
    });

    it('has og:description', () => {
      cy.get('meta[property="og:description"]')
        .should('have.attr', 'content')
        .and('have.length.greaterThan', 20);
    });

    it('has og:type', () => {
      cy.get('meta[property="og:type"]')
        .should('have.attr', 'content', 'website');
    });

    it('has og:url', () => {
      cy.get('meta[property="og:url"]')
        .should('have.attr', 'content')
        .and('include', 'http');
    });

    it('has og:image with dimensions and alt', () => {
      cy.get('meta[property="og:image"]')
        .should('have.attr', 'content')
        .and('include', 'og-image');
      cy.get('meta[property="og:image"]')
        .should('have.attr', 'content')
        .and('include', '.png');
      cy.get('meta[property="og:image:type"]')
        .should('have.attr', 'content', 'image/png');
      cy.get('meta[property="og:image:width"]')
        .should('have.attr', 'content', '1200');
      cy.get('meta[property="og:image:height"]')
        .should('have.attr', 'content', '630');
      cy.get('meta[property="og:image:alt"]')
        .should('have.attr', 'content')
        .and('have.length.greaterThan', 10);
    });
  });

  describe('Twitter Card', () => {
    it('has twitter:card as summary_large_image', () => {
      cy.get('meta[name="twitter:card"]')
        .should('have.attr', 'content', 'summary_large_image');
    });

    it('has twitter:title', () => {
      cy.get('meta[name="twitter:title"]')
        .should('have.attr', 'content')
        .and('have.length.greaterThan', 5);
    });

    it('has twitter:image with alt', () => {
      cy.get('meta[name="twitter:image"]')
        .should('have.attr', 'content')
        .and('include', '.png');
      cy.get('meta[name="twitter:image:alt"]')
        .should('have.attr', 'content')
        .and('have.length.greaterThan', 10);
    });
  });

  describe('Structured Data', () => {
    it('has JSON-LD script', () => {
      cy.get('script[type="application/ld+json"]').should('exist');
    });

    it('SoftwareApplication JSON-LD is valid', () => {
      cy.get('script[type="application/ld+json"]').then(($els) => {
        const schemas = [...$els].map(el => JSON.parse(el.textContent));
        const app = schemas.find(s => s['@type'] === 'SoftwareApplication');
        expect(app).to.exist;
        expect(app['@context']).to.equal('https://schema.org');
        expect(app.name).to.be.a('string');
      });
    });

    it('BreadcrumbList JSON-LD is valid', () => {
      cy.get('script[type="application/ld+json"]').then(($els) => {
        const schemas = [...$els].map(el => JSON.parse(el.textContent));
        const bc = schemas.find(s => s['@type'] === 'BreadcrumbList');
        expect(bc).to.exist;
        expect(bc.itemListElement).to.have.length.greaterThan(1);
        expect(bc.itemListElement[0].position).to.equal(1);
      });
    });

    it('ItemList JSON-LD is injected for components', () => {
      cy.get('#main', { timeout: 10000 }).should('not.be.empty');
      // Wait for pipeline to inject the ItemList
      cy.get('script[type="application/ld+json"]', { timeout: 10000 }).then(($els) => {
        const schemas = [...$els].map(el => JSON.parse(el.textContent));
        const list = schemas.find(s => s['@type'] === 'ItemList');
        expect(list).to.exist;
        expect(list.name).to.include('cup/core');
        expect(list.numberOfItems).to.be.greaterThan(10);
        expect(list.itemListElement[0]['@type']).to.equal('ListItem');
        expect(list.itemListElement[0].name).to.be.a('string');
      });
    });
  });

  describe('Semantic Structure', () => {
    it('has exactly one <main> element', () => {
      cy.get('main').should('have.length', 1);
    });

    it('has a <header> element', () => {
      cy.get('header').should('exist');
    });

    it('has a <nav> element', () => {
      cy.get('nav').should('exist');
    });

    it('has a <footer> element', () => {
      cy.get('footer').should('exist');
    });

    it('html has lang attribute', () => {
      cy.get('html').should('have.attr', 'lang', 'en');
    });

    it('has theme-color meta for dark and light', () => {
      cy.get('meta[name="theme-color"]').should('have.length.at.least', 1);
    });

    it('sidebar nav headings are semantic h3', () => {
      cy.get('#sidebar h3.pg-nav-heading').should('have.length', 5);
    });
  });

  describe('Noscript Fallback', () => {
    it('has a <noscript> element with content', () => {
      cy.get('noscript').should('exist');
      cy.get('noscript').invoke('html').should('have.length.greaterThan', 100);
    });
  });

  describe('Accessibility for SEO', () => {
    it('has a skip link', () => {
      cy.get('.cup-skip-link, a[href="#main"]').should('exist');
    });

    it('all nav links have text content', () => {
      cy.get('#sidebar .pg-nav-link').each(($el) => {
        expect($el.text().trim()).to.have.length.greaterThan(0);
      });
    });
  });

  describe('Heading Hierarchy', () => {
    it('has exactly one h1', () => {
      cy.get('h1').should('have.length', 1);
    });

    it('has h2 elements for component sections', () => {
      cy.get('#main', { timeout: 10000 }).should('not.be.empty');
      cy.get('h2.pg-section-title').should('have.length.greaterThan', 10);
    });

    it('h1 comes before h2 in source order', () => {
      cy.get('#main', { timeout: 10000 }).should('not.be.empty');
      cy.get('h1').then(($h1) => {
        cy.get('h2').first().then(($h2) => {
          const h1Pos = $h1[0].compareDocumentPosition($h2[0]);
          // h2 should follow h1 (bit 4 = DOCUMENT_POSITION_FOLLOWING)
          expect(h1Pos & 4).to.equal(4);
        });
      });
    });
  });

  describe('Favicon', () => {
    it('has a favicon link', () => {
      cy.get('link[rel="icon"]').should('have.attr', 'href');
    });
  });

  describe('Component Descriptions', () => {
    it('sections have description text', () => {
      cy.get('#main', { timeout: 10000 }).should('not.be.empty');
      cy.get('.pg-section-desc').should('have.length.greaterThan', 10);
    });

    it('description text is meaningful (not empty)', () => {
      cy.get('#main', { timeout: 10000 }).should('not.be.empty');
      cy.get('.pg-section-desc').first()
        .invoke('text')
        .should('have.length.greaterThan', 15);
    });
  });

  describe('Tests Page', () => {
    it('tests.html has noindex meta', () => {
      cy.visit('/docs/tests.html');
      cy.get('meta[name="robots"]')
        .should('have.attr', 'content')
        .and('include', 'noindex');
    });

    it('tests.html has viewport meta', () => {
      cy.visit('/docs/tests.html');
      cy.get('meta[name="viewport"]').should('exist');
    });
  });

  describe('Dynamic Title on Hash Navigation', () => {
    it('updates document title when navigating to a section', () => {
      cy.get('#main', { timeout: 10000 }).should('not.be.empty');
      cy.get('.pg-nav-link[data-section="button"]').click();
      cy.title().should('include', 'Button');
      cy.title().should('include', 'cup/core');
    });

    it('restores base title when hash is cleared', () => {
      cy.get('#main', { timeout: 10000 }).should('not.be.empty');
      cy.window().then(win => {
        win.location.hash = '';
        win.dispatchEvent(new HashChangeEvent('hashchange'));
      });
      cy.title().should('include', 'Playground');
    });
  });
});
