// render_builder.js — Filter: renders organism builder with SVG creature.
// Supports multiple organism types with type-specific shapes and colors.
// Reads: shapes (from /api/shapes)
// Writes: builderRendered

export class FetchShapes {
  async call(payload) {
    try {
      const resp = await fetch('/api/shapes');
      const data = await resp.json();
      return payload.insert('shapes', data);
    } catch {
      return payload.insert('shapes', null);
    }
  }
}

export class RenderBuilder {
  constructor() {
    this._selectedType = 'research';
    this._config = {
      sensors: ['text'],
      core: ['ingest', 'score', 'gate', 'remember', 'reason', 'guard'],
      limbs: ['python_executor'],
      hooks: ['lifecycle_recorder'],
    };
  }

  async call(payload) {
    const shapes = payload.get('shapes');
    if (!shapes) return payload.insert('builderRendered', false);

    this._shapes = shapes;
    this._types = shapes.types || [];
    this._renderTypeSelector();
    this._selectType(this._selectedType);
    this._wireSpawn();
    this._initDragEngine();

    return payload.insert('builderRendered', true);
  }

  // ── Type selector (SPORE creature picker) ────────────────────

  _renderTypeSelector() {
    const container = document.getElementById('type-selector');
    if (!container) return;

    container.innerHTML = this._types.map(t => {
      const cls = t.id === this._selectedType
        ? 'arc-type-card arc-type-card--active' : 'arc-type-card';
      return `
        <button class="${cls}" data-type-id="${t.id}" type="button"
                style="--type-color: ${t.color}">
          <span class="arc-type-icon">${t.icon}</span>
          <span class="arc-type-name">${this._esc(t.name)}</span>
          <span class="arc-type-desc">${this._esc(t.desc)}</span>
        </button>`;
    }).join('');

    container.querySelectorAll('.arc-type-card').forEach(card => {
      card.addEventListener('click', () => {
        this._selectType(card.dataset.typeId);
      });
    });
  }

  _selectType(typeId) {
    const typeDef = this._types.find(t => t.id === typeId);
    if (!typeDef) return;

    this._selectedType = typeId;
    this._typeColor = typeDef.color;

    // Apply default shape
    const d = typeDef.defaults;
    this._config = {
      sensors: [...(d.sensors || ['text'])],
      core: [...(d.core || ['ingest', 'score', 'gate'])],
      limbs: [...(d.limbs || [])],
      hooks: [...(d.hooks || ['lifecycle_recorder'])],
    };

    // Highlight active type card
    document.querySelectorAll('.arc-type-card').forEach(c => {
      c.classList.toggle('arc-type-card--active', c.dataset.typeId === typeId);
    });

    // Update config fields visibility
    this._renderConfigFields(typeDef);

    // Re-render parts and creature
    this._renderPartSelectors();
    this._renderOrganism();
    this._wirePartClicks();
    this._initDragEngine();

    // Update name display
    const nameEl = document.getElementById('organism-name-display');
    if (nameEl) nameEl.textContent = typeDef.name;
  }

  _renderConfigFields(typeDef) {
    const fields = typeDef.config_fields || [];
    const scaleGroup = document.getElementById('config-scale');
    const timeoutGroup = document.getElementById('config-timeout');
    const gateGroup = document.getElementById('config-gate');
    if (scaleGroup) scaleGroup.style.display = fields.includes('scale') ? '' : 'none';
    if (timeoutGroup) timeoutGroup.style.display = fields.includes('timeout') ? '' : 'none';
    if (gateGroup) gateGroup.style.display = fields.includes('gate_threshold') ? '' : 'none';
  }

  // ── Part selector chips ──────────────────────────────────────

  _renderPartSelectors() {
    const s = this._shapes;
    this._renderGroup('sensor-parts', s.sensors, this._config.sensors, 'sensors');
    this._renderGroup('core-parts', s.core, this._config.core, 'core');
    this._renderGroup('limb-parts', s.limbs, this._config.limbs, 'limbs');
    this._renderGroup('hook-parts', s.hooks, this._config.hooks, 'hooks');
  }

