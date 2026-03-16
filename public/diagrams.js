/* diagrams.js — SVG diagram engine for Anthropic Cert Prep */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  const COLORS = {
    accent: '#d97757',
    dark: '#141413',
    bg: '#faf9f5',
    muted: '#87867f',
    flowLine: '#b0aea5',
    nodeBorder: '#d1cdc4',
    nodeBg: '#ffffff',
    success: '#5a9a6e',
    warning: '#c4943d',
    dimmed: 'rgba(135,134,127,0.25)',
  };

  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function createSvg(container, viewBox) {
    const svg = svgEl('svg', {
      viewBox,
      width: '100%',
      style: 'max-height:500px;font-family:Inter,sans-serif;',
      preserveAspectRatio: 'xMidYMid meet',
    });
    container.appendChild(svg);
    return svg;
  }

  function addArrowDef(svg) {
    let defs = svg.querySelector('defs');
    if (!defs) { defs = svgEl('defs'); svg.prepend(defs); }
    if (svg.querySelector('#arrowhead')) return;
    const marker = svgEl('marker', {
      id: 'arrowhead', markerWidth: '10', markerHeight: '7',
      refX: '10', refY: '3.5', orient: 'auto', fill: COLORS.flowLine,
    });
    marker.appendChild(svgEl('polygon', { points: '0 0, 10 3.5, 0 7' }));
    defs.appendChild(marker);
  }

  function drawNode(svg, { x, y, w, h, label, id, rx = 12 }) {
    const g = svgEl('g', { 'data-node-id': id, cursor: 'pointer' });
    g.appendChild(svgEl('rect', {
      x, y, width: w, height: h, rx,
      fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5',
    }));
    const txt = svgEl('text', {
      x: x + w / 2, y: y + h / 2 + 5,
      'text-anchor': 'middle', fill: COLORS.dark,
      'font-size': '13', 'font-weight': '500',
    });
    txt.textContent = label;
    g.appendChild(txt);
    svg.appendChild(g);
    return g;
  }

  function drawArrow(svg, { x1, y1, x2, y2, label }) {
    addArrowDef(svg);
    svg.appendChild(svgEl('line', {
      x1, y1, x2, y2,
      stroke: COLORS.flowLine, 'stroke-width': '1.5',
      'marker-end': 'url(#arrowhead)',
    }));
    if (label) {
      const t = svgEl('text', {
        x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 6,
        'text-anchor': 'middle', fill: COLORS.muted,
        'font-size': '11',
      });
      t.textContent = label;
      svg.appendChild(t);
    }
  }

  function highlightNode(svg, nodeId) {
    const nodes = svg.querySelectorAll('[data-node-id]');
    nodes.forEach(g => {
      const rect = g.querySelector('rect');
      const text = g.querySelector('text');
      if (!rect) return;
      if (g.getAttribute('data-node-id') === nodeId) {
        rect.setAttribute('stroke', COLORS.accent);
        rect.setAttribute('stroke-width', '3');
        rect.setAttribute('fill', '#fef3ee');
        if (text) text.setAttribute('fill', COLORS.dark);
      } else {
        rect.setAttribute('stroke', COLORS.dimmed);
        rect.setAttribute('stroke-width', '1.5');
        rect.setAttribute('fill', '#f5f4f0');
        if (text) text.setAttribute('fill', COLORS.muted);
      }
    });
  }

  function highlightNodes(svg, nodeIds) {
    const set = new Set(Array.isArray(nodeIds) ? nodeIds : [nodeIds]);
    const nodes = svg.querySelectorAll('[data-node-id]');
    nodes.forEach(g => {
      const rect = g.querySelector('rect');
      const text = g.querySelector('text');
      if (!rect) return;
      if (set.has(g.getAttribute('data-node-id'))) {
        rect.setAttribute('stroke', COLORS.accent);
        rect.setAttribute('stroke-width', '3');
        rect.setAttribute('fill', '#fef3ee');
        if (text) text.setAttribute('fill', COLORS.dark);
      } else {
        rect.setAttribute('stroke', COLORS.dimmed);
        rect.setAttribute('stroke-width', '1.5');
        rect.setAttribute('fill', '#f5f4f0');
        if (text) text.setAttribute('fill', COLORS.muted);
      }
    });
  }

  function resetNodes(svg) {
    svg.querySelectorAll('[data-node-id]').forEach(g => {
      const rect = g.querySelector('rect');
      const text = g.querySelector('text');
      if (rect) {
        rect.setAttribute('stroke', COLORS.nodeBorder);
        rect.setAttribute('stroke-width', '1.5');
        rect.setAttribute('fill', COLORS.nodeBg);
      }
      if (text) text.setAttribute('fill', COLORS.dark);
    });
  }

  function initTooltips(container, diagramKey) {
    const diagram = DIAGRAMS[diagramKey];
    if (!diagram) return;
    const stepMap = {};
    diagram.steps.forEach(s => { stepMap[s.id] = s.description; });

    let tip = container.querySelector('.diagram-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'diagram-tooltip';
      Object.assign(tip.style, {
        position: 'absolute', display: 'none', pointerEvents: 'none',
        background: COLORS.dark, color: '#fff', padding: '6px 10px',
        borderRadius: '6px', fontSize: '12px', fontFamily: 'Inter,sans-serif',
        maxWidth: '220px', zIndex: '10', lineHeight: '1.4',
      });
      container.style.position = container.style.position || 'relative';
      container.appendChild(tip);
    }

    const svg = container.querySelector('svg');
    if (!svg) return;

    svg.querySelectorAll('[data-node-id]').forEach(g => {
      g.addEventListener('mouseenter', () => {
        const desc = stepMap[g.getAttribute('data-node-id')];
        if (desc) { tip.textContent = desc; tip.style.display = 'block'; }
      });
      g.addEventListener('mousemove', e => {
        const rect = container.getBoundingClientRect();
        tip.style.left = (e.clientX - rect.left + 12) + 'px';
        tip.style.top = (e.clientY - rect.top - 30) + 'px';
      });
      g.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    });
  }

  /* ---- Diagram definitions ---- */

  const DIAGRAMS = {};

  /* 1. Agentic Loop — Domain 1 */
  DIAGRAMS['agentic-loop'] = {
    title: 'Agentic Loop',
    domain: 1,
    steps: [
      { id: 'send', label: 'Send to Claude', description: 'Send the user message plus conversation history to the Claude API.' },
      { id: 'inspect', label: 'Inspect Response', description: 'Check if the response contains tool_use blocks or an end_turn stop reason.' },
      { id: 'execute', label: 'Execute Tools', description: 'Run each requested tool and collect results.' },
      { id: 'append', label: 'Append Results', description: 'Add tool results back into the conversation as tool_result messages.' },
      { id: 'loop', label: 'Loop Back', description: 'Send the updated conversation back to Claude for the next iteration.' },
    ],
    draw(container, { step = -1, mini = false } = {}) {
      const vb = mini ? '0 0 550 340' : '0 0 550 340';
      const svg = createSvg(container, vb);
      const nw = 150, nh = 44;

      const positions = [
        { id: 'send', x: 50, y: 30, label: 'Send to Claude' },
        { id: 'inspect', x: 350, y: 30, label: 'Inspect Response' },
        { id: 'execute', x: 350, y: 150, label: 'Execute Tools' },
        { id: 'append', x: 350, y: 270, label: 'Append Results' },
        { id: 'loop', x: 50, y: 270, label: 'Loop Back' },
      ];

      addArrowDef(svg);

      // Arrows
      drawArrow(svg, { x1: 50 + nw, y1: 30 + nh / 2, x2: 350, y2: 30 + nh / 2 });
      drawArrow(svg, { x1: 350 + nw / 2, y1: 30 + nh, x2: 350 + nw / 2, y2: 150 });
      drawArrow(svg, { x1: 350 + nw / 2, y1: 150 + nh, x2: 350 + nw / 2, y2: 270 });
      drawArrow(svg, { x1: 350, y1: 270 + nh / 2, x2: 50 + nw, y2: 270 + nh / 2 });
      drawArrow(svg, { x1: 50 + nw / 2, y1: 270, x2: 50 + nw / 2, y2: 30 + nh });

      // Branch arrow for end_turn
      const branchX = 350 + nw + 10;
      svg.appendChild(svgEl('line', {
        x1: branchX - 10, y1: 30 + nh / 2, x2: branchX + 40, y2: 30 + nh / 2,
        stroke: COLORS.flowLine, 'stroke-width': '1.5', 'stroke-dasharray': '4,3',
      }));
      const dt = svgEl('text', {
        x: branchX + 45, y: 30 + nh / 2 + 4,
        fill: COLORS.muted, 'font-size': '11', 'text-anchor': 'start',
      });
      dt.textContent = 'end_turn \u2192 done';
      svg.appendChild(dt);

      positions.forEach(p => drawNode(svg, { x: p.x, y: p.y, w: nw, h: nh, label: p.label, id: p.id }));

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 2. Multi-Agent — Domain 1 */
  DIAGRAMS['multi-agent'] = {
    title: 'Multi-Agent Orchestration',
    domain: 1,
    steps: [
      { id: 'query', label: 'User Query', description: 'The user submits a complex query requiring multiple capabilities.' },
      { id: 'coordinator', label: 'Coordinator', description: 'A top-level agent breaks the task into subtasks and delegates.' },
      { id: 'delegate', label: 'Delegate', description: 'The coordinator assigns subtasks to specialized sub-agents.' },
      { id: 'execute-sub', label: 'Execute Sub-tasks', description: 'Each sub-agent works on its assigned subtask independently.' },
      { id: 'aggregate', label: 'Aggregate', description: 'Results from all sub-agents are collected and synthesized.' },
    ],
    draw(container, { step = -1, mini = false } = {}) {
      const svg = createSvg(container, '0 0 600 320');
      const nw = 110, nh = 40;
      addArrowDef(svg);

      // User Query left
      drawNode(svg, { x: 20, y: 100, w: nw, h: nh, label: 'User Query', id: 'query' });
      // Coordinator top center
      drawNode(svg, { x: 245, y: 20, w: nw, h: nh, label: 'Coordinator', id: 'coordinator' });

      // Arrow query -> coordinator
      drawArrow(svg, { x1: 20 + nw, y1: 120, x2: 245, y2: 40 });

      // Sub-agents
      const subs = [
        { id: 'sub-research', label: 'Research', x: 130 },
        { id: 'sub-code', label: 'Code', x: 260 },
        { id: 'sub-review', label: 'Review', x: 390 },
        { id: 'sub-test', label: 'Test', x: 520 },
      ];
      const subY = 140;
      subs.forEach(s => {
        drawNode(svg, { x: s.x, y: subY, w: 90, h: nh, label: s.label, id: s.id });
        drawArrow(svg, { x1: 245 + nw / 2, y1: 20 + nh, x2: s.x + 45, y2: subY });
      });

      // Aggregate
      drawNode(svg, { x: 245, y: 260, w: nw, h: nh, label: 'Aggregate', id: 'aggregate' });
      subs.forEach(s => {
        drawArrow(svg, { x1: s.x + 45, y1: subY + nh, x2: 245 + nw / 2, y2: 260 });
      });

      if (step >= 0 && step < this.steps.length) {
        const sid = this.steps[step].id;
        if (sid === 'delegate' || sid === 'execute-sub') {
          highlightNodes(svg, ['delegate', 'execute-sub', ...subs.map(s => s.id)]);
        } else {
          highlightNode(svg, sid);
        }
      }
    },
  };

  /* 3. Context Window — Domain 2 */
  DIAGRAMS['context-window'] = {
    title: '200K Context Window',
    domain: 2,
    steps: [
      { id: 'system', label: 'System Prompt', description: 'Instructions that define the assistant\'s behavior and constraints.' },
      { id: 'tools', label: 'Tool Definitions', description: 'JSON schemas for all available tools consume context space.' },
      { id: 'history', label: 'Conversation History', description: 'Prior turns of conversation take the largest share of context.' },
      { id: 'cache', label: 'Cached', description: 'Content marked with cache_control ephemeral breakpoints for prompt caching.' },
      { id: 'output', label: 'Output Budget', description: 'Tokens reserved for the model\'s response generation.' },
    ],
    draw(container, { step = -1, mini = false } = {}) {
      const svg = createSvg(container, '0 0 600 200');
      const barY = 60, barH = 80, totalW = 560, startX = 20;

      // Title
      const title = svgEl('text', {
        x: 300, y: 30, 'text-anchor': 'middle', fill: COLORS.dark,
        'font-size': '15', 'font-weight': '600',
      });
      title.textContent = '200K Context Window';
      svg.appendChild(title);

      const segments = [
        { id: 'system', pct: 0.12, color: '#d97757', label: 'System\n12%' },
        { id: 'tools', pct: 0.15, color: '#c4943d', label: 'Tools\n15%' },
        { id: 'history', pct: 0.40, color: '#5a9a6e', label: 'History\n40%' },
        { id: 'cache', pct: 0.13, color: '#6b8cce', label: 'Cached\n13%' },
        { id: 'output', pct: 0.20, color: '#9b7cc4', label: 'Output\n20%' },
      ];

      let cx = startX;
      segments.forEach((seg, i) => {
        const w = totalW * seg.pct;
        const g = svgEl('g', { 'data-node-id': seg.id, cursor: 'pointer' });

        const isActive = step >= 0 && this.steps[step].id === seg.id;
        const isFaded = step >= 0 && !isActive;

        g.appendChild(svgEl('rect', {
          x: cx, y: barY, width: w, height: barH, rx: i === 0 ? 8 : (i === segments.length - 1 ? 8 : 0),
          fill: seg.color, opacity: isFaded ? 0.3 : 1,
          stroke: isActive ? COLORS.dark : 'none', 'stroke-width': isActive ? 2 : 0,
        }));

        const lines = seg.label.split('\n');
        lines.forEach((line, li) => {
          const t = svgEl('text', {
            x: cx + w / 2, y: barY + barH / 2 + (li - 0.5) * 14 + 5,
            'text-anchor': 'middle', fill: '#fff',
            'font-size': w < 80 ? '10' : '12', 'font-weight': '500',
            opacity: isFaded ? 0.4 : 1,
          });
          t.textContent = line;
          g.appendChild(t);
        });

        svg.appendChild(g);
        cx += w;
      });
    },
  };

  /* 4. Tool / MCP — Domain 3 */
  DIAGRAMS['tool-mcp'] = {
    title: 'Tool Use & MCP Flow',
    domain: 3,
    steps: [
      { id: 'define', label: 'Define Tools', description: 'Declare tool schemas in your code or via MCP server discovery.' },
      { id: 'select', label: 'Claude Selects Tool', description: 'Claude decides which tool to call based on the conversation.' },
      { id: 'validate', label: 'Validate Input', description: 'Your code validates the tool input parameters before execution.' },
      { id: 'execute-tool', label: 'Execute Tool', description: 'Run the tool on the MCP server or locally and get the result.' },
      { id: 'return', label: 'Return Result', description: 'Send the tool_result back to Claude for the next turn.' },
    ],
    draw(container, { step = -1, mini = false } = {}) {
      const svg = createSvg(container, '0 0 620 340');
      addArrowDef(svg);
      const nw = 130, nh = 40;

      // Dashed regions
      const regions = [
        { label: 'YOUR CODE', x: 10, y: 10, w: 200, h: 320 },
        { label: 'CLAUDE API', x: 230, y: 10, w: 180, h: 150 },
        { label: 'MCP SERVER', x: 230, y: 180, w: 380, h: 150 },
      ];
      regions.forEach(r => {
        svg.appendChild(svgEl('rect', {
          x: r.x, y: r.y, width: r.w, height: r.h, rx: 10,
          fill: 'none', stroke: COLORS.muted, 'stroke-width': '1', 'stroke-dasharray': '6,4',
        }));
        const t = svgEl('text', {
          x: r.x + 10, y: r.y + 18, fill: COLORS.muted, 'font-size': '10', 'font-weight': '600',
          'letter-spacing': '1',
        });
        t.textContent = r.label;
        svg.appendChild(t);
      });

      // Nodes
      drawNode(svg, { x: 35, y: 50, w: nw, h: nh, label: 'Define Tools', id: 'define' });
      drawNode(svg, { x: 265, y: 60, w: nw, h: nh, label: 'Claude Selects', id: 'select' });
      drawNode(svg, { x: 35, y: 200, w: nw, h: nh, label: 'Validate Input', id: 'validate' });
      drawNode(svg, { x: 300, y: 240, w: nw, h: nh, label: 'Execute Tool', id: 'execute-tool' });
      drawNode(svg, { x: 35, y: 280, w: nw, h: nh, label: 'Return Result', id: 'return' });

      // Arrows
      drawArrow(svg, { x1: 35 + nw, y1: 70, x2: 265, y2: 80 });
      drawArrow(svg, { x1: 330, y1: 60 + nh, x2: 100, y2: 200 });
      drawArrow(svg, { x1: 35 + nw, y1: 220, x2: 300, y2: 260 });
      drawArrow(svg, { x1: 300, y1: 260, x2: 35 + nw, y2: 300 });

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 5. Prompt Engineering — Domain 4 */
  DIAGRAMS['prompt-engineering'] = {
    title: 'Prompt Engineering Stack',
    domain: 4,
    steps: [
      { id: 'system-prompt', label: 'System Prompt', description: 'Top-level instructions that frame the assistant\'s role and constraints.' },
      { id: 'examples', label: 'Few-Shot Examples', description: 'Provide input/output pairs so the model learns the expected format.' },
      { id: 'cot', label: 'Chain-of-Thought', description: 'Ask the model to think step-by-step before answering.' },
      { id: 'prefill', label: 'Prefill / Assistant Turn', description: 'Pre-populate the start of the assistant response to guide output.' },
      { id: 'structured', label: 'Structured Output', description: 'Constrain output to JSON, XML, or other structured formats.' },
    ],
    draw(container, { step = -1, mini = false } = {}) {
      const svg = createSvg(container, '0 0 500 360');
      addArrowDef(svg);
      const nw = 340, nh = 44, startX = 80;
      const colors = ['#d97757', '#c4943d', '#5a9a6e', '#6b8cce', '#9b7cc4'];
      const gap = 62;

      this.steps.forEach((s, i) => {
        const y = 20 + i * gap;
        const isActive = step === i;
        const isFaded = step >= 0 && !isActive;

        const g = svgEl('g', { 'data-node-id': s.id, cursor: 'pointer' });
        g.appendChild(svgEl('rect', {
          x: startX, y, width: nw, height: nh, rx: 12,
          fill: isFaded ? '#f5f4f0' : colors[i],
          stroke: isActive ? COLORS.dark : (isFaded ? COLORS.dimmed : colors[i]),
          'stroke-width': isActive ? 2.5 : 1.5,
          opacity: isFaded ? 0.5 : 1,
        }));
        const t = svgEl('text', {
          x: startX + nw / 2, y: y + nh / 2 + 5,
          'text-anchor': 'middle', fill: isFaded ? COLORS.muted : '#fff',
          'font-size': '13', 'font-weight': '600',
        });
        t.textContent = s.label;
        g.appendChild(t);
        svg.appendChild(g);

        // Arrow between layers
        if (i < this.steps.length - 1) {
          const arrowX = startX + nw / 2;
          drawArrow(svg, { x1: arrowX, y1: y + nh, x2: arrowX, y2: y + gap });
        }
      });
    },
  };

  /* ---- Export ---- */
  window.DiagramEngine = {
    DIAGRAMS,
    COLORS,
    svgEl,
    createSvg,
    drawNode,
    drawArrow,
    addArrowDef,
    highlightNode,
    resetNodes,
    initTooltips,
  };
})();
