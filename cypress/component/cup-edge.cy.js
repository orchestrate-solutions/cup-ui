// Component tests for <cup-edge>
describe('cup-edge', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('routes with right angles: out, vertical at the midpoint, in', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50"></cup-edge>');
    cy.get('cup-edge .cup-edge___path')
      .should('have.attr', 'd', 'M 0 0 L 50 0 L 50 50 L 100 50');
  });

  it('draws a straight line when source and target share a row', () => {
    cy.mount('<cup-edge x1="10" y1="40" x2="110" y2="40"></cup-edge>');
    cy.get('cup-edge .cup-edge___path')
      .should('have.attr', 'd', 'M 10 40 L 60 40 L 60 40 L 110 40');
  });

  it('ends in an arrowhead marker that exists in the svg', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50"></cup-edge>');
    cy.get('cup-edge .cup-edge___path').invoke('attr', 'marker-end').then((ref) => {
      const id = ref.match(/url\(#(.+)\)/)[1];
      cy.get('cup-edge').find(`marker[id="${id}"]`).should('exist');
    });
  });

  it('gives each edge its own marker id', () => {
    cy.mount(
      '<cup-edge x1="0" y1="0" x2="10" y2="10"></cup-edge>' +
      '<cup-edge x1="0" y1="0" x2="20" y2="20"></cup-edge>'
    );
    cy.get('cup-edge marker').then(($m) => {
      const ids = [...$m].map((m) => m.id);
      expect(new Set(ids).size).to.eq(ids.length);
    });
  });

  it('renders a label at the bend', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50" label="Spatial"></cup-edge>');
    cy.get('cup-edge .cup-edge___label-text').should('have.text', 'Spatial');
    cy.get('cup-edge .cup-edge___label').should('have.attr', 'transform', 'translate(50, 25)');
  });

  it('sizes the label box to the text', () => {
    cy.mount(
      '<cup-edge id="short" x1="0" y1="0" x2="1" y2="1" label="Hi"></cup-edge>' +
      '<cup-edge id="long" x1="0" y1="0" x2="1" y2="1" label="A much longer label"></cup-edge>'
    );
    cy.get('#short .cup-edge___label-box').invoke('attr', 'width').then((s) => {
      cy.get('#long .cup-edge___label-box').invoke('attr', 'width').should((l) => {
        expect(Number(l)).to.be.greaterThan(Number(s));
      });
    });
  });

  it('renders no label group without a label', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50"></cup-edge>');
    cy.get('cup-edge .cup-edge___label').should('not.exist');
  });

  it('marks the path active', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50" active></cup-edge>');
    cy.get('cup-edge .cup-edge___path').should('have.class', 'cup-edge___path--active');
  });

  it('is not active by default', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50"></cup-edge>');
    cy.get('cup-edge .cup-edge___path').should('not.have.class', 'cup-edge___path--active');
  });

  it('describes the relationship when from and to are given', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="1" y2="1" from="input" to="triage" label="4 chunks"></cup-edge>');
    cy.get('cup-edge svg')
      .should('have.attr', 'role', 'img')
      .and('have.attr', 'aria-label', 'input to triage: 4 chunks');
  });

  it('is decorative without from and to', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="1" y2="1"></cup-edge>');
    cy.get('cup-edge svg').should('have.attr', 'aria-hidden', 'true');
  });

  it('escapes HTML in the label', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="9" y2="9" label="&lt;b&gt;x&lt;/b&gt;"></cup-edge>');
    cy.get('cup-edge b').should('not.exist');
    cy.get('cup-edge .cup-edge___label-text').should('have.text', '<b>x</b>');
  });

  it('re-routes when coordinates change', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50"></cup-edge>');
    cy.get('cup-edge').then(($el) => $el[0].setAttribute('x2', '200'));
    cy.get('cup-edge .cup-edge___path')
      .should('have.attr', 'd', 'M 0 0 L 100 0 L 100 50 L 200 50');
  });

  it('routes top-to-bottom between vertical sides', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50" start-side="bottom" end-side="top" label="down"></cup-edge>');
    cy.get('cup-edge .cup-edge___path').should('have.attr', 'd', 'M 0 0 L 0 25 L 100 25 L 100 50');
    cy.get('cup-edge .cup-edge___label').should('have.attr', 'transform', 'translate(50, 25)');
  });

  it('turns once between a horizontal and a vertical side', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50" start-side="right" end-side="top" label="in"></cup-edge>');
    cy.get('cup-edge .cup-edge___path').should('have.attr', 'd', 'M 0 0 L 100 0 L 100 50');
    cy.get('cup-edge .cup-edge___label').should('have.attr', 'transform', 'translate(100, 0)');
  });

  it('turns once between a vertical and a horizontal side', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50" start-side="bottom" end-side="left"></cup-edge>');
    cy.get('cup-edge .cup-edge___path').should('have.attr', 'd', 'M 0 0 L 0 50 L 100 50');
  });

  it('loops outward when both ends use the same side', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50" start-side="right" end-side="right"></cup-edge>');
    cy.get('cup-edge .cup-edge___path').should('have.attr', 'd', 'M 0 0 L 124 0 L 124 50 L 100 50');
  });

  it('falls back to right and left for unknown sides', () => {
    cy.mount('<cup-edge x1="0" y1="0" x2="100" y2="50" start-side="diagonal" end-side="up"></cup-edge>');
    cy.get('cup-edge .cup-edge___path').should('have.attr', 'd', 'M 0 0 L 50 0 L 50 50 L 100 50');
  });

  it('only ever draws horizontal and vertical segments', () => {
    const sides = ['right', 'left', 'top', 'bottom'];
    const html = sides.flatMap((s) => sides.map((e) =>
      `<cup-edge x1="37" y1="12" x2="-80" y2="140" start-side="${s}" end-side="${e}"></cup-edge>`)).join('');
    cy.mount(html);
    cy.get('cup-edge .cup-edge___path').should('have.length', 16).each(($p) => {
      const pts = $p.attr('d').replace('M ', '').split(' L ').map((p) => p.split(' ').map(Number));
      for (let i = 1; i < pts.length; i++) {
        const straight = pts[i][0] === pts[i - 1][0] || pts[i][1] === pts[i - 1][1];
        expect(straight, $p.attr('d')).to.eq(true);
      }
    });
  });
});
