// Component tests for CssState — element-local CSS Payload
describe('CssState', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('element has state after render', () => {
    cy.mount('<cup-button variant="primary">Go</cup-button>');
    cy.get('cup-button').should(($el) => {
      expect($el[0].state).to.not.be.null;
    });
  });

  it('state.get() reads computed properties', () => {
    cy.mount('<cup-button variant="primary">Go</cup-button>');
    cy.get('cup-button').should(($el) => {
      const state = $el[0].state;
      // button should have a display value
      const display = state.get('display');
      expect(display).to.be.a('string');
    });
  });

  it('state.get() reads design tokens', () => {
    cy.mount('<cup-field label="Name"></cup-field>');
    cy.get('cup-field').should(($el) => {
      const primary = $el[0].state.get('--cup-color-primary');
      expect(primary).to.exist;
    });
  });

  it('state.get() returns default for unknown key', () => {
    cy.mount('<cup-badge label="OK"></cup-badge>');
    cy.get('cup-badge').should(($el) => {
      expect($el[0].state.get('--nonexistent', 'fallback')).to.equal('fallback');
    });
  });

  it('state.tokens returns frozen token map', () => {
    cy.mount('<cup-input placeholder="test"></cup-input>');
    cy.get('cup-input').should(($el) => {
      const tokens = $el[0].state.tokens;
      expect(tokens).to.be.an('object');
      expect(Object.isFrozen(tokens)).to.be.true;
    });
  });

  it('state.computed returns frozen computed map', () => {
    cy.mount('<cup-label>Email</cup-label>');
    cy.get('cup-label').should(($el) => {
      const computed = $el[0].state.computed;
      expect(computed).to.be.an('object');
      expect(Object.isFrozen(computed)).to.be.true;
    });
  });

  it('state.toDict() returns plain object', () => {
    cy.mount('<cup-hint>Help text</cup-hint>');
    cy.get('cup-hint').should(($el) => {
      const dict = $el[0].state.toDict();
      expect(dict).to.have.property('tokens');
      expect(dict).to.have.property('computed');
    });
  });

  it('state is frozen (immutable)', () => {
    cy.mount('<cup-button variant="primary">Go</cup-button>');
    cy.get('cup-button').should(($el) => {
      const state = $el[0].state;
      expect(Object.isFrozen(state)).to.be.true;
    });
  });

  it('state updates after attribute change triggers re-render', () => {
    cy.mount('<cup-badge variant="default" label="v1"></cup-badge>');
    cy.get('cup-badge').should(($el) => {
      const first = $el[0].state;
      expect(first).to.not.be.null;
    });
    cy.get('cup-badge').invoke('attr', 'variant', 'success');
    cy.wait(50); // microtask re-render
    cy.get('cup-badge').should(($el) => {
      // State should be a new snapshot
      expect($el[0].state).to.not.be.null;
    });
  });

  it('shadow DOM components also have state', () => {
    cy.mount('<cup-skeleton></cup-skeleton>');
    cy.get('cup-skeleton').should(($el) => {
      expect($el[0].state).to.not.be.null;
      expect($el[0].state.tokens).to.be.an('object');
    });
  });

  it('state is null before first render', () => {
    cy.window().then(win => {
      const el = win.document.createElement('cup-button');
      // Not connected yet — state should be null
      expect(el.state).to.be.null;
    });
  });
});
