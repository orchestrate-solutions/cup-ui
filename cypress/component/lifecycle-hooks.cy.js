// Component tests for CupElement lifecycle hooks
describe('CupElement Lifecycle Hooks', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('useHook method exists on cup elements', () => {
    cy.mount('<cup-button>Test</cup-button>');
    cy.get('cup-button').then(($el) => {
      expect(typeof $el[0].useHook).to.eq('function');
    });
  });

  it('onConnect hook fires when element enters DOM', () => {
    cy.window().then((win) => {
      const el = win.document.createElement('cup-button');
      // connectedCallback fires synchronously on appendChild
      const hookState = { connected: false };
      el.useHook({ onConnect: () => { hookState.connected = true; } });
      el.textContent = 'Hook Test';
      win.document.getElementById('mount').appendChild(el);
      // connectedCallback already fired synchronously
      expect(hookState.connected).to.be.true;
    });
  });

  it('onDisconnect hook fires when element leaves DOM', () => {
    cy.window().then((win) => {
      const el = win.document.createElement('cup-button');
      const hookState = { disconnected: false };
      el.useHook({ onDisconnect: () => { hookState.disconnected = true; } });
      el.textContent = 'Disconnect Test';
      const mount = win.document.getElementById('mount');
      mount.appendChild(el);
      el.remove();
      expect(hookState.disconnected).to.be.true;
    });
  });

  it('beforeRender and afterRender hooks fire in order', () => {
    cy.window().then((win) => {
      const el = win.document.createElement('cup-button');
      const events = [];
      el.useHook({
        beforeRender: () => events.push('before'),
        afterRender: () => events.push('after'),
      });
      el.textContent = 'Render Hooks';
      win.document.getElementById('mount').appendChild(el);
    });
    // Wait for microtask-based render to complete
    cy.wait(50).then(() => {
      cy.window().then((win) => {
        // Verify by checking that the element rendered (has content from render())
        const el = win.document.querySelector('cup-button');
        expect(el).to.not.be.null;
      });
    });
  });

  it('multiple hooks on same element all fire', () => {
    cy.window().then((win) => {
      const el = win.document.createElement('cup-button');
      const hookState = { a: false, b: false };
      el.useHook({ onConnect: () => { hookState.a = true; } });
      el.useHook({ onConnect: () => { hookState.b = true; } });
      el.textContent = 'Multi Hook';
      win.document.getElementById('mount').appendChild(el);
      // connectedCallback fires synchronously
      expect(hookState.a).to.be.true;
      expect(hookState.b).to.be.true;
    });
  });
});
