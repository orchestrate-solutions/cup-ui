// Component tests for <cup-viewport>
describe('cup-viewport', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  const show = (html, attributes = '') => {
    cy.mount(`<cup-viewport ${attributes}></cup-viewport>`);
    cy.get('cup-viewport').then(($el) => { $el[0].html = html; });
  };

  it('shows the content in a frame that has only allow-scripts', () => {
    show('<p>Hello</p>');
    cy.get('cup-viewport iframe').should('have.attr', 'sandbox', 'allow-scripts');
  });

  it('has the height of its content, and gets smaller when the content does', () => {
    show('<div style="height:300px">tall</div>');
    cy.get('cup-viewport iframe').should(($f) => expect($f[0].getBoundingClientRect().height).to.be.closeTo(324, 4));
    cy.get('cup-viewport').then(($el) => { $el[0].html = '<div style="height:40px">short</div>'; });
    cy.get('cup-viewport iframe').should(($f) => expect($f[0].getBoundingClientRect().height).to.be.closeTo(64, 4));
  });

  it('does not grow past max-height', () => {
    show('<div style="height:900px">very tall</div>', 'max-height="200"');
    cy.get('cup-viewport iframe').should(($f) => expect($f[0].getBoundingClientRect().height).to.equal(200));
  });

  it('runs a script of the content, and the script cannot reach the page', () => {
    show('<script>try{parent.document.title="reached"}catch(e){}try{parent.cupReached=1}catch(e){}'
      + 'document.body.append(Object.assign(document.createElement("div"),{style:"height:500px"}))</script>');
    cy.get('cup-viewport iframe').should(($f) => expect($f[0].getBoundingClientRect().height).to.be.greaterThan(480));
    cy.title().should('not.equal', 'reached');
    cy.window().its('cupReached').should('be.undefined');
    cy.get('cup-viewport iframe').should(($f) => expect(() => $f[0].contentDocument.body).to.satisfy((read) => {
      try { return read() === null; } catch (error) { return true; }
    }));
  });

  // The content cannot be read from the page, so a style is checked by its effect: a box of a known
  // height. With the style, the frame has that height and its padding (24). Without it, one line.
  const tall = (height) => ($f) => expect($f[0].getBoundingClientRect().height).to.be.closeTo(height + 24, 4);

  it('applies a style of the content', () => {
    show('<style>.box{height:200px}</style><div class="box">inline style</div>');
    cy.get('cup-viewport iframe').should(tall(200));
  });

  it('has only one line of height when the class has no style', () => {
    show('<div class="h-64">no style loaded</div>');
    cy.get('cup-viewport iframe').should(($f) => expect($f[0].getBoundingClientRect().height).to.be.lessThan(80));
  });

  // The frame's Content-Security-Policy allows style sheets from https: only. A sheet from a
  // plain http address (here, the test server) must not apply.
  it('does not apply a style sheet from a plain http address', () => {
    cy.window().then((win) => {
      show('<link rel="stylesheet" href="' + win.location.origin + '/cypress/assets/tall.css">'
        + '<div class="h-64">style sheet from a plain http address</div>');
    });
    cy.wait(1000);
    cy.get('cup-viewport iframe').should(($f) => expect($f[0].getBoundingClientRect().height).to.be.lessThan(80));
  });

  // The next three load from a public CDN. They run only when CDN_TESTS=1 is set, so that the
  // default run does not depend on the network.
  const cdn = Cypress.env('CDN_TESTS') ? it : it.skip;

  cdn('applies a style sheet from an https address', () => {
    show('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">'
      + '<div class="h-64">style sheet from a CDN</div>');
    cy.get('cup-viewport iframe', { timeout: 20000 }).should(tall(256));
  });

  cdn('applies the styles that a script from an https address makes: Tailwind 3', () => {
    show('<script src="https://cdn.tailwindcss.com"></' + 'script><div class="h-64">Tailwind play CDN</div>');
    cy.get('cup-viewport iframe', { timeout: 20000 }).should(tall(256));
  });

  cdn('applies the styles that a script from an https address makes: Tailwind 4', () => {
    show('<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></' + 'script><div class="h-64">Tailwind browser build</div>');
    cy.get('cup-viewport iframe', { timeout: 20000 }).should(tall(256));
  });

  it('has no buttons unless actions is set', () => {
    show('<p>Hello</p>');
    cy.get('cup-viewport button').should('not.exist');
  });

  it('with actions, Copy gives the HTML to the clipboard', () => {
    const html = '<h1>Keep me</h1><script>1</' + 'script>';
    show(html, 'actions');
    cy.window().then((win) => {
      const copied = [];
      Object.defineProperty(win.navigator, 'clipboard', { value: { writeText: (text) => { copied.push(text); return Promise.resolve(); } }, configurable: true });
      cy.get('cup-viewport').contains('button', 'Copy').click();
      cy.wrap(copied).should('deep.equal', [html]);
      cy.get('cup-viewport').contains('button', 'Copied');
    });
  });

  it('with actions, Download saves the HTML as a page with the name of the filename attribute', () => {
    const html = '<h1>Keep me</h1>';
    show(html, 'actions filename="my-block.html"');
    cy.window().then((win) => {
      const saved = [];
      const click = win.HTMLAnchorElement.prototype.click;
      win.HTMLAnchorElement.prototype.click = function () { saved.push({ name: this.download, href: this.href }); };
      cy.get('cup-viewport').contains('button', 'Download').click().then(async () => {
        win.HTMLAnchorElement.prototype.click = click;
        expect(saved).to.have.length(1);
        expect(saved[0].name).to.equal('my-block.html');
        const text = await (await win.fetch(saved[0].href)).text();
        expect(text).to.contain(html);
        expect(text).to.match(/^<!doctype html>/);
      });
    });
  });

  it('fires cup-viewport-resize with the height', () => {
    cy.mount('<cup-viewport></cup-viewport>');
    cy.get('cup-viewport').then(($el) => {
      const heights = [];
      $el[0].addEventListener('cup-viewport-resize', (event) => heights.push(event.detail.height));
      $el[0].html = '<div style="height:100px"></div>';
      cy.wrap(heights).should((all) => expect(all[all.length - 1]).to.be.closeTo(124, 4));
    });
  });
});
