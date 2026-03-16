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
      const svg = createSvg(container, '0 0 680 320');
      const nw = 110, nh = 40;
      addArrowDef(svg);

      // User Query left
      drawNode(svg, { x: 20, y: 100, w: nw, h: nh, label: 'User Query', id: 'query' });
      // Coordinator top center
      drawNode(svg, { x: 285, y: 20, w: nw, h: nh, label: 'Coordinator', id: 'coordinator' });

      // Arrow query -> coordinator
      drawArrow(svg, { x1: 20 + nw, y1: 120, x2: 285, y2: 40 });

      // Sub-agents
      const subs = [
        { id: 'sub-research', label: 'Research', x: 100 },
        { id: 'sub-code', label: 'Code', x: 230 },
        { id: 'sub-review', label: 'Review', x: 360 },
        { id: 'sub-test', label: 'Test', x: 490 },
      ];
      const subY = 140;
      subs.forEach(s => {
        drawNode(svg, { x: s.x, y: subY, w: 90, h: nh, label: s.label, id: s.id });
        drawArrow(svg, { x1: 285 + nw / 2, y1: 20 + nh, x2: s.x + 45, y2: subY });
      });

      // Aggregate
      drawNode(svg, { x: 285, y: 260, w: nw, h: nh, label: 'Aggregate', id: 'aggregate' });
      subs.forEach(s => {
        drawArrow(svg, { x1: s.x + 45, y1: subY + nh, x2: 285 + nw / 2, y2: 260 });
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

  /* 6. Claude Code Config Hierarchy — Domain 3 */
  DIAGRAMS['claude-code-config'] = {
    title: 'Claude Code Configuration Hierarchy',
    domain: 3,
    steps: [
      { id: 'user', label: '~/.claude/CLAUDE.md', description: 'User-level config: personal preferences, not shared with teammates via version control.' },
      { id: 'project', label: '.claude/CLAUDE.md', description: 'Project-level config: shared coding standards, testing conventions. Committed to repo.' },
      { id: 'directory', label: 'subdir/CLAUDE.md', description: 'Directory-level config: conventions specific to a subdirectory (e.g., frontend/).' },
      { id: 'rules', label: '.claude/rules/*.md', description: 'Path-scoped rules with YAML frontmatter glob patterns (e.g., paths: ["**/*.test.*"]). Load only when editing matching files.' },
      { id: 'skills', label: '.claude/skills/', description: 'On-demand skills with SKILL.md frontmatter: context: fork, allowed-tools, argument-hint.' },
      { id: 'commands', label: '.claude/commands/', description: 'Project-scoped slash commands shared via version control. Personal commands go in ~/.claude/commands/.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 420');
      addArrowDef(svg);

      const nw = 190, nh = 44, gap = 80;

      // Left column: inheritance hierarchy
      const lx = 30;
      const hierarchy = [
        { id: 'user', label: '~/.claude/CLAUDE.md', y: 40, tag: 'personal only' },
        { id: 'project', label: '.claude/CLAUDE.md', y: 40 + gap, tag: 'team-shared via git' },
        { id: 'directory', label: 'subdir/CLAUDE.md', y: 40 + gap * 2, tag: 'scoped to directory' },
      ];

      // Column headers
      const colLabel1 = svgEl('text', {
        x: lx + nw / 2, y: 22, 'text-anchor': 'middle', fill: COLORS.muted,
        'font-size': '10', 'font-weight': '600', 'letter-spacing': '1',
      });
      colLabel1.textContent = 'INHERITANCE HIERARCHY';
      svg.appendChild(colLabel1);

      hierarchy.forEach((n, i) => {
        drawNode(svg, { x: lx, y: n.y, w: nw, h: nh, label: n.label, id: n.id });
        // Tag below node
        const tag = svgEl('text', {
          x: lx + nw / 2, y: n.y + nh + 14,
          'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '10', 'font-style': 'italic',
        });
        tag.textContent = n.tag;
        svg.appendChild(tag);
        // Arrow to next
        if (i < hierarchy.length - 1) {
          drawArrow(svg, { x1: lx + nw / 2, y1: n.y + nh + 20, x2: lx + nw / 2, y2: hierarchy[i + 1].y });
        }
      });

      // Right column: modular config
      const rx = 420, rw = 190;
      const modular = [
        { id: 'rules', label: '.claude/rules/*.md', y: 40, tag: 'glob-scoped, conditional' },
        { id: 'skills', label: '.claude/skills/', y: 40 + gap, tag: 'on-demand, fork isolation' },
        { id: 'commands', label: '.claude/commands/', y: 40 + gap * 2, tag: 'slash commands, shared' },
      ];

      const colLabel2 = svgEl('text', {
        x: rx + rw / 2, y: 22, 'text-anchor': 'middle', fill: COLORS.muted,
        'font-size': '10', 'font-weight': '600', 'letter-spacing': '1',
      });
      colLabel2.textContent = 'MODULAR CONFIG';
      svg.appendChild(colLabel2);

      modular.forEach(n => {
        drawNode(svg, { x: rx, y: n.y, w: rw, h: nh, label: n.label, id: n.id });
        const tag = svgEl('text', {
          x: rx + rw / 2, y: n.y + nh + 14,
          'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '10', 'font-style': 'italic',
        });
        tag.textContent = n.tag;
        svg.appendChild(tag);
      });

      // Center divider with label
      const cx = 320;
      svg.appendChild(svgEl('line', {
        x1: cx, y1: 35, x2: cx, y2: 40 + gap * 2 + nh,
        stroke: COLORS.dimmed, 'stroke-width': '1', 'stroke-dasharray': '4,3',
      }));

      // Bottom summary box
      const boxY = 40 + gap * 2 + nh + 30;
      svg.appendChild(svgEl('rect', {
        x: 30, y: boxY, width: 580, height: 60, rx: 10,
        fill: '#f5f4f0', stroke: COLORS.nodeBorder, 'stroke-width': '1',
      }));
      const summaryLines = [
        'Left: always loaded, merges top-down. Right: project-level, loaded on demand.',
        '.claude/rules/ uses paths: ["glob"] for conditional loading per file type.',
      ];
      summaryLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 50, y: boxY + 22 + i * 18, fill: COLORS.dark, 'font-size': '11',
        });
        t.textContent = line;
        svg.appendChild(t);
      });

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 7. Error Propagation — Domain 5 */
  DIAGRAMS['error-propagation'] = {
    title: 'Error Propagation in Multi-Agent Systems',
    domain: 5,
    steps: [
      { id: 'subagent', label: 'Subagent Fails', description: 'A subagent encounters an error (timeout, API failure, invalid data).' },
      { id: 'local-retry', label: 'Local Recovery', description: 'Subagent retries transient errors locally (e.g., exponential backoff). Only propagates if unrecoverable.' },
      { id: 'structured-error', label: 'Structured Error', description: 'Return errorCategory (transient/validation/permission), isRetryable, partial results, and what was attempted.' },
      { id: 'coordinator', label: 'Coordinator Decides', description: 'Coordinator inspects error context: retry with modified query, try alternative source, or proceed with partial results.' },
      { id: 'annotate', label: 'Annotate Gaps', description: 'Final output includes coverage annotations showing which findings are well-supported vs. which have gaps.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 300');
      addArrowDef(svg);
      const nw = 140, nh = 40;

      const nodes = [
        { id: 'subagent', x: 20, y: 60, label: 'Subagent Fails' },
        { id: 'local-retry', x: 20, y: 170, label: 'Local Recovery' },
        { id: 'structured-error', x: 200, y: 120, label: 'Structured Error' },
        { id: 'coordinator', x: 380, y: 60, label: 'Coordinator' },
        { id: 'annotate', x: 380, y: 200, label: 'Annotate Gaps' },
      ];

      // Anti-patterns (red X labels)
      const antiX = 530, antiY = 40;
      svg.appendChild(svgEl('rect', {
        x: antiX, y: antiY, width: 100, height: 90, rx: 8,
        fill: '#fef0f0', stroke: '#e5a0a0', 'stroke-width': '1',
      }));
      const antiTitle = svgEl('text', {
        x: antiX + 50, y: antiY + 16, 'text-anchor': 'middle',
        fill: '#c44', 'font-size': '10', 'font-weight': '600',
      });
      antiTitle.textContent = 'ANTI-PATTERNS';
      svg.appendChild(antiTitle);
      ['Generic errors', 'Silent suppress', 'Full termination'].forEach((t, i) => {
        const txt = svgEl('text', {
          x: antiX + 10, y: antiY + 36 + i * 18,
          fill: '#c44', 'font-size': '10',
        });
        txt.textContent = '\u2717 ' + t;
        svg.appendChild(txt);
      });

      // Arrows
      drawArrow(svg, { x1: 90, y1: 60 + nh, x2: 90, y2: 170 });
      drawArrow(svg, { x1: 20 + nw, y1: 185, x2: 200, y2: 140 });
      drawArrow(svg, { x1: 200 + nw, y1: 140, x2: 380, y2: 80 });
      drawArrow(svg, { x1: 450, y1: 60 + nh, x2: 450, y2: 200 });

      // Retry loop arrow (coordinator back to subagent)
      svg.appendChild(svgEl('path', {
        d: 'M 380 70 Q 300 10 90 60',
        fill: 'none', stroke: COLORS.accent, 'stroke-width': '1.5',
        'stroke-dasharray': '4,3', 'marker-end': 'url(#arrowhead)',
      }));
      const retryLabel = svgEl('text', {
        x: 240, y: 20, 'text-anchor': 'middle',
        fill: COLORS.accent, 'font-size': '10', 'font-weight': '500',
      });
      retryLabel.textContent = 'retry with modified query';
      svg.appendChild(retryLabel);

      nodes.forEach(n => drawNode(svg, { x: n.x, y: n.y, w: nw, h: nh, label: n.label, id: n.id }));

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 8. tool_choice Options — Domain 4 */
  DIAGRAMS['tool-choice'] = {
    title: 'tool_choice Configuration',
    domain: 4,
    steps: [
      { id: 'auto', label: 'auto', description: 'tool_choice: "auto" — Model may call a tool OR return text. Default behavior. Risk: model skips tool when you need structured output.' },
      { id: 'any', label: 'any', description: 'tool_choice: "any" — Model MUST call a tool but can choose which one. Use when you have multiple extraction schemas and document type is unknown.' },
      { id: 'forced', label: 'forced', description: 'tool_choice: {"type":"tool","name":"extract_metadata"} — Model MUST call this specific tool. Use to enforce ordering (e.g., extract before enrich).' },
      { id: 'output', label: 'Output', description: 'All three guarantee schema-compliant JSON (no syntax errors), but NONE prevent semantic errors (values in wrong fields, sums that don\'t match).' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 620 320');
      addArrowDef(svg);

      // Three branches from "API Request"
      const rootX = 240, rootY = 20, rootW = 140, rootH = 40;
      drawNode(svg, { x: rootX, y: rootY, w: rootW, h: rootH, label: 'API Request', id: 'request' });

      const branches = [
        { id: 'auto', x: 30, y: 110, label: '"auto"', subtitle: 'tool OR text', color: '#c4943d' },
        { id: 'any', x: 240, y: 110, label: '"any"', subtitle: 'must call a tool', color: '#5a9a6e' },
        { id: 'forced', x: 440, y: 110, label: '{"name":"..."}', subtitle: 'must call THIS tool', color: '#d97757' },
      ];

      branches.forEach(b => {
        const bw = 150, bh = 60;
        const isActive = step >= 0 && this.steps[step].id === b.id;
        const isFaded = step >= 0 && !isActive && this.steps[step].id !== 'output';

        const g = svgEl('g', { 'data-node-id': b.id, cursor: 'pointer' });
        g.appendChild(svgEl('rect', {
          x: b.x, y: b.y, width: bw, height: bh, rx: 12,
          fill: isFaded ? '#f5f4f0' : b.color,
          stroke: isActive ? COLORS.dark : (isFaded ? COLORS.dimmed : b.color),
          'stroke-width': isActive ? 2.5 : 1.5,
          opacity: isFaded ? 0.5 : 1,
        }));
        const t1 = svgEl('text', {
          x: b.x + bw / 2, y: b.y + 24,
          'text-anchor': 'middle', fill: isFaded ? COLORS.muted : '#fff',
          'font-size': '14', 'font-weight': '700',
        });
        t1.textContent = b.label;
        g.appendChild(t1);
        const t2 = svgEl('text', {
          x: b.x + bw / 2, y: b.y + 44,
          'text-anchor': 'middle', fill: isFaded ? COLORS.muted : 'rgba(255,255,255,0.8)',
          'font-size': '11',
        });
        t2.textContent = b.subtitle;
        g.appendChild(t2);
        svg.appendChild(g);

        drawArrow(svg, { x1: rootX + rootW / 2, y1: rootY + rootH, x2: b.x + bw / 2, y2: b.y });
      });

      // Output convergence
      const outY = 220, outW = 400, outH = 44;
      const outX = 110;
      const isOutActive = step >= 0 && this.steps[step].id === 'output';
      const g = svgEl('g', { 'data-node-id': 'output', cursor: 'pointer' });
      g.appendChild(svgEl('rect', {
        x: outX, y: outY, width: outW, height: outH, rx: 12,
        fill: isOutActive ? '#fef3ee' : '#f5f4f0',
        stroke: isOutActive ? COLORS.accent : COLORS.nodeBorder, 'stroke-width': isOutActive ? 2.5 : 1.5,
      }));
      const outText = svgEl('text', {
        x: outX + outW / 2, y: outY + outH / 2 + 5,
        'text-anchor': 'middle', fill: COLORS.dark,
        'font-size': '12', 'font-weight': '500',
      });
      outText.textContent = 'Schema-compliant JSON (syntax safe, semantic errors still possible)';
      g.appendChild(outText);
      svg.appendChild(g);

      branches.forEach(b => {
        drawArrow(svg, { x1: b.x + 75, y1: b.y + 60, x2: outX + outW / 2, y2: outY });
      });

      // Bottom note
      const noteY = outY + outH + 20;
      const noteLines = [
        'Use "auto" for general chat. Use "any" to guarantee structured output.',
        'Use forced selection to enforce tool ordering (e.g., extract before enrich).',
      ];
      noteLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 310, y: noteY + i * 16, 'text-anchor': 'middle',
          fill: COLORS.muted, 'font-size': '11',
        });
        t.textContent = line;
        svg.appendChild(t);
      });
    },
  };

  /* 9. Hooks / Programmatic Enforcement — Domain 1 */
  DIAGRAMS['hooks-enforcement'] = {
    title: 'Hooks & Programmatic Enforcement',
    domain: 1,
    steps: [
      { id: 'tool-call', label: 'Agent Tool Call', description: 'The agent emits a tool_use block (e.g., process_refund). Before execution, hooks can intercept it.' },
      { id: 'pre-hook', label: 'PreToolUse Hook', description: 'Intercepts outgoing tool calls. Can block policy-violating actions (e.g., refunds > $500) or enforce prerequisites (e.g., require get_customer before process_refund).' },
      { id: 'execute', label: 'Execute Tool', description: 'If the hook allows, the tool runs normally and returns results.' },
      { id: 'post-hook', label: 'PostToolUse Hook', description: 'Intercepts tool results before the model sees them. Normalizes data formats (timestamps, status codes) across heterogeneous MCP tools.' },
      { id: 'model', label: 'Model Processes', description: 'The model receives clean, normalized results and reasons about the next action.' },
      { id: 'blocked', label: 'Blocked → Escalate', description: 'If a hook blocks the call, the agent is redirected to an alternative workflow (e.g., human escalation) with a structured explanation.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 320');
      addArrowDef(svg);
      const nw = 130, nh = 40;

      // Main flow (top row)
      const mainNodes = [
        { id: 'tool-call', x: 20, y: 50, label: 'Agent Tool Call' },
        { id: 'pre-hook', x: 180, y: 50, label: 'PreToolUse Hook' },
        { id: 'execute', x: 340, y: 50, label: 'Execute Tool' },
        { id: 'post-hook', x: 340, y: 150, label: 'PostToolUse Hook' },
        { id: 'model', x: 180, y: 150, label: 'Model Processes' },
      ];

      // Arrows for happy path
      drawArrow(svg, { x1: 20 + nw, y1: 70, x2: 180, y2: 70 });
      drawArrow(svg, { x1: 180 + nw, y1: 70, x2: 340, y2: 70, label: 'allow' });
      drawArrow(svg, { x1: 340 + nw / 2, y1: 50 + nh, x2: 340 + nw / 2, y2: 150 });
      drawArrow(svg, { x1: 340, y1: 170, x2: 180 + nw, y2: 170, label: 'normalized' });

      // Blocked path
      drawNode(svg, { x: 180, y: 250, w: nw, h: nh, label: 'Blocked → Escalate', id: 'blocked' });
      svg.appendChild(svgEl('path', {
        d: 'M 245 90 Q 245 170 245 250',
        fill: 'none', stroke: '#c44', 'stroke-width': '1.5',
        'stroke-dasharray': '5,3', 'marker-end': 'url(#arrowhead)',
      }));
      const blockLabel = svgEl('text', {
        x: 260, y: 175, fill: '#c44', 'font-size': '10', 'font-weight': '500',
      });
      blockLabel.textContent = 'block';
      svg.appendChild(blockLabel);

      // Deterministic vs Probabilistic box
      const boxX = 460, boxY = 100;
      svg.appendChild(svgEl('rect', {
        x: boxX, y: boxY, width: 160, height: 110, rx: 8,
        fill: '#f5f4f0', stroke: COLORS.nodeBorder, 'stroke-width': '1',
      }));
      const boxTitle = svgEl('text', {
        x: boxX + 80, y: boxY + 18, 'text-anchor': 'middle',
        fill: COLORS.dark, 'font-size': '10', 'font-weight': '600',
      });
      boxTitle.textContent = 'WHY HOOKS?';
      svg.appendChild(boxTitle);
      const boxLines = [
        { text: '✓ Hooks: deterministic', color: COLORS.success },
        { text: '✓ 100% compliance', color: COLORS.success },
        { text: '✗ Prompts: probabilistic', color: '#c44' },
        { text: '✗ Non-zero failure rate', color: '#c44' },
      ];
      boxLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: boxX + 12, y: boxY + 40 + i * 18,
          fill: line.color, 'font-size': '10',
        });
        t.textContent = line.text;
        svg.appendChild(t);
      });

      mainNodes.forEach(n => drawNode(svg, { x: n.x, y: n.y, w: nw, h: nh, label: n.label, id: n.id }));

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 10. Escalation Decision Tree — Domain 5 */
  DIAGRAMS['escalation-tree'] = {
    title: 'Escalation Decision Tree',
    domain: 5,
    steps: [
      { id: 'request', label: 'Customer Request', description: 'An incoming customer request enters the agent for evaluation.' },
      { id: 'human-ask', label: 'Asks for Human?', description: 'If the customer explicitly requests a human agent, escalate immediately without attempting investigation.' },
      { id: 'policy-gap', label: 'Policy Gap?', description: 'If the request falls outside defined policy (e.g., competitor price matching when only own-site is covered), escalate — don\'t improvise.' },
      { id: 'progress', label: 'Can Make Progress?', description: 'If the agent cannot make meaningful progress after investigation (e.g., system errors, ambiguous data), escalate with context.' },
      { id: 'resolve', label: 'Resolve Autonomously', description: 'Standard cases within policy (replacements, refunds within limits) — resolve directly with the customer.' },
      { id: 'escalate', label: 'Escalate to Human', description: 'Compile a structured handoff: customer ID, root cause, attempted actions, recommended resolution.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 620 340');
      addArrowDef(svg);

      // Diamond helper
      function drawDiamond(svg, { x, y, w, h, label, id }) {
        const g = svgEl('g', { 'data-node-id': id, cursor: 'pointer' });
        const cx = x + w / 2, cy = y + h / 2;
        g.appendChild(svgEl('polygon', {
          points: `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`,
          fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5',
        }));
        const t = svgEl('text', {
          x: cx, y: cy + 4, 'text-anchor': 'middle', fill: COLORS.dark,
          'font-size': '11', 'font-weight': '500',
        });
        t.textContent = label;
        g.appendChild(t);
        svg.appendChild(g);
      }

      // Entry
      drawNode(svg, { x: 20, y: 20, w: 130, h: 40, label: 'Customer Request', id: 'request' });

      // Decision diamonds
      drawDiamond(svg, { x: 190, y: 10, w: 140, h: 60, label: 'Asks for Human?', id: 'human-ask' });
      drawDiamond(svg, { x: 190, y: 110, w: 140, h: 60, label: 'Policy Gap?', id: 'policy-gap' });
      drawDiamond(svg, { x: 190, y: 210, w: 140, h: 60, label: 'Can Progress?', id: 'progress' });

      // Outcomes
      drawNode(svg, { x: 450, y: 80, w: 140, h: 44, label: 'Escalate to Human', id: 'escalate' });
      drawNode(svg, { x: 450, y: 220, w: 140, h: 44, label: 'Resolve Autonomously', id: 'resolve' });

      // Escalate node coloring
      const escRect = svg.querySelector('[data-node-id="escalate"] rect');
      if (escRect && step < 0) { escRect.setAttribute('fill', '#fef0f0'); escRect.setAttribute('stroke', '#e5a0a0'); }
      const resRect = svg.querySelector('[data-node-id="resolve"] rect');
      if (resRect && step < 0) { resRect.setAttribute('fill', '#f0fef2'); resRect.setAttribute('stroke', '#a0e5a8'); }

      // Arrows
      drawArrow(svg, { x1: 150, y1: 40, x2: 190, y2: 40 });
      drawArrow(svg, { x1: 330, y1: 40, x2: 450, y2: 100, label: 'Yes' });
      drawArrow(svg, { x1: 260, y1: 70, x2: 260, y2: 110, label: 'No' });
      drawArrow(svg, { x1: 330, y1: 140, x2: 450, y2: 105, label: 'Yes' });
      drawArrow(svg, { x1: 260, y1: 170, x2: 260, y2: 210, label: 'No' });
      drawArrow(svg, { x1: 330, y1: 240, x2: 450, y2: 240, label: 'Yes' });
      drawArrow(svg, { x1: 210, y1: 270, x2: 450, y2: 115, label: 'No' });

      // Anti-patterns box
      const antiX = 20, antiY = 200;
      svg.appendChild(svgEl('rect', {
        x: antiX, y: antiY, width: 140, height: 100, rx: 8,
        fill: '#fef0f0', stroke: '#e5a0a0', 'stroke-width': '1',
      }));
      const antiTitle = svgEl('text', {
        x: antiX + 70, y: antiY + 16, 'text-anchor': 'middle',
        fill: '#c44', 'font-size': '10', 'font-weight': '600',
      });
      antiTitle.textContent = 'UNRELIABLE PROXIES';
      svg.appendChild(antiTitle);
      ['Sentiment analysis', 'Self-reported confidence', 'Case complexity guess'].forEach((t, i) => {
        const txt = svgEl('text', {
          x: antiX + 10, y: antiY + 38 + i * 20,
          fill: '#c44', 'font-size': '10',
        });
        txt.textContent = '\u2717 ' + t;
        svg.appendChild(txt);
      });

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 11. Validation-Retry Loop — Domain 4 */
  DIAGRAMS['validation-retry'] = {
    title: 'Validation-Retry Loop',
    domain: 4,
    steps: [
      { id: 'extract', label: 'Extract (tool_use)', description: 'Send document to Claude with a JSON schema tool. Claude returns structured data via tool_use — syntax is guaranteed correct.' },
      { id: 'validate', label: 'Semantic Validation', description: 'Check for semantic errors: do line items sum to total? Are dates logical? Are required fields populated from the actual document?' },
      { id: 'retry', label: 'Retry with Errors', description: 'Append the failed extraction + specific validation errors to a new prompt. The model uses this feedback to self-correct.' },
      { id: 'check-retry', label: 'Retryable?', description: 'Format mismatches and structural errors are retryable. Missing information (not in source document) is NOT retryable — retries waste tokens.' },
      { id: 'human', label: 'Route to Human', description: 'Non-retryable failures and persistent errors after max retries are routed to human review with context.' },
      { id: 'success', label: 'Accept Result', description: 'Validated extraction is accepted and passed to downstream systems.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 620 300');
      addArrowDef(svg);
      const nw = 130, nh = 40;

      // Nodes
      drawNode(svg, { x: 20, y: 40, w: nw, h: nh, label: 'Extract (tool_use)', id: 'extract' });
      drawNode(svg, { x: 200, y: 40, w: 140, h: nh, label: 'Semantic Validation', id: 'validate' });
      drawNode(svg, { x: 200, y: 150, w: 140, h: nh, label: 'Retryable?', id: 'check-retry' });
      drawNode(svg, { x: 20, y: 150, w: nw, h: nh, label: 'Retry with Errors', id: 'retry' });
      drawNode(svg, { x: 420, y: 40, w: nw, h: nh, label: 'Accept Result', id: 'success' });
      drawNode(svg, { x: 420, y: 150, w: nw, h: nh, label: 'Route to Human', id: 'human' });

      // Color the success/human nodes
      if (step < 0) {
        const sRect = svg.querySelector('[data-node-id="success"] rect');
        if (sRect) { sRect.setAttribute('fill', '#f0fef2'); sRect.setAttribute('stroke', '#a0e5a8'); }
        const hRect = svg.querySelector('[data-node-id="human"] rect');
        if (hRect) { hRect.setAttribute('fill', '#fef0f0'); hRect.setAttribute('stroke', '#e5a0a0'); }
      }

      // Arrows
      drawArrow(svg, { x1: 20 + nw, y1: 60, x2: 200, y2: 60 });
      drawArrow(svg, { x1: 340, y1: 60, x2: 420, y2: 60, label: 'pass' });
      drawArrow(svg, { x1: 270, y1: 80, x2: 270, y2: 150, label: 'fail' });
      drawArrow(svg, { x1: 200, y1: 170, x2: 150, y2: 170, label: 'yes' });
      drawArrow(svg, { x1: 340, y1: 170, x2: 420, y2: 170, label: 'no' });
      // Retry loops back to extract
      drawArrow(svg, { x1: 85, y1: 150, x2: 85, y2: 80 });

      // Info box: retryable vs not
      const boxX = 20, boxY = 220;
      svg.appendChild(svgEl('rect', {
        x: boxX, y: boxY, width: 530, height: 60, rx: 8,
        fill: '#f5f4f0', stroke: COLORS.nodeBorder, 'stroke-width': '1',
      }));
      const lines = [
        { text: '✓ Retryable: format mismatches, structural errors, wrong field placement', color: COLORS.success },
        { text: '✗ Not retryable: information absent from source document, external data needed', color: '#c44' },
      ];
      lines.forEach((line, i) => {
        const t = svgEl('text', {
          x: boxX + 14, y: boxY + 22 + i * 22,
          fill: line.color, 'font-size': '11',
        });
        t.textContent = line.text;
        svg.appendChild(t);
      });

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 12. Batch vs Sync API Decision — Domain 4 */
  DIAGRAMS['batch-vs-sync'] = {
    title: 'Batch vs Sync API Decision',
    domain: 4,
    steps: [
      { id: 'workflow', label: 'Workflow', description: 'Evaluate each workflow: does it block a developer or downstream process, or is it latency-tolerant?' },
      { id: 'blocking', label: 'Blocking (Sync)', description: 'Pre-merge checks, interactive queries — use the synchronous Messages API. Developers cannot wait up to 24 hours.' },
      { id: 'tolerant', label: 'Latency-Tolerant (Batch)', description: 'Overnight reports, weekly audits, nightly test generation — use the Message Batches API. 50% cost savings, up to 24-hour window.' },
      { id: 'custom-id', label: 'custom_id Correlation', description: 'Each batch request gets a custom_id. Use it to correlate responses, resubmit failures, and track per-document status.' },
      { id: 'failures', label: 'Handle Failures', description: 'Resubmit only failed documents (by custom_id) with modifications — e.g., chunking oversized docs. Don\'t reprocess the entire batch.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 620 300');
      addArrowDef(svg);

      // Root decision
      drawNode(svg, { x: 220, y: 20, w: 160, h: 44, label: 'Evaluate Workflow', id: 'workflow' });

      // Two branches
      const syncColor = '#d97757', batchColor = '#5a9a6e';

      // Sync branch (left)
      const sg = svgEl('g', { 'data-node-id': 'blocking', cursor: 'pointer' });
      sg.appendChild(svgEl('rect', {
        x: 30, y: 110, width: 180, height: 60, rx: 12,
        fill: step === 1 ? '#fef3ee' : syncColor,
        stroke: step === 1 ? COLORS.dark : syncColor, 'stroke-width': step === 1 ? 2.5 : 1.5,
        opacity: (step >= 0 && step !== 1) ? 0.4 : 1,
      }));
      const st1 = svgEl('text', { x: 120, y: 135, 'text-anchor': 'middle', fill: step === 1 ? COLORS.dark : '#fff', 'font-size': '13', 'font-weight': '600' });
      st1.textContent = 'Sync Messages API';
      sg.appendChild(st1);
      const st2 = svgEl('text', { x: 120, y: 155, 'text-anchor': 'middle', fill: step === 1 ? COLORS.muted : 'rgba(255,255,255,0.8)', 'font-size': '11' });
      st2.textContent = 'Pre-merge checks, interactive';
      sg.appendChild(st2);
      svg.appendChild(sg);

      // Batch branch (right)
      const bg = svgEl('g', { 'data-node-id': 'tolerant', cursor: 'pointer' });
      bg.appendChild(svgEl('rect', {
        x: 390, y: 110, width: 200, height: 60, rx: 12,
        fill: step === 2 ? '#fef3ee' : batchColor,
        stroke: step === 2 ? COLORS.dark : batchColor, 'stroke-width': step === 2 ? 2.5 : 1.5,
        opacity: (step >= 0 && step !== 2) ? 0.4 : 1,
      }));
      const bt1 = svgEl('text', { x: 490, y: 135, 'text-anchor': 'middle', fill: step === 2 ? COLORS.dark : '#fff', 'font-size': '13', 'font-weight': '600' });
      bt1.textContent = 'Message Batches API';
      bg.appendChild(bt1);
      const bt2 = svgEl('text', { x: 490, y: 155, 'text-anchor': 'middle', fill: step === 2 ? COLORS.muted : 'rgba(255,255,255,0.8)', 'font-size': '11' });
      bt2.textContent = '50% savings · ≤24h · overnight jobs';
      bg.appendChild(bt2);
      svg.appendChild(bg);

      drawArrow(svg, { x1: 260, y1: 64, x2: 120, y2: 110, label: 'blocking' });
      drawArrow(svg, { x1: 340, y1: 64, x2: 490, y2: 110, label: 'tolerant' });

      // Batch sub-flow
      drawNode(svg, { x: 390, y: 200, w: 140, h: 40, label: 'custom_id Tracking', id: 'custom-id' });
      drawNode(svg, { x: 390, y: 260, w: 140, h: 40, label: 'Resubmit Failures', id: 'failures' });
      drawArrow(svg, { x1: 490, y1: 170, x2: 460, y2: 200 });
      drawArrow(svg, { x1: 460, y1: 240, x2: 460, y2: 260 });

      // Sync constraints
      const cLines = ['Real-time response', 'Supports tool calling', 'Full-price API calls'];
      cLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 40, y: 195 + i * 16, fill: COLORS.muted, 'font-size': '10',
        });
        t.textContent = '• ' + line;
        svg.appendChild(t);
      });

      // Batch constraints
      const bLines = ['No multi-turn tools', 'No latency SLA', 'Poll for completion'];
      bLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 545, y: 210 + i * 16, fill: COLORS.muted, 'font-size': '10',
        });
        t.textContent = '• ' + line;
        svg.appendChild(t);
      });

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 13. Multi-Pass Review Architecture — Domain 4 */
  DIAGRAMS['multi-pass-review'] = {
    title: 'Multi-Pass Review Architecture',
    domain: 4,
    steps: [
      { id: 'pr', label: 'PR (14 files)', description: 'A large pull request with many files. Single-pass review suffers from attention dilution: inconsistent depth and contradictory findings.' },
      { id: 'local', label: 'Per-File Local Pass', description: 'Each file is analyzed individually for local issues: bugs, style, logic errors. Consistent depth because each pass is focused.' },
      { id: 'integration', label: 'Cross-File Pass', description: 'A separate pass examines cross-file data flow, API contract changes, and integration issues. Uses summaries from local passes.' },
      { id: 'independent', label: 'Independent Reviewer', description: 'A second Claude instance (without the generator\'s reasoning context) reviews the code. More effective than self-review.' },
      { id: 'merge', label: 'Merge Findings', description: 'De-duplicate and merge findings from all passes. Each finding includes location, severity, and suggested fix.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 320');
      addArrowDef(svg);
      const nw = 120, nh = 40;

      // PR input
      drawNode(svg, { x: 20, y: 110, w: 100, h: 44, label: 'PR (14 files)', id: 'pr' });

      // Per-file passes (stacked)
      const fileY = 30;
      const files = ['File 1', 'File 2', '...', 'File 14'];
      files.forEach((f, i) => {
        const y = fileY + i * 48;
        const isFileNode = i === 0;
        const g = svgEl('g', isFileNode ? { 'data-node-id': 'local', cursor: 'pointer' } : {});
        g.appendChild(svgEl('rect', {
          x: 180, y, width: 100, height: 36, rx: 8,
          fill: '#fff', stroke: COLORS.nodeBorder, 'stroke-width': '1.5',
        }));
        const t = svgEl('text', {
          x: 230, y: y + 22, 'text-anchor': 'middle', fill: COLORS.dark,
          'font-size': '11', 'font-weight': '500',
        });
        t.textContent = f;
        g.appendChild(t);
        svg.appendChild(g);
      });

      // Label
      const lbl = svgEl('text', {
        x: 230, y: fileY - 8, 'text-anchor': 'middle',
        fill: COLORS.accent, 'font-size': '10', 'font-weight': '600',
      });
      lbl.textContent = 'LOCAL PASSES';
      svg.appendChild(lbl);

      // Arrows from PR to files
      drawArrow(svg, { x1: 120, y1: 120, x2: 180, y2: 48 });
      drawArrow(svg, { x1: 120, y1: 132, x2: 180, y2: 100 });
      drawArrow(svg, { x1: 120, y1: 144, x2: 180, y2: 152 });
      drawArrow(svg, { x1: 120, y1: 150, x2: 180, y2: 196 });

      // Cross-file pass
      drawNode(svg, { x: 340, y: 60, w: nw, h: nh, label: 'Cross-File Pass', id: 'integration' });
      drawArrow(svg, { x1: 280, y1: 90, x2: 340, y2: 80 });

      // Independent reviewer
      drawNode(svg, { x: 340, y: 150, w: nw, h: nh, label: 'Independent Review', id: 'independent' });
      drawArrow(svg, { x1: 120, y1: 140, x2: 340, y2: 170 });

      // Merge
      drawNode(svg, { x: 510, y: 105, w: 110, h: 44, label: 'Merge Findings', id: 'merge' });
      drawArrow(svg, { x1: 340 + nw, y1: 80, x2: 510, y2: 120 });
      drawArrow(svg, { x1: 340 + nw, y1: 170, x2: 510, y2: 135 });

      // Self-review warning
      const warnY = 230;
      svg.appendChild(svgEl('rect', {
        x: 180, y: warnY, width: 380, height: 60, rx: 8,
        fill: '#fef0f0', stroke: '#e5a0a0', 'stroke-width': '1',
      }));
      const wLines = [
        'Self-review is unreliable: the model retains reasoning context',
        'from generation, making it less likely to question its own decisions.',
      ];
      wLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 194, y: warnY + 22 + i * 18, fill: '#c44', 'font-size': '10',
        });
        t.textContent = line;
        svg.appendChild(t);
      });

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 14. Session Management — Domain 1 */
  DIAGRAMS['session-management'] = {
    title: 'Session Management: Resume, Fork, Fresh',
    domain: 1,
    steps: [
      { id: 'prior', label: 'Prior Session', description: 'A completed or paused session with accumulated context, tool results, and analysis.' },
      { id: 'resume', label: '--resume', description: 'Continue the exact prior conversation. Best when prior context is mostly valid. Inform the agent about file changes for targeted re-analysis.' },
      { id: 'fork', label: 'fork_session', description: 'Create an independent branch from a shared analysis baseline. Use for exploring divergent approaches (e.g., two refactoring strategies).' },
      { id: 'fresh', label: 'Fresh + Summary', description: 'Start a new session with an injected structured summary. More reliable than resuming when prior tool results are stale.' },
      { id: 'fork-a', label: 'Approach A', description: 'One fork explores one approach (e.g., strategy pattern refactoring).' },
      { id: 'fork-b', label: 'Approach B', description: 'Another fork explores an alternative (e.g., decorator pattern). Compare results to decide.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 620 300');
      addArrowDef(svg);
      const nw = 130, nh = 40;

      // Prior session
      drawNode(svg, { x: 20, y: 100, w: nw, h: nh, label: 'Prior Session', id: 'prior' });

      // Three paths
      drawNode(svg, { x: 220, y: 20, w: nw, h: nh, label: '--resume', id: 'resume' });
      drawNode(svg, { x: 220, y: 100, w: nw, h: nh, label: 'fork_session', id: 'fork' });
      drawNode(svg, { x: 220, y: 180, w: nw, h: nh, label: 'Fresh + Summary', id: 'fresh' });

      drawArrow(svg, { x1: 150, y1: 110, x2: 220, y2: 40 });
      drawArrow(svg, { x1: 150, y1: 120, x2: 220, y2: 120 });
      drawArrow(svg, { x1: 150, y1: 130, x2: 220, y2: 200 });

      // Resume annotation
      const rNote = svgEl('text', {
        x: 360, y: 35, fill: COLORS.muted, 'font-size': '10', 'font-style': 'italic',
      });
      rNote.textContent = 'context mostly valid';
      svg.appendChild(rNote);

      // Fork branches
      drawNode(svg, { x: 440, y: 70, w: 110, h: 36, label: 'Approach A', id: 'fork-a' });
      drawNode(svg, { x: 440, y: 130, w: 110, h: 36, label: 'Approach B', id: 'fork-b' });
      drawArrow(svg, { x1: 350, y1: 110, x2: 440, y2: 88 });
      drawArrow(svg, { x1: 350, y1: 130, x2: 440, y2: 148 });

      // Fresh annotation
      const fNote = svgEl('text', {
        x: 360, y: 198, fill: COLORS.muted, 'font-size': '10', 'font-style': 'italic',
      });
      fNote.textContent = 'stale tool results';
      svg.appendChild(fNote);

      // Decision guide box
      const boxY = 240;
      svg.appendChild(svgEl('rect', {
        x: 20, y: boxY, width: 580, height: 50, rx: 8,
        fill: '#f5f4f0', stroke: COLORS.nodeBorder, 'stroke-width': '1',
      }));
      const guideLines = [
        '--resume: prior context valid, inform about file changes for targeted re-analysis',
        'fork_session: explore divergent approaches   |   Fresh: stale results, inject structured summary',
      ];
      guideLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 36, y: boxY + 20 + i * 18, fill: COLORS.dark, 'font-size': '10',
        });
        t.textContent = line;
        svg.appendChild(t);
      });

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
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
