// Component tests for <cup-graph>
const GRAPH = `
<cup-graph id="g">
  <cup-node node-id="a" label="Alpha" x="20" y="40"></cup-node>
  <cup-node node-id="b" label="Beta" x="320" y="160"></cup-node>
  <cup-node node-id="c" label="Gamma" x="620" y="40"></cup-node>
  <cup-edge from="a" to="b" label="first"></cup-edge>
  <cup-edge from="b" to="c"></cup-edge>
</cup-graph>`;

const box = (el) => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
const node = (doc, id) => doc.querySelector(`cup-node[node-id="${id}"]`);
const edge = (doc, from, to) => doc.querySelector(`cup-edge[from="${from}"][to="${to}"]`);

function drag(id, dx, dy) {
  cy.get(`cup-node[node-id="${id}"]`).then(($n) => {
    const r = $n[0].getBoundingClientRect();
    const x = r.left + 10;
    const y = r.top + 10;
    cy.wrap($n).trigger('pointerdown', { button: 0, clientX: x, clientY: y });
    cy.window().trigger('pointermove', { clientX: x + dx, clientY: y + dy });
    cy.window().trigger('pointerup', { clientX: x + dx, clientY: y + dy });
  });
}

describe('cup-graph', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('places nodes at their x and y', () => {
    cy.mount(GRAPH);
    cy.get('cup-node[node-id="b"]').should(($n) => {
      expect($n[0].offsetLeft).to.eq(320);
      expect($n[0].offsetTop).to.eq(160);
    });
  });

  it('derives edge coordinates from the nodes it names', () => {
    cy.mount(GRAPH);
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const b = box(node(doc, 'b'));
      const e = edge(doc, 'a', 'b');
      expect(Number(e.getAttribute('x1'))).to.eq(a.x + a.w);
      expect(Number(e.getAttribute('y1'))).to.eq(a.y + a.h / 2);
      expect(Number(e.getAttribute('x2'))).to.eq(b.x);
      expect(Number(e.getAttribute('y2'))).to.eq(b.y + b.h / 2);
    });
  });

  it('anchors a backward edge on the facing sides', () => {
    cy.mount(`<cup-graph>
      <cup-node node-id="a" label="Alpha" x="400" y="40"></cup-node>
      <cup-node node-id="b" label="Beta" x="20" y="40"></cup-node>
      <cup-edge from="a" to="b"></cup-edge>
    </cup-graph>`);
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const b = box(node(doc, 'b'));
      const e = edge(doc, 'a', 'b');
      expect(Number(e.getAttribute('x1'))).to.eq(a.x);
      expect(Number(e.getAttribute('x2'))).to.eq(b.x + b.w);
    });
  });

  it('hides an edge that names a missing node', () => {
    cy.mount(`<cup-graph>
      <cup-node node-id="a" label="Alpha" x="20" y="40"></cup-node>
      <cup-edge from="a" to="ghost"></cup-edge>
    </cup-graph>`);
    cy.get('cup-edge').should('have.attr', 'hidden');
  });

  it('grows to contain its farthest node', () => {
    cy.mount(GRAPH);
    cy.get('cup-graph').should(($g) => {
      const c = box(node($g[0].ownerDocument, 'c'));
      expect($g[0].offsetWidth).to.be.at.least(c.x + c.w);
    });
  });

  it('selects a node on click and marks its causes and effects', () => {
    cy.mount(GRAPH);
    cy.get('cup-node[node-id="b"]').click();
    cy.get('cup-graph').should(($g) => expect($g[0].getAttribute('selected')).to.equal('b'));
    cy.get('cup-node[node-id="b"]').should('have.attr', 'state', 'focused');
    cy.get('cup-node[node-id="a"]').should('have.attr', 'state', 'upstream');
    cy.get('cup-node[node-id="c"]').should('have.attr', 'state', 'downstream');
  });

  it('activates only the edges touching the selection', () => {
    cy.mount(GRAPH);
    cy.get('cup-node[node-id="a"]').click();
    cy.get('cup-edge[from="a"][to="b"]').should('have.attr', 'active');
    cy.get('cup-edge[from="b"][to="c"]').should('not.have.attr', 'active');
  });

  it('emits cup-graph-select', () => {
    cy.mount(GRAPH);
    cy.get('cup-graph').then(($g) => {
      const handler = cy.stub().as('select');
      $g[0].addEventListener('cup-graph-select', (e) => handler(e.detail.id));
    });
    cy.get('cup-node[node-id="b"]').click();
    cy.get('@select').should('have.been.calledWith', 'b');
  });

  it('clears the selection on a background click', () => {
    cy.mount(GRAPH);
    cy.get('cup-node[node-id="b"]').click();
    cy.get('cup-graph').click(5, 5);
    cy.get('cup-graph').should('not.have.attr', 'selected');
    cy.get('cup-node[node-id="a"]').should('not.have.attr', 'state');
  });

  it('selects with the keyboard', () => {
    cy.mount(GRAPH);
    cy.get('cup-node[node-id="c"]').should('have.attr', 'tabindex', '0').focus().type('{enter}');
    cy.get('cup-graph').should(($g) => expect($g[0].getAttribute('selected')).to.equal('c'));
  });

  it('moves a node by dragging and the edges follow', () => {
    cy.mount(GRAPH);
    drag('b', 60, 30);
    cy.get('cup-node[node-id="b"]').should('have.attr', 'x', '380').and('have.attr', 'y', '190');
    cy.document().should((doc) => {
      const b = box(node(doc, 'b'));
      expect(Number(edge(doc, 'a', 'b').getAttribute('x2'))).to.eq(b.x);
      expect(b.x).to.eq(380);
    });
  });

  it('emits cup-graph-change with the full spec after a drag', () => {
    cy.mount(GRAPH);
    cy.get('cup-graph').then(($g) => {
      const handler = cy.stub().as('change');
      $g[0].addEventListener('cup-graph-change', (e) => handler(e.detail.spec));
    });
    drag('b', 60, 30);
    cy.get('@change').should('have.been.calledOnce').then((stub) => {
      const spec = stub.getCall(0).args[0];
      expect(spec.nodes.find((n) => n.id === 'b')).to.include({ x: 380, y: 190 });
      expect(spec.edges).to.have.length(2);
    });
  });

  it('does not select when a drag ends', () => {
    cy.mount(GRAPH);
    drag('b', 60, 30);
    cy.get('cup-graph').should('not.have.attr', 'selected');
  });

  it('moves a node with the arrow keys', () => {
    cy.mount(GRAPH);
    cy.get('cup-node[node-id="a"]').focus().type('{rightarrow}{downarrow}');
    cy.get('cup-node[node-id="a"]').should('have.attr', 'x', '30').and('have.attr', 'y', '50');
  });

  it('does not move nodes when readonly, but still selects', () => {
    cy.mount(GRAPH.replace('<cup-graph id="g">', '<cup-graph id="g" readonly>'));
    drag('b', 60, 30);
    cy.get('cup-node[node-id="b"]').should('have.attr', 'x', '320');
    cy.get('cup-node[node-id="b"]').click();
    cy.get('cup-graph').should(($g) => expect($g[0].getAttribute('selected')).to.equal('b'));
  });

  it('reads the graph out as a spec', () => {
    cy.mount(GRAPH);
    cy.get('cup-graph').should(($g) => {
      const spec = $g[0].spec;
      expect(spec.nodes.map((n) => n.id)).to.deep.eq(['a', 'b', 'c']);
      expect(spec.nodes[0]).to.deep.eq({ id: 'a', label: 'Alpha', shape: 'rect', verification: 'none', x: 20, y: 40 });
      expect(spec.edges[0]).to.deep.eq({ from: 'a', to: 'b', label: 'first' });
      expect(spec.edges[1]).to.deep.eq({ from: 'b', to: 'c' });
    });
  });

  it('builds the graph from a spec', () => {
    cy.mount('<cup-graph></cup-graph>');
    cy.get('cup-graph').then(($g) => {
      $g[0].spec = {
        nodes: [
          { id: 'p', label: 'Plan', shape: 'pill', x: 10, y: 10, role: 'input' },
          { id: 'q', label: 'Check', x: 300, y: 10, metric: 40, metricLabel: 'Coverage',
            verification: 'verified', evidence: 'pytest: 9 passed' },
        ],
        edges: [{ from: 'p', to: 'q', label: 'then' }],
      };
    });
    cy.get('cup-node[node-id="p"] .cup-node').should('have.class', 'cup-node--pill');
    cy.get('cup-node[node-id="q"] cup-progress').should('have.attr', 'value', '40');
    cy.get('cup-node[node-id="q"] .cup-node___evidence').should('have.text', 'pytest: 9 passed');
    cy.get('cup-edge[from="p"][to="q"] .cup-edge___label-text').should('have.text', 'then');
  });

  it('round-trips a spec', () => {
    const spec = {
      nodes: [
        { id: 'p', label: 'Plan', shape: 'pill', x: 10, y: 10, role: 'input', verification: 'none' },
        { id: 'q', label: 'Check', shape: 'rect', x: 300, y: 10, metric: 40, metricLabel: 'Coverage',
          verification: 'claimed' },
      ],
      edges: [{ from: 'p', to: 'q', label: 'then' }],
    };
    cy.mount('<cup-graph></cup-graph>');
    cy.get('cup-graph').then(($g) => { $g[0].spec = spec; });
    cy.get('cup-graph').should(($g) => {
      expect($g[0].spec).to.deep.eq(spec);
    });
  });

  it('does not treat spec strings as markup', () => {
    cy.mount('<cup-graph></cup-graph>');
    cy.get('cup-graph').then(($g) => {
      $g[0].spec = { nodes: [{ id: 'x', label: '<img src=x onerror=alert(1)>', x: 0, y: 0 }], edges: [] };
    });
    cy.get('cup-node .cup-node___label').should('contain.text', '<img');
    cy.get('cup-graph img').should('not.exist');
  });

  const pair = (bx, by, extra = '') => `<cup-graph>
    <cup-node node-id="a" label="Alpha" x="300" y="300"></cup-node>
    <cup-node node-id="b" label="Beta" x="${bx}" y="${by}"></cup-node>
    <cup-edge from="a" to="b" ${extra}></cup-edge>
  </cup-graph>`;

  it('leaves by the bottom and enters by the top when the target is below', () => {
    cy.mount(pair(300, 500));
    cy.get('cup-edge').should('have.attr', 'start-side', 'bottom').and('have.attr', 'end-side', 'top');
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const b = box(node(doc, 'b'));
      const e = edge(doc, 'a', 'b');
      expect(Number(e.getAttribute('x1'))).to.eq(a.x + a.w / 2);
      expect(Number(e.getAttribute('y1'))).to.eq(a.y + a.h);
      expect(Number(e.getAttribute('x2'))).to.eq(b.x + b.w / 2);
      expect(Number(e.getAttribute('y2'))).to.eq(b.y);
    });
  });

  it('leaves by the top when the target is above', () => {
    cy.mount(pair(300, 100));
    cy.get('cup-edge').should('have.attr', 'start-side', 'top').and('have.attr', 'end-side', 'bottom');
  });

  it('uses the facing left and right sides when the target is mostly sideways', () => {
    cy.mount(pair(700, 380));
    cy.get('cup-edge').should('have.attr', 'start-side', 'right').and('have.attr', 'end-side', 'left');
  });

  it('uses the vertical sides when the target is mostly above or below', () => {
    cy.mount(pair(380, 700));
    cy.get('cup-edge').should('have.attr', 'start-side', 'bottom').and('have.attr', 'end-side', 'top');
  });

  it('re-picks sides when a node moves', () => {
    cy.mount(pair(700, 300));
    cy.get('cup-edge').should('have.attr', 'start-side', 'right');
    cy.get('cup-node[node-id="b"]').then(($b) => {
      $b[0].setAttribute('x', '300');
      $b[0].setAttribute('y', '600');
    });
    cy.get('cup-edge').should('have.attr', 'start-side', 'bottom').and('have.attr', 'end-side', 'top');
  });

  it('respects pinned sides', () => {
    cy.mount(pair(700, 500, 'from-side="bottom" to-side="left"'));
    cy.get('cup-edge').should('have.attr', 'start-side', 'bottom').and('have.attr', 'end-side', 'left');
  });

  it('carries pinned sides through the spec', () => {
    cy.mount('<cup-graph></cup-graph>');
    cy.get('cup-graph').then(($g) => {
      $g[0].spec = {
        nodes: [{ id: 'a', label: 'A', x: 0, y: 0 }, { id: 'b', label: 'B', x: 400, y: 300 }],
        edges: [{ from: 'a', to: 'b', fromSide: 'bottom', toSide: 'left' }],
      };
    });
    cy.get('cup-edge').should('have.attr', 'start-side', 'bottom').and('have.attr', 'end-side', 'left');
    cy.get('cup-graph').should(($g) => {
      expect($g[0].spec.edges[0]).to.deep.eq({ from: 'a', to: 'b', fromSide: 'bottom', toSide: 'left' });
    });
  });

  const coords = (e) => ['x1', 'y1', 'x2', 'y2'].map((k) => Number(e.getAttribute(k)));
  const two = (a, b) => `<cup-graph>
    <cup-node node-id="a" label="Alpha" ${a}></cup-node>
    <cup-node node-id="b" label="Beta" ${b}></cup-node>
    <cup-edge from="a" to="b"></cup-edge>
  </cup-graph>`;

  it('draws a straight horizontal wire when the rows overlap', () => {
    cy.mount(two('x="20" y="100"', 'x="400" y="120"'));
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const b = box(node(doc, 'b'));
      const [, y1, , y2] = coords(edge(doc, 'a', 'b'));
      expect(y1).to.eq(y2);
      expect(y1).to.be.within(b.y, a.y + a.h);
    });
  });

  it('draws a straight vertical wire when the columns overlap', () => {
    cy.mount(two('x="100" y="20"', 'x="160" y="300"'));
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const b = box(node(doc, 'b'));
      const [x1, , x2] = coords(edge(doc, 'a', 'b'));
      expect(x1).to.eq(x2);
      expect(x1).to.be.within(b.x, a.x + a.w);
    });
  });

  it('keeps the wire off the corners when straightening', () => {
    cy.mount(two('x="20" y="100"', 'x="400" y="120"'));
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const b = box(node(doc, 'b'));
      const [, y1] = coords(edge(doc, 'a', 'b'));
      expect(y1).to.be.at.least(b.y + 8);
      expect(y1).to.be.at.most(a.y + a.h - 8);
    });
  });

  it('bends from the side midpoints when the nodes do not overlap', () => {
    cy.mount(two('x="20" y="100"', 'x="400" y="300"'));
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const b = box(node(doc, 'b'));
      const [, y1, , y2] = coords(edge(doc, 'a', 'b'));
      expect(y1).to.eq(a.y + a.h / 2);
      expect(y2).to.eq(b.y + b.h / 2);
    });
  });

  it('straightens through the tip of a pill, where its side actually is', () => {
    cy.mount(two('x="20" y="100" shape="pill"', 'x="400" y="110"'));
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const [, y1, , y2] = coords(edge(doc, 'a', 'b'));
      expect(y1).to.eq(a.y + a.h / 2);
      expect(y2).to.eq(y1);
    });
  });

  it('does not straighten a pill off its tip', () => {
    cy.mount(two('x="20" y="100" shape="pill"', 'x="400" y="130"'));
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const b = box(node(doc, 'b'));
      const [, y1, , y2] = coords(edge(doc, 'a', 'b'));
      expect(y1).to.eq(a.y + a.h / 2);
      expect(y2).to.eq(b.y + b.h / 2);
    });
  });

  const pos = (doc, id) => [Number(node(doc, id).getAttribute('x')), Number(node(doc, id).getAttribute('y'))];
  const setSpec = (spec, attrs = '') => {
    cy.mount(`<cup-graph ${attrs}></cup-graph>`);
    cy.get('cup-graph').then(($g) => { $g[0].spec = spec; });
  };
  const N = (id) => ({ id, label: id.toUpperCase() });

  it('lays a chain out left to right on one row when no positions are given', () => {
    setSpec({ nodes: [N('a'), N('b'), N('c')], edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }] }, 'direction="right"');
    cy.document().should((doc) => {
      const [ax, ay] = pos(doc, 'a');
      const [bx, by] = pos(doc, 'b');
      const [cx, cy2] = pos(doc, 'c');
      expect(bx).to.be.greaterThan(ax);
      expect(cx).to.be.greaterThan(bx);
      expect(by).to.eq(ay);
      expect(cy2).to.eq(ay);
    });
  });

  it('places a node after everything that feeds it', () => {
    setSpec({
      nodes: [N('a'), N('b'), N('c'), N('d')],
      edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'a', to: 'd' }, { from: 'c', to: 'd' }],
    }, 'direction="right"');
    cy.document().should((doc) => {
      expect(pos(doc, 'd')[0]).to.be.greaterThan(pos(doc, 'c')[0]);
    });
  });

  it('stacks siblings in a column and centers their parent between them', () => {
    setSpec({ nodes: [N('a'), N('b'), N('c')], edges: [{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }] }, 'direction="right"');
    cy.document().should((doc) => {
      const [, ay] = pos(doc, 'a');
      const [bx, by] = pos(doc, 'b');
      const [cx, cy2] = pos(doc, 'c');
      expect(bx).to.eq(cx);
      expect(by).to.not.eq(cy2);
      expect(ay).to.eq((by + cy2) / 2);
    });
  });

  it('leaves given positions alone', () => {
    setSpec({ nodes: [{ id: 'a', label: 'A', x: 500, y: 400 }, N('b')], edges: [{ from: 'a', to: 'b' }] });
    cy.document().should((doc) => {
      expect(pos(doc, 'a')).to.deep.eq([500, 400]);
      expect(node(doc, 'b').hasAttribute('x')).to.eq(true);
    });
  });

  it('lays out a cycle without hanging', () => {
    setSpec({ nodes: [N('a'), N('b')], edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }] });
    cy.get('cup-node[node-id="b"]').should('have.attr', 'x');
  });

  it('reports the positions it chose in the spec', () => {
    setSpec({ nodes: [N('a'), N('b')], edges: [{ from: 'a', to: 'b' }] }, 'direction="right"');
    cy.get('cup-graph').should(($g) => {
      const { nodes } = $g[0].spec;
      expect(nodes[1].x).to.be.greaterThan(nodes[0].x);
    });
  });

  it('has no problems for a sound graph', () => {
    cy.mount(GRAPH);
    cy.get('cup-graph').should(($g) => {
      expect($g[0].problems).to.deep.eq([]);
    });
  });

  it('reports an edge that names a missing node', () => {
    setSpec({ nodes: [N('a')], edges: [{ from: 'a', to: 'ghost' }] });
    cy.get('cup-graph').should(($g) => {
      expect($g[0].problems).to.deep.eq(['edge a -> ghost: no node with id "ghost"']);
    });
  });

  it('reports duplicate and missing node ids', () => {
    setSpec({ nodes: [N('a'), N('a'), { label: 'Nameless' }], edges: [] });
    cy.get('cup-graph').should(($g) => {
      expect($g[0].problems).to.include('node id "a" is used 2 times');
      expect($g[0].problems).to.include('a node has no id');
    });
  });

  it('reports verified without evidence', () => {
    setSpec({ nodes: [{ id: 'a', label: 'A', verification: 'verified' }], edges: [] });
    cy.get('cup-graph').should(($g) => {
      expect($g[0].problems).to.deep.eq(['node "a": verified without evidence, shown as claimed']);
    });
  });

  it('loads a spec from src', () => {
    cy.mount('<cup-graph src="/cypress/fixtures-diagram/chain.diagram.json"></cup-graph>');
    cy.get('cup-node[node-id="b"] .cup-node___label').should('have.text', 'Beta');
    cy.get('cup-edge[from="a"][to="b"] .cup-edge___label-text').should('have.text', 'then');
  });

  it('emits cup-graph-load with the loaded document', () => {
    cy.mount('<div id="host"></div>');
    cy.document().then((doc) => {
      const handler = cy.stub().as('load');
      doc.querySelector('#host').addEventListener('cup-graph-load', (e) => handler(e.detail.document.title));
      doc.querySelector('#host').innerHTML = '<cup-graph src="/cypress/fixtures-diagram/chain.diagram.json"></cup-graph>';
    });
    cy.get('@load').should('have.been.calledWith', 'Chain fixture');
  });

  it('emits cup-graph-error when src cannot be loaded', () => {
    cy.mount('<div id="host"></div>');
    cy.document().then((doc) => {
      const handler = cy.stub().as('error');
      doc.querySelector('#host').addEventListener('cup-graph-error', handler);
      doc.querySelector('#host').innerHTML = '<cup-graph src="/nope.json"></cup-graph>';
    });
    cy.get('@error').should('have.been.calledOnce');
  });

  it('spaces columns so the longest edge label fits between nodes', () => {
    setSpec({
      nodes: [N('a'), N('b')],
      edges: [{ from: 'a', to: 'b', label: 'a fairly long label on this edge' }],
    }, 'direction="right"');
    cy.document().should((doc) => {
      const a = box(node(doc, 'a'));
      const b = box(node(doc, 'b'));
      const labelWidth = Number(doc.querySelector('.cup-edge___label-box').getAttribute('width'));
      expect(b.x - (a.x + a.w)).to.be.at.least(labelWidth);
    });
  });

  it('always states verification in the spec, as none when there is no status', () => {
    setSpec({ nodes: [N('a'), { id: 'b', label: 'B', verification: 'claimed' }], edges: [] });
    cy.get('cup-graph').should(($g) => {
      expect($g[0].spec.nodes.map((n) => n.verification)).to.deep.eq(['none', 'claimed']);
    });
  });

  it('shows no status for verification none', () => {
    setSpec({ nodes: [{ id: 'a', label: 'A', verification: 'none' }], edges: [] });
    cy.get('cup-node .cup-node___label').should('exist');
    cy.get('cup-node .cup-node___status').should('not.exist');
    cy.get('cup-graph').should(($g) => expect($g[0].problems).to.deep.eq([]));
  });

  it('reports an unknown verification value', () => {
    setSpec({ nodes: [{ id: 'a', label: 'A', verification: 'done' }], edges: [] });
    cy.get('cup-graph').should(($g) => {
      expect($g[0].problems).to.deep.eq(['node "a": unknown verification "done"']);
    });
  });

  it('lays a chain out top to bottom by default', () => {
    cy.mount('<cup-graph></cup-graph>');
    cy.get('cup-graph').then(($g) => {
      $g[0].spec = { nodes: [N('a'), N('b'), N('c')], edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }] };
    });
    cy.document().should((doc) => {
      const [ax, ay] = pos(doc, 'a');
      const [bx, by] = pos(doc, 'b');
      const [cx, cy2] = pos(doc, 'c');
      expect([bx, cx]).to.deep.eq([ax, ax]);
      expect(by).to.be.greaterThan(ay);
      expect(cy2).to.be.greaterThan(by);
    });
    cy.get('cup-edge[from="a"]').should('have.attr', 'start-side', 'bottom').and('have.attr', 'end-side', 'top');
  });

  it('carries why through the spec', () => {
    setSpec({ nodes: [{ id: 'a', label: 'A', why: 'because' }], edges: [] });
    cy.get('cup-node .cup-node___why').should('have.text', 'because');
    cy.get('cup-graph').should(($g) => expect($g[0].spec.nodes[0].why).to.eq('because'));
  });
});
