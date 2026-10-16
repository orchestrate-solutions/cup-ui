// Component tests for <cup-node>
describe('cup-node', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders id, label and role', () => {
    cy.mount('<cup-node node-id="triage" label="Triage" role-tag="triage"></cup-node>');
    cy.get('cup-node .cup-node___id').should('have.text', '#triage');
    cy.get('cup-node .cup-node___label').should('have.text', 'Triage');
    cy.get('cup-node .cup-node___role').should('have.text', 'triage');
  });

  it('is a labelled group for assistive tech', () => {
    cy.mount('<cup-node node-id="a" label="Alpha"></cup-node>');
    cy.get('cup-node .cup-node')
      .should('have.attr', 'role', 'group')
      .and('have.attr', 'aria-label', 'Alpha');
  });

  it('defaults to the rect shape', () => {
    cy.mount('<cup-node label="x"></cup-node>');
    cy.get('cup-node .cup-node').should('have.class', 'cup-node--rect');
  });

  ['rect', 'diamond', 'cylinder', 'pill'].forEach((shape) => {
    it(`supports the ${shape} shape`, () => {
      cy.mount(`<cup-node label="x" shape="${shape}"></cup-node>`);
      cy.get('cup-node .cup-node').should('have.class', `cup-node--${shape}`);
    });
  });

  it('falls back to rect for an unknown shape', () => {
    cy.mount('<cup-node label="x" shape="hexagon"></cup-node>');
    cy.get('cup-node .cup-node').should('have.class', 'cup-node--rect');
    cy.get('cup-node .cup-node').should('not.have.class', 'cup-node--hexagon');
  });

  ['focused', 'upstream', 'downstream', 'dimmed'].forEach((state) => {
    it(`applies the ${state} state`, () => {
      cy.mount(`<cup-node label="x" state="${state}"></cup-node>`);
      cy.get('cup-node .cup-node').should('have.class', `cup-node--${state}`);
    });
  });

  it('ignores an unknown state', () => {
    cy.mount('<cup-node label="x" state="bogus"></cup-node>');
    cy.get('cup-node .cup-node').invoke('attr', 'class').should('not.contain', 'bogus');
  });

  it('shows no metric bar without a metric', () => {
    cy.mount('<cup-node label="x"></cup-node>');
    cy.get('cup-node cup-progress').should('not.exist');
  });

  it('renders a metric bar with value and label', () => {
    cy.mount('<cup-node label="x" metric="85" metric-label="Conjunction Filter"></cup-node>');
    cy.get('cup-node cup-progress').should('have.attr', 'value', '85');
    cy.get('cup-node cup-progress').should('have.attr', 'label', 'Conjunction Filter');
  });

  it('treats a metric of 0 as present', () => {
    cy.mount('<cup-node label="x" metric="0"></cup-node>');
    cy.get('cup-node cup-progress').should('have.attr', 'value', '0');
  });

  it('escapes HTML in the label', () => {
    cy.mount('<cup-node label="&lt;img src=x onerror=alert(1)&gt;"></cup-node>');
    cy.get('cup-node img').should('not.exist');
    cy.get('cup-node .cup-node___label').should('contain.text', '<img src=x');
  });

  it('re-renders when attributes change', () => {
    cy.mount('<cup-node label="Before" shape="rect"></cup-node>');
    cy.get('cup-node').then(($el) => {
      $el[0].setAttribute('label', 'After');
      $el[0].setAttribute('shape', 'pill');
    });
    cy.get('cup-node .cup-node___label').should('have.text', 'After');
    cy.get('cup-node .cup-node').should('have.class', 'cup-node--pill');
  });

  it('marks upstream and downstream with a text cue, not color alone', () => {
    cy.mount(
      '<cup-node id="u" label="x" state="upstream"></cup-node>' +
      '<cup-node id="d" label="x" state="downstream"></cup-node>'
    );
    cy.get('#u .cup-node___flow').should('have.text', 'cause');
    cy.get('#d .cup-node___flow').should('have.text', 'effect');
  });

  it('shows no flow cue when idle', () => {
    cy.mount('<cup-node label="x"></cup-node>');
    cy.get('cup-node .cup-node___flow').should('not.exist');
  });

  it('shows no verification status by default', () => {
    cy.mount('<cup-node label="x"></cup-node>');
    cy.get('cup-node .cup-node___status').should('not.exist');
  });

  it('shows a claim as claimed', () => {
    cy.mount('<cup-node label="x" verification="claimed"></cup-node>');
    cy.get('cup-node .cup-node').should('have.class', 'cup-node--claimed');
    cy.get('cup-node .cup-node___status').should('contain.text', 'claimed');
  });

  it('shows verified only when evidence is given, and displays the evidence', () => {
    cy.mount('<cup-node label="x" verification="verified" evidence="pytest: 412 passed"></cup-node>');
    cy.get('cup-node .cup-node').should('have.class', 'cup-node--verified');
    cy.get('cup-node .cup-node___status').should('contain.text', 'verified');
    cy.get('cup-node .cup-node___evidence').should('have.text', 'pytest: 412 passed');
  });

  it('downgrades verified without evidence to claimed', () => {
    cy.mount('<cup-node label="x" verification="verified"></cup-node>');
    cy.get('cup-node .cup-node').should('have.class', 'cup-node--claimed');
    cy.get('cup-node .cup-node').should('not.have.class', 'cup-node--verified');
  });

  it('shows failed', () => {
    cy.mount('<cup-node label="x" verification="failed" evidence="3 tests failed"></cup-node>');
    cy.get('cup-node .cup-node').should('have.class', 'cup-node--failed');
    cy.get('cup-node .cup-node___status').should('contain.text', 'failed');
  });

  it('includes state and verification in the accessible name', () => {
    cy.mount('<cup-node label="Build" state="upstream" verification="claimed"></cup-node>');
    cy.get('cup-node .cup-node').should('have.attr', 'aria-label', 'Build, cause, claimed');
  });

  it('draws metric tracks at one width so they compare across nodes', () => {
    cy.mount(
      '<cup-node id="a" label="Short" metric="50"></cup-node>' +
      '<cup-node id="b" label="A considerably longer node label that widens the box" metric="50"></cup-node>'
    );
    cy.get('#a .cup-progress').then(($a) => {
      cy.get('#b .cup-progress').should(($b) => {
        expect($b[0].getBoundingClientRect().width).to.eq($a[0].getBoundingClientRect().width);
      });
    });
  });

  it('keeps a quote in the label inside the accessible name', () => {
    cy.mount('<cup-node label="say &quot;hi&quot; onclick=alert(1)"></cup-node>');
    cy.get('cup-node .cup-node').should('have.attr', 'aria-label', 'say "hi" onclick=alert(1)');
    cy.get('cup-node .cup-node').should('not.have.attr', 'onclick');
  });

  it('shows the reason on the node when why is given', () => {
    cy.mount('<cup-node label="Majority stored it" why="So it cannot be lost"></cup-node>');
    cy.get('cup-node .cup-node___why').should('have.text', 'So it cannot be lost');
  });

  it('shows no reason line without why', () => {
    cy.mount('<cup-node label="x"></cup-node>');
    cy.get('cup-node .cup-node___why').should('not.exist');
  });

  it('escapes HTML in why', () => {
    cy.mount('<cup-node label="x" why="&lt;b&gt;bold&lt;/b&gt;"></cup-node>');
    cy.get('cup-node b').should('not.exist');
  });
});