  _renderGroup(containerId, parts, active, groupKey) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = parts.map(part => {
      const isActive = active.includes(part.id);
      const isRequired = part.required === true;
      const cls = [
        'arc-part-chip',
        isActive ? 'arc-part-chip--active' : '',
        isRequired ? 'arc-part-chip--required' : '',
      ].filter(Boolean).join(' ');

      const layerBadge = part.layer ? `<span class="arc-part-layer">${part.layer}</span>` : '';
      const regionTag = part.region ? `<span class="arc-part-region">${part.region}</span>` : '';

      return `
        <button class="${cls}"
                data-part-id="${part.id}"
                data-group="${groupKey}"
                ${isRequired ? 'title="Required — cannot remove"' : `title="${this._esc(part.desc)}"`}
                type="button">
          ${layerBadge}
          <span class="arc-part-name">${this._esc(part.name)}</span>
          ${regionTag}
        </button>`;
    }).join('');
  }

  // ── SVG organism rendering ───────────────────────────────────

  _renderOrganism() {
    this._drawSensors();
    this._drawCore();
    this._drawLimbs();
    this._drawHooks();
    this._drawConnections();

    // Tint SVG glow to type color
    const svg = document.getElementById('organism-svg');
    if (svg) svg.style.setProperty('--organism-color', this._typeColor || '#6366f1');
  }

  _drawSensors() {
    const g = document.getElementById('svg-sensors');
    if (!g) return;

    const sensors = this._config.sensors;
    const n = sensors.length;
    const color = this._typeColor || '#6366f1';
    let html = '';

    const sensorShapes = {
      text: (x, y) => `
        <circle cx="${x}" cy="${y}" r="12" fill="var(--cup-color-surface)" stroke="${color}" stroke-width="2"/>
        <circle cx="${x}" cy="${y}" r="5" fill="${color}">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
        </circle>`,
      keyword: (x, y) => `
        <rect x="${x - 10}" y="${y - 8}" width="20" height="16" rx="4"
              fill="var(--cup-color-surface)" stroke="${color}" stroke-width="2"/>
        <line x1="${x - 4}" y1="${y - 2}" x2="${x + 4}" y2="${y - 2}" stroke="${color}" stroke-width="1.5"/>
        <line x1="${x - 4}" y1="${y + 2}" x2="${x + 2}" y2="${y + 2}" stroke="${color}" stroke-width="1.5"/>`,
      pattern: (x, y) => `
        <polygon points="${x},${y - 12} ${x + 11},${y + 6} ${x - 11},${y + 6}"
                 fill="var(--cup-color-surface)" stroke="${color}" stroke-width="2"/>
        <circle cx="${x}" cy="${y}" r="4" fill="${color}" opacity="0.7">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
        </circle>`,
      threshold: (x, y) => `
        <circle cx="${x}" cy="${y}" r="11" fill="none" stroke="${color}" stroke-width="2"/>
        <line x1="${x}" y1="${y}" x2="${x + 7}" y2="${y - 4}" stroke="${color}" stroke-width="2" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate"
            values="0 ${x} ${y};60 ${x} ${y};0 ${x} ${y}" dur="3s" repeatCount="indefinite"/>
        </line>`,
    };

    sensors.forEach((id, i) => {
      const angle = ((i - (n - 1) / 2) * 45) * (Math.PI / 180);
      const x = Math.sin(angle) * 60;
      const y = -Math.cos(angle) * 40 - 20;

      html += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="${color}" stroke-width="2" opacity="0.5"/>`;
      const drawFn = sensorShapes[id] || sensorShapes.text;
      html += drawFn(x, y);
      html += `<text x="${x}" y="${y + 22}" text-anchor="middle"
                     fill="var(--cup-color-text-muted)" font-size="8"
                     font-family="var(--cup-font-mono)">${id}</text>`;
    });

    g.innerHTML = html;
  }

  _drawCore() {
    const g = document.getElementById('svg-core');
    if (!g) return;

    const layers = this._config.core;
    const typeColor = this._typeColor || '#6366f1';
    let html = '';

    const colors = {
      ingest: '#6366f1', score: '#8b5cf6', gate: '#a78bfa',
      remember: '#22c55e', reason: '#3b82f6', guard: '#ef4444',
    };

    const ringGap = Math.min(12, 60 / Math.max(layers.length, 1));
    layers.forEach((id, i) => {
      const radius = 85 - (i * ringGap);
      const color = colors[id] || typeColor;
      const opacity = 0.12 + (i * 0.06);

      html += `<ellipse cx="0" cy="0" rx="${radius}" ry="${radius * 0.75}"
                        fill="${color}" fill-opacity="${opacity}"
                        stroke="${color}" stroke-width="1.5" stroke-opacity="0.4">
                 <animate attributeName="rx" values="${radius};${radius + 2};${radius}"
                          dur="${3 + i * 0.4}s" repeatCount="indefinite"/>
               </ellipse>`;
    });

    // Nucleus — type-specific icon
    const typeIcons = {
      base: '🧬', research: '🔬', browser: '🌐', agent: '🤖', sentinel: '🛡',
    };
    const icon = typeIcons[this._selectedType] || '⚛';
    html += `<circle cx="0" cy="0" r="18" fill="${typeColor}" opacity="0.85" filter="url(#glow-filter)">
               <animate attributeName="r" values="16;20;16" dur="2.5s" repeatCount="indefinite"/>
             </circle>`;
    html += `<text x="0" y="6" text-anchor="middle" font-size="14">${icon}</text>`;

    // Layer labels
    layers.forEach((id, i) => {
      const y = -55 + (i * 18);
      const color = colors[id] || typeColor;
      html += `<text x="100" y="${y}" fill="${color}" font-size="9"
                     font-family="var(--cup-font-mono)" opacity="0.7">${id}</text>`;
      html += `<line x1="88" y1="${y - 3}" x2="96" y2="${y - 3}"
                     stroke="${color}" stroke-width="1" opacity="0.3"/>`;
    });

    g.innerHTML = html;
  }

  _drawLimbs() {
    const g = document.getElementById('svg-limbs');
    if (!g) return;

    const limbs = this._config.limbs;
    let html = '';

    const limbMeta = {
      python_executor: { color: '#22c55e', icon: '⌨' },
      browser:         { color: '#3b82f6', icon: '🌐' },
      database:        { color: '#f59e0b', icon: '🗄' },
      file_system:     { color: '#8b5cf6', icon: '📁' },
      mcp:             { color: '#ec4899', icon: '🔌' },
    };

    if (limbs.length === 0) {
      html += `<text x="0" y="10" text-anchor="middle"
                     fill="var(--cup-color-text-muted)" font-size="9"
                     font-style="italic" opacity="0.5">no limbs</text>`;
    }

    limbs.forEach((id, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const x = side * (65 + row * 25);
      const y = row * 30;
      const meta = limbMeta[id] || { color: '#6366f1', icon: '🔧' };

      html += `<line x1="0" y1="0" x2="${x * 0.4}" y2="${y * 0.3}"
                     stroke="${meta.color}" stroke-width="3" opacity="0.4" stroke-linecap="round"/>`;
      html += `<line x1="${x * 0.4}" y1="${y * 0.3}" x2="${x}" y2="${y}"
                     stroke="${meta.color}" stroke-width="2" opacity="0.4" stroke-linecap="round"/>`;
      html += `<rect x="${x - 14}" y="${y - 10}" width="28" height="20" rx="6"
                     fill="${meta.color}" fill-opacity="0.15" stroke="${meta.color}" stroke-width="1.5"/>`;
      html += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11">${meta.icon}</text>`;
      html += `<text x="${x}" y="${y + 22}" text-anchor="middle"
                     fill="var(--cup-color-text-muted)" font-size="7"
                     font-family="var(--cup-font-mono)">${id.replace(/_/g, ' ')}</text>`;
    });

    g.innerHTML = html;
  }

  _drawHooks() {
    const g = document.getElementById('svg-hooks');
    if (!g) return;

    const hooks = this._config.hooks;
    let html = '';

    hooks.forEach((id, i) => {
      const angle = (i * (360 / Math.max(hooks.length, 1)) + 30) * (Math.PI / 180);
      const r = 115;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * 0.7;

      html += `<ellipse cx="0" cy="0" rx="${r}" ry="${r * 0.7}"
                        fill="none" stroke="#f59e0b" stroke-width="0.5"
                        stroke-dasharray="3 5" opacity="0.15"
                        transform="rotate(${i * (360 / Math.max(hooks.length, 1)) + 30})"/>`;
      html += `<circle cx="${x}" cy="${y}" r="5" fill="#f59e0b" opacity="0.6">
                 <animateTransform attributeName="transform" type="rotate"
                   values="0 0 0;360 0 0" dur="${7 + i * 3}s" repeatCount="indefinite"/>
               </circle>`;
      html += `<text x="${x}" y="${y + 14}" text-anchor="middle"
                     fill="var(--cup-color-text-muted)" font-size="7"
                     font-family="var(--cup-font-mono)">${id.replace(/_/g, ' ')}</text>`;
    });

    g.innerHTML = html;
  }

  _drawConnections() {
    const g = document.getElementById('svg-connections');
    if (!g) return;

    const color = this._typeColor || '#6366f1';
    let html = '';

    html += `<line x1="200" y1="75" x2="200" y2="185"
                   stroke="${color}" stroke-width="1" opacity="0.15"
                   stroke-dasharray="4 4">
               <animate attributeName="stroke-dashoffset" values="0;-8" dur="1s" repeatCount="indefinite"/>
             </line>`;

    if (this._config.limbs.length > 0) {
      html += `<line x1="200" y1="335" x2="200" y2="355"
                     stroke="${color}" stroke-width="1" opacity="0.15"
                     stroke-dasharray="4 4">
                 <animate attributeName="stroke-dashoffset" values="0;-8" dur="1s" repeatCount="indefinite"/>
               </line>`;
    }

    g.innerHTML = html;
  }

  // ── Interactive wiring ───────────────────────────────────────

  _wirePartClicks() {
    document.querySelectorAll('.arc-part-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const partId = chip.dataset.partId;
        const group = chip.dataset.group;
        if (chip.classList.contains('arc-part-chip--required')) return;

        const list = this._config[group];
        const idx = list.indexOf(partId);
        if (idx >= 0) {
          list.splice(idx, 1);
          chip.classList.remove('arc-part-chip--active');
        } else {
          list.push(partId);
          chip.classList.add('arc-part-chip--active');
        }

        this._renderOrganism();
      });
    });
  }

  _wireSpawn() {
    const btn = document.getElementById('spawn-organism');
    const status = document.getElementById('spawn-status');
    if (!btn) return;

    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', async () => {
      const type = this._selectedType;
      const scale = document.getElementById('builder-scale')?.value || 'small';
      const timeout = parseInt(document.getElementById('builder-timeout')?.value || '120', 10);
      const gateThreshold = parseFloat(document.getElementById('builder-gate')?.value || '0.2');

      newBtn.disabled = true;
      status.textContent = 'Spawning…';
      status.className = 'arc-spawn-status';

      const body = {
        type,
        scale,
        timeout,
        gate_threshold: gateThreshold,
        shape: {
          sensors: [...this._config.sensors],
          core: [...this._config.core],
          limbs: [...this._config.limbs],
          hooks: [...this._config.hooks],
        },
      };

      try {
        const resp = await fetch('/api/spawn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await resp.json();
        if (data.session_id || data.pid) {
          status.textContent = `Spawned! PID ${data.pid}`;
          status.className = 'arc-spawn-status arc-spawn-status--ok';
          setTimeout(() => {
            window.arcDashboard?.showPanel?.('active');
            window.arcDashboard?.refreshActive?.();
          }, 1500);
        } else {
          status.textContent = data.error || 'Failed';
          status.className = 'arc-spawn-status arc-spawn-status--error';
        }
      } catch (err) {
        status.textContent = String(err);
        status.className = 'arc-spawn-status arc-spawn-status--error';
      }

      newBtn.disabled = false;
    });
  }

  // ── Drag-and-Drop Engine ─────────────────────────────────────

  _initDragEngine() {
    // Use event delegation on the controls container
    const controls = document.querySelector('.arc-builder-controls');
    if (!controls || controls._dragWired) return;
    controls._dragWired = true;

    controls.addEventListener('pointerdown', (e) => {
      const chip = e.target.closest('.arc-part-chip');
      if (!chip) return;
      if (chip.classList.contains('arc-part-chip--required')) return;
      this._onDragStart(e, chip);
    });
  }

  _onDragStart(e, chip) {
    e.preventDefault();
    const partId = chip.dataset.partId;
    const group = chip.dataset.group;
    const partName = chip.querySelector('.arc-part-name')?.textContent || partId;

    // Create ghost
    const ghost = document.createElement('div');
    ghost.className = 'arc-drag-ghost';
    ghost.textContent = partName;
    ghost.style.left = `${e.clientX - 30}px`;
    ghost.style.top = `${e.clientY - 15}px`;
    document.body.appendChild(ghost);
    document.body.classList.add('arc-dragging');

    // Activate drop zones
    const zones = document.querySelectorAll('.arc-drop-zone');
    zones.forEach(z => {
      z.classList.add('arc-drop-zone--visible');
      if (z.dataset.zone === group) {
        z.classList.add('arc-drop-zone--compatible');
      } else {
        z.classList.add('arc-drop-zone--reject');
      }
    });

    // Dim the source chip
    chip.style.opacity = '0.4';

    let hoveredZone = null;

    const onMove = (ev) => {
      ghost.style.left = `${ev.clientX - 30}px`;
      ghost.style.top = `${ev.clientY - 15}px`;

      // Hit-test drop zones
      let found = null;
      zones.forEach(z => {
        const rect = z.getBoundingClientRect();
        const over = ev.clientX >= rect.left && ev.clientX <= rect.right &&
                     ev.clientY >= rect.top && ev.clientY <= rect.bottom;
        const compatible = z.dataset.zone === group;
        z.classList.toggle('arc-drop-zone--hover', over && compatible);
        if (over && compatible) found = z;
      });
      hoveredZone = found;
    };

    const onUp = (ev) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      ghost.remove();
      document.body.classList.remove('arc-dragging');
      chip.style.opacity = '';

      // Reset zones
      zones.forEach(z => {
        z.classList.remove(
          'arc-drop-zone--visible', 'arc-drop-zone--compatible',
          'arc-drop-zone--hover', 'arc-drop-zone--reject'
        );
      });

      // If dropped on compatible zone, add the part
      if (hoveredZone && hoveredZone.dataset.zone === group) {
        const list = this._config[group];
        if (!list.includes(partId)) {
          list.push(partId);
          // Flash the chip as "just placed"
          const targetChip = document.querySelector(
            `.arc-part-chip[data-part-id="${partId}"][data-group="${group}"]`
          );
          if (targetChip) {
            targetChip.classList.add('arc-part-chip--active', 'arc-part-chip--just-placed');
            setTimeout(() => targetChip.classList.remove('arc-part-chip--just-placed'), 500);
          }
          this._renderOrganism();
        }
      }
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  _esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
