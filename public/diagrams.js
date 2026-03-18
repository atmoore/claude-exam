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
      style: 'max-height:600px;font-family:Inter,sans-serif;',
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
      const vb = mini ? '0 0 660 340' : '0 0 660 340';
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
      const svg = createSvg(container, '0 0 680 320');
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
      drawArrow(svg, { x1: 180 + nw, y1: 70, x2: 340, y2: 70 });
      const allowLabel = svgEl('text', {
        x: 325, y: 55, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '11',
      });
      allowLabel.textContent = 'allow';
      svg.appendChild(allowLabel);
      drawArrow(svg, { x1: 340 + nw / 2, y1: 50 + nh, x2: 340 + nw / 2, y2: 150 });
      drawArrow(svg, { x1: 340, y1: 170, x2: 180 + nw, y2: 170 });
      const normLabel = svgEl('text', {
        x: 325, y: 145, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '11',
      });
      normLabel.textContent = 'normalized';
      svg.appendChild(normLabel);

      // Blocked path (curves left to avoid overlapping Model Processes node)
      drawNode(svg, { x: 80, y: 250, w: nw, h: nh, label: 'Blocked → Escalate', id: 'blocked' });
      svg.appendChild(svgEl('path', {
        d: 'M 180 90 Q 60 170 145 250',
        fill: 'none', stroke: '#c44', 'stroke-width': '1.5',
        'stroke-dasharray': '5,3', 'marker-end': 'url(#arrowhead)',
      }));
      const blockLabel = svgEl('text', {
        x: 62, y: 165, fill: '#c44', 'font-size': '10', 'font-weight': '500',
      });
      blockLabel.textContent = 'block';
      svg.appendChild(blockLabel);

      // Deterministic vs Probabilistic box
      const boxX = 500, boxY = 100;
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

      // Arrows — all "Yes" converge to escalate center (520, 102), "No" flows down
      drawArrow(svg, { x1: 150, y1: 40, x2: 190, y2: 40 });
      drawArrow(svg, { x1: 330, y1: 40, x2: 450, y2: 102, label: 'Yes' });
      drawArrow(svg, { x1: 260, y1: 70, x2: 260, y2: 110, label: 'No' });
      drawArrow(svg, { x1: 330, y1: 140, x2: 450, y2: 102, label: 'Yes' });
      drawArrow(svg, { x1: 260, y1: 170, x2: 260, y2: 210, label: 'No' });
      drawArrow(svg, { x1: 330, y1: 240, x2: 450, y2: 242, label: 'Yes' });
      // "No" from Can Progress? — from left vertex to escalate
      svg.appendChild(svgEl('path', {
        d: 'M 190 240 Q 170 240 170 180 Q 170 124 450 102',
        fill: 'none', stroke: COLORS.flowLine, 'stroke-width': '1.5',
        'marker-end': 'url(#arrowhead)',
      }));
      const noLabel = svgEl('text', {
        x: 168, y: 210, fill: COLORS.muted, 'font-size': '11', 'text-anchor': 'end',
      });
      noLabel.textContent = 'No';
      svg.appendChild(noLabel);

      // Anti-patterns box (positioned below the decision flow)
      const antiX = 20, antiY = 100;
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
      const svg = createSvg(container, '0 0 620 310');
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
      drawArrow(svg, { x1: 460, y1: 170, x2: 460, y2: 200 });
      drawArrow(svg, { x1: 460, y1: 240, x2: 460, y2: 260 });

      // Sync constraints (below the sync box)
      const cLines = ['Real-time response', 'Supports tool calling', 'Full-price API calls'];
      cLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 40, y: 195 + i * 16, fill: COLORS.muted, 'font-size': '10',
        });
        t.textContent = '• ' + line;
        svg.appendChild(t);
      });

      // Batch constraints (left of batch sub-flow)
      const bLines = ['No multi-turn tools', 'No latency SLA', 'Poll for completion'];
      bLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 380, y: 215 + i * 16, fill: COLORS.muted, 'font-size': '10',
          'text-anchor': 'end',
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
      const svg = createSvg(container, '0 0 640 360');
      addArrowDef(svg);
      const nw = 130, nh = 40;

      // === Row layout: PR → 3 parallel paths → Merge ===

      // PR input (left)
      drawNode(svg, { x: 20, y: 130, w: 110, h: 44, label: 'PR (14 files)', id: 'pr' });

      // --- Path 1: Per-file local passes (top row) ---
      const localX = 190, localY = 30;
      // Dashed region for local passes
      svg.appendChild(svgEl('rect', {
        x: localX - 10, y: localY - 10, width: 220, height: 100, rx: 10,
        fill: 'none', stroke: COLORS.muted, 'stroke-width': '1', 'stroke-dasharray': '6,4',
      }));
      const localLabel = svgEl('text', {
        x: localX, y: localY + 2, fill: COLORS.accent, 'font-size': '10', 'font-weight': '600',
      });
      localLabel.textContent = 'PER-FILE LOCAL PASSES';
      svg.appendChild(localLabel);

      // File boxes inside the region
      const fileNames = ['File 1', 'File 2', '...', 'File N'];
      const g = svgEl('g', { 'data-node-id': 'local', cursor: 'pointer' });
      fileNames.forEach((f, i) => {
        const fx = localX + i * 52;
        const fy = localY + 18;
        g.appendChild(svgEl('rect', {
          x: fx, y: fy, width: 46, height: 50, rx: 6,
          fill: '#fff', stroke: COLORS.nodeBorder, 'stroke-width': '1.5',
        }));
        const t = svgEl('text', {
          x: fx + 23, y: fy + 30, 'text-anchor': 'middle', fill: COLORS.dark,
          'font-size': '10', 'font-weight': '500',
        });
        t.textContent = f;
        g.appendChild(t);
      });
      svg.appendChild(g);

      // Arrow PR → local passes
      drawArrow(svg, { x1: 130, y1: 140, x2: localX - 10, y2: 68 });

      // --- Path 2: Cross-file integration pass (middle row) ---
      drawNode(svg, { x: 190, y: 140, w: nw, h: nh, label: 'Cross-File Pass', id: 'integration' });
      drawArrow(svg, { x1: 130, y1: 152, x2: 190, y2: 160 });

      // --- Path 3: Independent reviewer (bottom row) ---
      drawNode(svg, { x: 190, y: 240, w: nw, h: nh, label: 'Independent Review', id: 'independent' });
      drawArrow(svg, { x1: 130, y1: 165, x2: 190, y2: 260 });
      // Annotation
      const indLabel = svgEl('text', {
        x: 256, y: 295, 'text-anchor': 'middle',
        fill: COLORS.accent, 'font-size': '9', 'font-style': 'italic',
      });
      indLabel.textContent = 'separate Claude instance (no prior reasoning)';
      svg.appendChild(indLabel);

      // === Merge findings (right) ===
      drawNode(svg, { x: 460, y: 130, w: nw, h: 44, label: 'Merge Findings', id: 'merge' });

      // Arrows into merge
      drawArrow(svg, { x1: localX + 210, y1: 68, x2: 460, y2: 145 });
      drawArrow(svg, { x1: 190 + nw, y1: 160, x2: 460, y2: 152 });
      drawArrow(svg, { x1: 190 + nw, y1: 260, x2: 460, y2: 165 });

      // Arrow from local passes to cross-file (summaries feed integration)
      svg.appendChild(svgEl('line', {
        x1: 300, y1: 88, x2: 300, y2: 140,
        stroke: COLORS.flowLine, 'stroke-width': '1', 'stroke-dasharray': '4,3',
      }));
      const sumLabel = svgEl('text', {
        x: 314, y: 118, fill: COLORS.muted, 'font-size': '9', 'font-style': 'italic',
      });
      sumLabel.textContent = 'summaries';
      svg.appendChild(sumLabel);

      // Self-review warning box
      const warnY = 320;
      svg.appendChild(svgEl('rect', {
        x: 20, y: warnY, width: 600, height: 30, rx: 8,
        fill: '#fef0f0', stroke: '#e5a0a0', 'stroke-width': '1',
      }));
      const wt = svgEl('text', {
        x: 320, y: warnY + 19, 'text-anchor': 'middle', fill: '#c44', 'font-size': '10',
      });
      wt.textContent = 'Self-review is unreliable — use an independent instance without the generator\'s reasoning context';
      svg.appendChild(wt);

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

  /* 15. Prompt Chaining vs Dynamic Decomposition — Domain 1 */
  DIAGRAMS['task-decomposition'] = {
    title: 'Prompt Chaining vs Dynamic Decomposition',
    domain: 1,
    steps: [
      { id: 'chaining', label: 'Prompt Chaining', description: 'Fixed sequential pipeline. Each step feeds the next. Best for predictable, multi-aspect reviews (e.g., per-file analysis → cross-file pass).' },
      { id: 'step-a', label: 'Step A → B → C', description: 'Steps are pre-defined and always run in order. Predictable cost and latency. Cannot adapt if early steps reveal unexpected findings.' },
      { id: 'dynamic', label: 'Dynamic Decomposition', description: 'Adaptive investigation. The agent generates subtasks based on what it discovers at each step. Best for open-ended tasks.' },
      { id: 'adapt', label: 'Discover → Plan → Execute', description: 'First map the structure, identify high-impact areas, then create a prioritized plan that adapts as dependencies are discovered.' },
      { id: 'choose', label: 'When to Choose', description: 'Chaining: code reviews, extraction pipelines, known multi-step workflows. Dynamic: "add tests to legacy codebase", open-ended research, unfamiliar codebases.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 320');
      addArrowDef(svg);

      // === Left side: Prompt Chaining ===
      const lcx = 20, lw = 270;
      // Header
      svg.appendChild(svgEl('rect', {
        x: lcx, y: 10, width: lw, height: 30, rx: 8,
        fill: '#d97757', stroke: 'none',
      }));
      const lh = svgEl('text', {
        x: lcx + lw / 2, y: 30, 'text-anchor': 'middle', fill: '#fff',
        'font-size': '12', 'font-weight': '600',
      });
      lh.textContent = 'PROMPT CHAINING (Fixed)';
      svg.appendChild(lh);

      // Chain nodes
      const chainSteps = ['Analyze File 1', 'Analyze File 2', 'Analyze File N', 'Cross-File Pass', 'Merge Output'];
      const cg = svgEl('g', { 'data-node-id': 'chaining', cursor: 'pointer' });
      chainSteps.forEach((s, i) => {
        const y = 55 + i * 48;
        cg.appendChild(svgEl('rect', {
          x: lcx + 40, y, width: 190, height: 34, rx: 8,
          fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5',
        }));
        const t = svgEl('text', {
          x: lcx + 135, y: y + 21, 'text-anchor': 'middle', fill: COLORS.dark,
          'font-size': '11', 'font-weight': '500',
        });
        t.textContent = s;
        cg.appendChild(t);
        if (i < chainSteps.length - 1) {
          svg.appendChild(svgEl('line', {
            x1: lcx + 135, y1: y + 34, x2: lcx + 135, y2: y + 48,
            stroke: COLORS.flowLine, 'stroke-width': '1.5', 'marker-end': 'url(#arrowhead)',
          }));
        }
      });
      svg.appendChild(cg);

      // Step-a node (invisible, for step highlighting)
      const sag = svgEl('g', { 'data-node-id': 'step-a', cursor: 'pointer' });
      sag.appendChild(svgEl('rect', {
        x: lcx + 40, y: 55, width: 190, height: 34, rx: 8,
        fill: 'transparent', stroke: 'none',
      }));
      svg.appendChild(sag);

      // === Right side: Dynamic Decomposition ===
      const rcx = 340, rw = 280;
      svg.appendChild(svgEl('rect', {
        x: rcx, y: 10, width: rw, height: 30, rx: 8,
        fill: '#5a9a6e', stroke: 'none',
      }));
      const rh = svgEl('text', {
        x: rcx + rw / 2, y: 30, 'text-anchor': 'middle', fill: '#fff',
        'font-size': '12', 'font-weight': '600',
      });
      rh.textContent = 'DYNAMIC DECOMPOSITION';
      svg.appendChild(rh);

      // Dynamic flow
      const dynSteps = [
        { label: 'Map Structure', y: 55 },
        { label: 'Identify High-Impact', y: 115 },
        { label: 'Create Plan', y: 175 },
        { label: 'Execute & Adapt', y: 235 },
      ];
      const dg = svgEl('g', { 'data-node-id': 'dynamic', cursor: 'pointer' });
      dynSteps.forEach((s, i) => {
        dg.appendChild(svgEl('rect', {
          x: rcx + 40, y: s.y, width: 190, height: 34, rx: 8,
          fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5',
        }));
        const t = svgEl('text', {
          x: rcx + 135, y: s.y + 21, 'text-anchor': 'middle', fill: COLORS.dark,
          'font-size': '11', 'font-weight': '500',
        });
        t.textContent = s.label;
        dg.appendChild(t);
        if (i < dynSteps.length - 1) {
          svg.appendChild(svgEl('line', {
            x1: rcx + 135, y1: s.y + 34, x2: rcx + 135, y2: dynSteps[i + 1].y,
            stroke: COLORS.flowLine, 'stroke-width': '1.5', 'marker-end': 'url(#arrowhead)',
          }));
        }
      });
      // Feedback loop arrow
      svg.appendChild(svgEl('path', {
        d: 'M ' + (rcx + 230) + ' 252 Q ' + (rcx + 260) + ' 175 ' + (rcx + 230) + ' 132',
        fill: 'none', stroke: COLORS.accent, 'stroke-width': '1.5',
        'stroke-dasharray': '4,3', 'marker-end': 'url(#arrowhead)',
      }));
      const fbLabel = svgEl('text', {
        x: rcx + 252, y: 195, fill: COLORS.accent, 'font-size': '9', 'font-style': 'italic',
      });
      fbLabel.textContent = 'adapt';
      svg.appendChild(fbLabel);
      svg.appendChild(dg);

      // Adapt node (invisible, for step highlighting)
      const adg = svgEl('g', { 'data-node-id': 'adapt', cursor: 'pointer' });
      adg.appendChild(svgEl('rect', {
        x: rcx + 40, y: 55, width: 190, height: 34, rx: 8,
        fill: 'transparent', stroke: 'none',
      }));
      svg.appendChild(adg);

      // Bottom: when to choose
      const boxY = 285;
      const cg2 = svgEl('g', { 'data-node-id': 'choose', cursor: 'pointer' });
      cg2.appendChild(svgEl('rect', {
        x: 20, y: boxY, width: 600, height: 30, rx: 8,
        fill: '#f5f4f0', stroke: COLORS.nodeBorder, 'stroke-width': '1',
      }));
      const ct = svgEl('text', {
        x: 320, y: boxY + 19, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '10',
      });
      ct.textContent = 'Chaining: predictable reviews, extraction  |  Dynamic: open-ended investigation, unfamiliar codebases';
      cg2.appendChild(ct);
      svg.appendChild(cg2);

      // Divider
      svg.appendChild(svgEl('line', {
        x1: 320, y1: 45, x2: 320, y2: 275,
        stroke: COLORS.dimmed, 'stroke-width': '1', 'stroke-dasharray': '4,3',
      }));

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 16. Lost-in-the-Middle Effect — Domain 5 */
  DIAGRAMS['lost-in-middle'] = {
    title: 'Lost-in-the-Middle Effect',
    domain: 5,
    steps: [
      { id: 'beginning', label: 'Beginning', description: 'Information at the start of a long input is processed reliably. Place key findings summaries here.' },
      { id: 'middle', label: 'Middle (Danger Zone)', description: 'Models may omit findings from middle sections of long inputs. Critical data here risks being lost during processing.' },
      { id: 'end', label: 'End', description: 'Information at the end is also processed reliably. Place current query/instructions here.' },
      { id: 'mitigate', label: 'Mitigation Strategies', description: 'Extract key facts into a persistent "case facts" block at the top. Use section headers. Trim verbose tool outputs. Place summaries at beginning.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 620 280');

      // Title
      const title = svgEl('text', {
        x: 310, y: 25, 'text-anchor': 'middle', fill: COLORS.dark,
        'font-size': '14', 'font-weight': '600',
      });
      title.textContent = 'Model Attention Across Long Inputs';
      svg.appendChild(title);

      // Attention heatmap bar
      const barX = 40, barY = 50, barW = 540, barH = 70;

      // Three segments with gradient effect
      const segments = [
        { id: 'beginning', x: barX, w: barW * 0.25, color: '#5a9a6e', opacity: 1, label: 'Beginning' },
        { id: 'middle', x: barX + barW * 0.25, w: barW * 0.5, color: '#c44', opacity: 0.4, label: 'Middle' },
        { id: 'end', x: barX + barW * 0.75, w: barW * 0.25, color: '#5a9a6e', opacity: 1, label: 'End' },
      ];

      segments.forEach((seg, i) => {
        const isActive = step >= 0 && this.steps[step].id === seg.id;
        const isFaded = step >= 0 && !isActive && step < 3;

        const g = svgEl('g', { 'data-node-id': seg.id, cursor: 'pointer' });
        g.appendChild(svgEl('rect', {
          x: seg.x, y: barY, width: seg.w, height: barH,
          rx: i === 0 ? 10 : (i === 2 ? 10 : 0),
          fill: seg.color, opacity: isFaded ? 0.15 : seg.opacity,
          stroke: isActive ? COLORS.dark : 'none', 'stroke-width': isActive ? 2 : 0,
        }));
        const t = svgEl('text', {
          x: seg.x + seg.w / 2, y: barY + barH / 2 + 5,
          'text-anchor': 'middle', fill: '#fff',
          'font-size': '13', 'font-weight': '600',
          opacity: isFaded ? 0.3 : 1,
        });
        t.textContent = seg.label;
        g.appendChild(t);
        svg.appendChild(g);
      });

      // Attention strength labels
      const strengthY = barY + barH + 18;
      [
        { x: barX + barW * 0.125, text: 'HIGH attention', color: '#5a9a6e' },
        { x: barX + barW * 0.5, text: 'LOW attention', color: '#c44' },
        { x: barX + barW * 0.875, text: 'HIGH attention', color: '#5a9a6e' },
      ].forEach(s => {
        const t = svgEl('text', {
          x: s.x, y: strengthY, 'text-anchor': 'middle', fill: s.color,
          'font-size': '10', 'font-weight': '600',
        });
        t.textContent = s.text;
        svg.appendChild(t);
      });

      // Mitigation strategies box
      const boxY = 160;
      const mg = svgEl('g', { 'data-node-id': 'mitigate', cursor: 'pointer' });
      mg.appendChild(svgEl('rect', {
        x: 40, y: boxY, width: 540, height: 110, rx: 10,
        fill: step === 3 ? '#fef3ee' : '#f5f4f0',
        stroke: step === 3 ? COLORS.accent : COLORS.nodeBorder, 'stroke-width': step === 3 ? 2 : 1,
      }));
      const mTitle = svgEl('text', {
        x: 60, y: boxY + 20, fill: COLORS.dark, 'font-size': '11', 'font-weight': '600',
      });
      mTitle.textContent = 'MITIGATION STRATEGIES';
      mg.appendChild(mTitle);

      const strategies = [
        '• Place key findings summaries at the BEGINNING of aggregated inputs',
        '• Extract transactional facts (amounts, dates, IDs) into a persistent "case facts" block',
        '• Trim verbose tool outputs to only relevant fields before they accumulate in context',
        '• Organize detailed results with explicit section headers to aid navigation',
      ];
      strategies.forEach((s, i) => {
        const t = svgEl('text', {
          x: 60, y: boxY + 40 + i * 18, fill: COLORS.dark, 'font-size': '10',
        });
        t.textContent = s;
        mg.appendChild(t);
      });
      svg.appendChild(mg);

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 17. Tool Distribution / Scoping — Domain 2 */
  DIAGRAMS['tool-distribution'] = {
    title: 'Tool Distribution Across Agents',
    domain: 2,
    steps: [
      { id: 'anti', label: 'Anti-pattern: All Tools', description: 'Giving one agent 18 tools degrades selection reliability. The agent has too many choices and misroutes requests to wrong tools.' },
      { id: 'scoped', label: 'Scoped: 4-5 per Agent', description: 'Each agent gets only the tools relevant to its role. A synthesis agent shouldn\'t have web search tools; a search agent doesn\'t need file write.' },
      { id: 'cross-role', label: 'Cross-Role Exception', description: 'For high-frequency needs, provide a scoped cross-role tool (e.g., verify_fact for synthesis). Complex cases still route through the coordinator.' },
      { id: 'constrained', label: 'Constrained Alternatives', description: 'Replace generic tools with constrained ones (e.g., fetch_url → load_document that validates document URLs). Reduces misuse surface.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 310');
      addArrowDef(svg);

      // === Left: Anti-pattern ===
      const antiX = 20, antiW = 180;
      svg.appendChild(svgEl('rect', {
        x: antiX, y: 10, width: antiW, height: 26, rx: 6,
        fill: '#c44', stroke: 'none',
      }));
      const ah = svgEl('text', {
        x: antiX + antiW / 2, y: 28, 'text-anchor': 'middle', fill: '#fff',
        'font-size': '10', 'font-weight': '600',
      });
      ah.textContent = 'ANTI-PATTERN';
      svg.appendChild(ah);

      // Single agent with too many tools
      const ag = svgEl('g', { 'data-node-id': 'anti', cursor: 'pointer' });
      ag.appendChild(svgEl('rect', {
        x: antiX, y: 44, width: antiW, height: 130, rx: 10,
        fill: '#fef0f0', stroke: '#e5a0a0', 'stroke-width': '1',
      }));
      const agLabel = svgEl('text', {
        x: antiX + antiW / 2, y: 62, 'text-anchor': 'middle', fill: COLORS.dark,
        'font-size': '11', 'font-weight': '600',
      });
      agLabel.textContent = 'One Agent';
      ag.appendChild(agLabel);

      // Tool grid (18 tiny boxes)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 6; col++) {
          ag.appendChild(svgEl('rect', {
            x: antiX + 10 + col * 27, y: 75 + row * 28, width: 22, height: 20, rx: 3,
            fill: '#fff', stroke: '#e5a0a0', 'stroke-width': '1',
          }));
        }
      }
      const toolCount = svgEl('text', {
        x: antiX + antiW / 2, y: 162, 'text-anchor': 'middle', fill: '#c44',
        'font-size': '10', 'font-weight': '600',
      });
      toolCount.textContent = '18 tools → poor selection';
      ag.appendChild(toolCount);
      svg.appendChild(ag);

      // === Right: Scoped pattern ===
      const scopeX = 240, scopeW = 380;
      svg.appendChild(svgEl('rect', {
        x: scopeX, y: 10, width: scopeW, height: 26, rx: 6,
        fill: '#5a9a6e', stroke: 'none',
      }));
      const sh = svgEl('text', {
        x: scopeX + scopeW / 2, y: 28, 'text-anchor': 'middle', fill: '#fff',
        'font-size': '10', 'font-weight': '600',
      });
      sh.textContent = 'SCOPED (4-5 tools per agent)';
      svg.appendChild(sh);

      // Three scoped agents
      const agents = [
        { id: 'search', label: 'Search Agent', tools: ['web_search', 'fetch_url', 'parse_html', 'cache_result'], x: scopeX + 10 },
        { id: 'analysis', label: 'Analysis Agent', tools: ['read_doc', 'extract_data', 'summarize', 'compare'], x: scopeX + 135 },
        { id: 'synthesis', label: 'Synthesis Agent', tools: ['draft_report', 'cite_source', 'format_output', 'verify_fact*'], x: scopeX + 260 },
      ];

      const sg = svgEl('g', { 'data-node-id': 'scoped', cursor: 'pointer' });
      agents.forEach(a => {
        sg.appendChild(svgEl('rect', {
          x: a.x, y: 44, width: 115, height: 130, rx: 10,
          fill: '#f0fef2', stroke: '#a0e5a8', 'stroke-width': '1',
        }));
        const al = svgEl('text', {
          x: a.x + 57, y: 62, 'text-anchor': 'middle', fill: COLORS.dark,
          'font-size': '10', 'font-weight': '600',
        });
        al.textContent = a.label;
        sg.appendChild(al);

        a.tools.forEach((tool, i) => {
          sg.appendChild(svgEl('rect', {
            x: a.x + 8, y: 72 + i * 24, width: 99, height: 18, rx: 4,
            fill: '#fff', stroke: '#a0e5a8', 'stroke-width': '1',
          }));
          const tt = svgEl('text', {
            x: a.x + 57, y: 72 + i * 24 + 13, 'text-anchor': 'middle', fill: COLORS.dark,
            'font-size': '9',
          });
          tt.textContent = tool;
          sg.appendChild(tt);
        });
      });
      svg.appendChild(sg);

      // Cross-role note
      const crg = svgEl('g', { 'data-node-id': 'cross-role', cursor: 'pointer' });
      crg.appendChild(svgEl('rect', {
        x: scopeX + 260, y: 155, width: 115, height: 18, rx: 4,
        fill: 'transparent', stroke: 'none',
      }));
      svg.appendChild(crg);
      const crNote = svgEl('text', {
        x: scopeX + 317, y: 195, 'text-anchor': 'middle', fill: COLORS.accent,
        'font-size': '9', 'font-style': 'italic',
      });
      crNote.textContent = '* scoped cross-role tool';
      crNote.setAttribute('text-anchor', 'middle');
      svg.appendChild(crNote);

      // Constrained alternatives box
      const boxY = 215;
      const cag = svgEl('g', { 'data-node-id': 'constrained', cursor: 'pointer' });
      cag.appendChild(svgEl('rect', {
        x: 20, y: boxY, width: 600, height: 85, rx: 10,
        fill: '#f5f4f0', stroke: COLORS.nodeBorder, 'stroke-width': '1',
      }));
      const caTitle = svgEl('text', {
        x: 40, y: boxY + 20, fill: COLORS.dark, 'font-size': '10', 'font-weight': '600',
      });
      caTitle.textContent = 'CONSTRAINED ALTERNATIVES';
      cag.appendChild(caTitle);
      const caLines = [
        '• Replace fetch_url → load_document (validates document URLs only)',
        '• Replace analyze_document → extract_data_points + summarize_content + verify_claim',
        '• Replace generic tools with purpose-specific tools that have defined input/output contracts',
      ];
      caLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 40, y: boxY + 40 + i * 18, fill: COLORS.dark, 'font-size': '10',
        });
        t.textContent = line;
        cag.appendChild(t);
      });
      svg.appendChild(cag);

      // Divider
      svg.appendChild(svgEl('line', {
        x1: 220, y1: 40, x2: 220, y2: 200,
        stroke: COLORS.dimmed, 'stroke-width': '1', 'stroke-dasharray': '4,3',
      }));

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 18. Subagent Context Isolation — Domain 1 */
  DIAGRAMS['subagent-context'] = {
    title: 'Subagent Context Isolation',
    domain: 1,
    steps: [
      { id: 'coordinator', label: 'Coordinator', description: 'The coordinator has its own conversation history, tool results, and accumulated context. This is NOT automatically shared.' },
      { id: 'misconception', label: 'Misconception: Shared Memory', description: 'Common mistake: assuming subagents inherit the coordinator\'s context or share memory between invocations. They do NOT.' },
      { id: 'reality', label: 'Reality: Isolated Context', description: 'Each subagent starts with ONLY what\'s in its prompt. The coordinator must explicitly pass all relevant findings, metadata, and instructions.' },
      { id: 'passing', label: 'Explicit Context Passing', description: 'Use structured data formats separating content from metadata (source URLs, page numbers). Include complete findings from prior agents directly in the prompt.' },
      { id: 'parallel', label: 'Parallel Spawning', description: 'Emit multiple Task tool calls in a single coordinator response to spawn subagents in parallel, not across separate turns.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 340');
      addArrowDef(svg);

      // Coordinator
      drawNode(svg, { x: 240, y: 20, w: 160, h: 44, label: 'Coordinator Agent', id: 'coordinator' });

      // === Left: Misconception (crossed out) ===
      const mx = 20;
      svg.appendChild(svgEl('rect', {
        x: mx, y: 90, width: 230, height: 150, rx: 10,
        fill: '#fef0f0', stroke: '#e5a0a0', 'stroke-width': '1', 'stroke-dasharray': '6,4',
      }));
      const mTitle = svgEl('text', {
        x: mx + 115, y: 110, 'text-anchor': 'middle', fill: '#c44',
        'font-size': '10', 'font-weight': '600',
      });
      mTitle.textContent = '✗ MISCONCEPTION';
      svg.appendChild(mTitle);

      const mg = svgEl('g', { 'data-node-id': 'misconception', cursor: 'pointer' });
      mg.appendChild(svgEl('rect', {
        x: mx, y: 90, width: 230, height: 150, rx: 10,
        fill: 'transparent', stroke: 'none',
      }));
      svg.appendChild(mg);

      // Fake shared memory cloud
      const cloudParts = [
        { cx: mx + 80, cy: 165, rx: 55, ry: 30 },
        { cx: mx + 140, cy: 165, rx: 55, ry: 30 },
      ];
      cloudParts.forEach(c => {
        svg.appendChild(svgEl('ellipse', {
          cx: c.cx, cy: c.cy, rx: c.rx, ry: c.ry,
          fill: '#fef0f0', stroke: '#e5a0a0', 'stroke-width': '1',
        }));
      });
      const sharedLabel = svgEl('text', {
        x: mx + 115, y: 170, 'text-anchor': 'middle', fill: '#c44',
        'font-size': '11', 'font-weight': '500', 'text-decoration': 'line-through',
      });
      sharedLabel.textContent = 'Shared Memory';
      svg.appendChild(sharedLabel);

      // Sub-agents connected to cloud
      ['Sub A', 'Sub B'].forEach((label, i) => {
        const sx = mx + 30 + i * 120, sy = 210;
        svg.appendChild(svgEl('rect', {
          x: sx, y: sy, width: 70, height: 28, rx: 6,
          fill: '#fff', stroke: '#e5a0a0', 'stroke-width': '1',
        }));
        const t = svgEl('text', {
          x: sx + 35, y: sy + 18, 'text-anchor': 'middle', fill: '#c44', 'font-size': '10',
        });
        t.textContent = label;
        svg.appendChild(t);
      });

      // === Right: Reality (correct pattern) ===
      const rx = 290;
      svg.appendChild(svgEl('rect', {
        x: rx, y: 90, width: 330, height: 150, rx: 10,
        fill: '#f0fef2', stroke: '#a0e5a8', 'stroke-width': '1',
      }));
      const rTitle = svgEl('text', {
        x: rx + 165, y: 110, 'text-anchor': 'middle', fill: '#5a9a6e',
        'font-size': '10', 'font-weight': '600',
      });
      rTitle.textContent = '✓ REALITY: EXPLICIT CONTEXT PASSING';
      svg.appendChild(rTitle);

      const rg = svgEl('g', { 'data-node-id': 'reality', cursor: 'pointer' });
      rg.appendChild(svgEl('rect', {
        x: rx, y: 90, width: 330, height: 150, rx: 10,
        fill: 'transparent', stroke: 'none',
      }));
      svg.appendChild(rg);

      // Subagents with explicit prompts
      const subagents = [
        { label: 'Search Agent', prompt: 'prompt: task +\nfindings from analysis', x: rx + 15 },
        { label: 'Synthesis Agent', prompt: 'prompt: task +\nsearch results +\nanalysis output', x: rx + 175 },
      ];
      subagents.forEach(s => {
        svg.appendChild(svgEl('rect', {
          x: s.x, y: 125, width: 140, height: 100, rx: 8,
          fill: '#fff', stroke: '#a0e5a8', 'stroke-width': '1',
        }));
        const sl = svgEl('text', {
          x: s.x + 70, y: 142, 'text-anchor': 'middle', fill: COLORS.dark,
          'font-size': '10', 'font-weight': '600',
        });
        sl.textContent = s.label;
        svg.appendChild(sl);
        s.prompt.split('\n').forEach((line, i) => {
          const t = svgEl('text', {
            x: s.x + 10, y: 160 + i * 14, fill: COLORS.muted, 'font-size': '9',
          });
          t.textContent = line;
          svg.appendChild(t);
        });
      });

      // Arrows from coordinator
      drawArrow(svg, { x1: 280, y1: 64, x2: 135, y2: 90, label: '' });
      drawArrow(svg, { x1: 360, y1: 64, x2: rx + 85, y2: 125 });
      drawArrow(svg, { x1: 360, y1: 64, x2: rx + 245, y2: 125 });

      // Context passing node (invisible for highlighting)
      const pg = svgEl('g', { 'data-node-id': 'passing', cursor: 'pointer' });
      pg.appendChild(svgEl('rect', {
        x: rx + 15, y: 125, width: 140, height: 100, rx: 8,
        fill: 'transparent', stroke: 'none',
      }));
      svg.appendChild(pg);

      // Parallel spawning box
      const boxY = 260;
      const psg = svgEl('g', { 'data-node-id': 'parallel', cursor: 'pointer' });
      psg.appendChild(svgEl('rect', {
        x: 20, y: boxY, width: 600, height: 60, rx: 10,
        fill: '#f5f4f0', stroke: COLORS.nodeBorder, 'stroke-width': '1',
      }));
      const pLines = [
        '• Spawn parallel subagents: emit multiple Task tool calls in a SINGLE coordinator response',
        '• Specify research goals and quality criteria, not step-by-step procedures',
        '• Use structured data formats: separate content from metadata (URLs, page numbers)',
      ];
      pLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 40, y: boxY + 18 + i * 16, fill: COLORS.dark, 'font-size': '10',
        });
        t.textContent = line;
        psg.appendChild(t);
      });
      svg.appendChild(psg);

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 19. Confidence Calibration & Human Review Routing — Domain 5 */
  DIAGRAMS['confidence-routing'] = {
    title: 'Confidence Calibration & Review Routing',
    domain: 5,
    steps: [
      { id: 'extract', label: 'Model Extraction', description: 'Claude extracts structured data and outputs field-level confidence scores alongside each value.' },
      { id: 'high', label: 'High Confidence', description: 'Extractions above the calibrated threshold. Still subject to stratified random sampling to catch novel error patterns.' },
      { id: 'low', label: 'Low Confidence', description: 'Extractions below threshold, or from ambiguous/contradictory source documents. Routed to human reviewers.' },
      { id: 'sample', label: 'Stratified Sampling', description: 'Random sample of high-confidence extractions for ongoing error rate measurement. Validates accuracy by document type AND field.' },
      { id: 'calibrate', label: 'Calibrate Thresholds', description: 'Use labeled validation sets to tune confidence thresholds. Aggregate metrics (97% overall) can mask poor performance on specific doc types.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 330');
      addArrowDef(svg);
      const nw = 140, nh = 40;

      // Extraction
      drawNode(svg, { x: 20, y: 60, w: 150, h: 44, label: 'Model Extraction', id: 'extract' });

      // Confidence split
      const splitX = 220, splitY = 40;
      // High confidence path (top)
      const hg = svgEl('g', { 'data-node-id': 'high', cursor: 'pointer' });
      hg.appendChild(svgEl('rect', {
        x: splitX, y: splitY, width: nw, height: nh, rx: 12,
        fill: '#f0fef2', stroke: '#a0e5a8', 'stroke-width': '1.5',
      }));
      const ht = svgEl('text', {
        x: splitX + nw / 2, y: splitY + nh / 2 + 5, 'text-anchor': 'middle',
        fill: COLORS.dark, 'font-size': '12', 'font-weight': '500',
      });
      ht.textContent = 'High Confidence';
      hg.appendChild(ht);
      svg.appendChild(hg);

      // Low confidence path (bottom)
      const lowY = splitY + 80;
      const lg = svgEl('g', { 'data-node-id': 'low', cursor: 'pointer' });
      lg.appendChild(svgEl('rect', {
        x: splitX, y: lowY, width: nw, height: nh, rx: 12,
        fill: '#fef0f0', stroke: '#e5a0a0', 'stroke-width': '1.5',
      }));
      const lt = svgEl('text', {
        x: splitX + nw / 2, y: lowY + nh / 2 + 5, 'text-anchor': 'middle',
        fill: COLORS.dark, 'font-size': '12', 'font-weight': '500',
      });
      lt.textContent = 'Low Confidence';
      lg.appendChild(lt);
      svg.appendChild(lg);

      // Arrows from extraction to split
      drawArrow(svg, { x1: 170, y1: 75, x2: splitX, y2: splitY + nh / 2 });
      drawArrow(svg, { x1: 170, y1: 90, x2: splitX, y2: lowY + nh / 2 });

      // Auto-accept
      const autoX = 420;
      svg.appendChild(svgEl('rect', {
        x: autoX, y: splitY, width: 120, height: nh, rx: 12,
        fill: '#5a9a6e', stroke: '#5a9a6e', 'stroke-width': '1.5',
      }));
      const at = svgEl('text', {
        x: autoX + 60, y: splitY + nh / 2 + 5, 'text-anchor': 'middle',
        fill: '#fff', 'font-size': '12', 'font-weight': '600',
      });
      at.textContent = 'Auto-Accept';
      svg.appendChild(at);
      drawArrow(svg, { x1: splitX + nw, y1: splitY + nh / 2, x2: autoX, y2: splitY + nh / 2 });

      // Human review
      svg.appendChild(svgEl('rect', {
        x: autoX, y: lowY, width: 120, height: nh, rx: 12,
        fill: '#d97757', stroke: '#d97757', 'stroke-width': '1.5',
      }));
      const hrt = svgEl('text', {
        x: autoX + 60, y: lowY + nh / 2 + 5, 'text-anchor': 'middle',
        fill: '#fff', 'font-size': '12', 'font-weight': '600',
      });
      hrt.textContent = 'Human Review';
      svg.appendChild(hrt);
      drawArrow(svg, { x1: splitX + nw, y1: lowY + nh / 2, x2: autoX, y2: lowY + nh / 2 });

      // Stratified sampling (branches from high confidence)
      const sampY = 190;
      drawNode(svg, { x: 220, y: sampY, w: 160, h: 40, label: 'Stratified Sampling', id: 'sample' });
      svg.appendChild(svgEl('path', {
        d: 'M ' + (autoX + 60) + ' ' + (splitY + nh) + ' Q ' + (autoX + 60) + ' ' + (sampY - 10) + ' ' + (220 + 160) + ' ' + (sampY + 20),
        fill: 'none', stroke: COLORS.accent, 'stroke-width': '1.5',
        'stroke-dasharray': '4,3', 'marker-end': 'url(#arrowhead)',
      }));
      const sampLabel = svgEl('text', {
        x: autoX + 80, y: sampY - 15, fill: COLORS.accent, 'font-size': '9', 'font-style': 'italic',
      });
      sampLabel.textContent = 'random sample';
      svg.appendChild(sampLabel);

      // Calibrate thresholds
      const calY = sampY + 60;
      const calg = svgEl('g', { 'data-node-id': 'calibrate', cursor: 'pointer' });
      calg.appendChild(svgEl('rect', {
        x: 20, y: calY, width: 600, height: 80, rx: 10,
        fill: '#f5f4f0', stroke: COLORS.nodeBorder, 'stroke-width': '1',
      }));
      const calTitle = svgEl('text', {
        x: 40, y: calY + 18, fill: COLORS.dark, 'font-size': '10', 'font-weight': '600',
      });
      calTitle.textContent = 'CALIBRATION & VALIDATION';
      calg.appendChild(calTitle);
      const calLines = [
        '• Calibrate thresholds using labeled validation sets, not intuition',
        '• Validate accuracy by document type AND field — 97% overall can mask 40% failure on invoices',
        '• Track error rates over time with stratified sampling to detect novel patterns',
      ];
      calLines.forEach((line, i) => {
        const t = svgEl('text', {
          x: 40, y: calY + 36 + i * 15, fill: COLORS.dark, 'font-size': '10',
        });
        t.textContent = line;
        calg.appendChild(t);
      });
      svg.appendChild(calg);

      // Feedback arrow from sampling to calibrate
      drawArrow(svg, { x1: 300, y1: sampY + 40, x2: 300, y2: calY });

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 20. tool_choice Cheat Sheet — Domain 4 */
  DIAGRAMS['tool-choice-cheatsheet'] = {
    title: 'tool_choice Cheat Sheet',
    domain: 4,
    steps: [
      { id: 'auto', label: '"auto"', description: '"Do whatever makes sense." Default. Model may call a tool OR respond with text. Use it almost always.' },
      { id: 'any', label: '"any"', description: '"You must call a tool, but you pick which." Use when a tool call is required — e.g., forcing a first search before the model can respond.' },
      { id: 'tool', label: '{"type":"tool","name":"..."}', description: '"Call this exact tool." Use in fixed pipelines where the step is predetermined — e.g., extract_metadata before enrichment.' },
      { id: 'heuristic', label: 'Exam Heuristic', description: '"flexibly" / "dynamically" → auto. "must use a tool" / "ensure a tool is called" → any. Fixed pipeline step → tool.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 820 340');

      // Table layout
      const tx = 30, ty = 20, colW = [140, 180, 180], rowH = 44;
      const totalW = colW[0] + colW[1] + colW[2];
      const headers = ['Setting', 'MUST use a tool?', 'CAN respond with text?'];
      const rows = [
        { id: 'auto', cells: ['"auto"', 'No', 'Yes'], colors: ['#c4943d', '#fef0f0', '#f0fef2'] },
        { id: 'any', cells: ['"any"', 'Yes', 'No'], colors: ['#5a9a6e', '#f0fef2', '#fef0f0'] },
        { id: 'tool', cells: ['{"name":"..."}', 'Yes, a specific one', 'No'], colors: ['#d97757', '#f0fef2', '#fef0f0'] },
      ];

      // Header row
      let cx = tx;
      headers.forEach((h, i) => {
        svg.appendChild(svgEl('rect', {
          x: cx, y: ty, width: colW[i], height: rowH,
          rx: i === 0 ? '8' : (i === 2 ? '8' : '0'),
          fill: COLORS.dark, stroke: 'none',
        }));
        const t = svgEl('text', {
          x: cx + colW[i] / 2, y: ty + rowH / 2 + 5, 'text-anchor': 'middle',
          fill: '#fff', 'font-size': '11', 'font-weight': '600',
        });
        t.textContent = h;
        svg.appendChild(t);
        cx += colW[i];
      });

      // Data rows
      rows.forEach((row, ri) => {
        const ry = ty + rowH + ri * rowH;
        const isActive = step >= 0 && this.steps[step].id === row.id;
        const isFaded = step >= 0 && !isActive && this.steps[step].id !== 'heuristic';

        const g = svgEl('g', { 'data-node-id': row.id, cursor: 'pointer' });
        let rcx = tx;
        row.cells.forEach((cell, ci) => {
          g.appendChild(svgEl('rect', {
            x: rcx, y: ry, width: colW[ci], height: rowH,
            fill: ci === 0 ? row.colors[0] : row.colors[ci],
            stroke: isActive ? COLORS.dark : '#e5e3dd',
            'stroke-width': isActive ? 2 : 1,
            opacity: isFaded ? 0.35 : 1,
            rx: ci === 0 && ri === 2 ? '8' : (ci === 2 && ri === 2 ? '8' : '0'),
          }));
          const t = svgEl('text', {
            x: rcx + colW[ci] / 2, y: ry + rowH / 2 + 5, 'text-anchor': 'middle',
            fill: ci === 0 ? '#fff' : COLORS.dark,
            'font-size': ci === 0 ? '13' : '12',
            'font-weight': ci === 0 ? '700' : '500',
            opacity: isFaded ? 0.4 : 1,
          });
          t.textContent = cell;
          g.appendChild(t);
          rcx += colW[ci];
        });
        svg.appendChild(g);
      });

      // Descriptions to the right of the table — when to use each
      const descX = tx + totalW + 20;
      const descData = [
        { y: ty + rowH + rowH / 2, text: 'Default. "Do whatever makes sense."', color: '#c4943d' },
        { y: ty + rowH * 2 + rowH / 2, text: 'Force a tool call, model picks which.', color: '#5a9a6e' },
        { y: ty + rowH * 3 + rowH / 2, text: 'Force THIS specific tool. Fixed pipeline.', color: '#d97757' },
      ];
      descData.forEach(d => {
        const t = svgEl('text', {
          x: descX, y: d.y + 5, fill: d.color,
          'font-size': '10', 'font-weight': '500', 'font-style': 'italic',
        });
        t.textContent = d.text;
        svg.appendChild(t);
      });

      // Exam heuristic box
      const boxY = ty + rowH * 4 + 20;
      const hg = svgEl('g', { 'data-node-id': 'heuristic', cursor: 'pointer' });
      hg.appendChild(svgEl('rect', {
        x: tx, y: boxY, width: 560, height: 110, rx: 10,
        fill: step === 3 ? '#fef3ee' : '#f5f4f0',
        stroke: step === 3 ? COLORS.accent : COLORS.nodeBorder,
        'stroke-width': step === 3 ? 2 : 1,
      }));
      const hTitle = svgEl('text', {
        x: tx + 16, y: boxY + 20, fill: COLORS.dark,
        'font-size': '11', 'font-weight': '700',
      });
      hTitle.textContent = 'EXAM HEURISTIC';
      hg.appendChild(hTitle);

      const heuristics = [
        { keyword: '"flexibly" / "dynamically"', arrow: 'auto', color: '#c4943d' },
        { keyword: '"must use a tool" / "ensure a tool is called"', arrow: 'any', color: '#5a9a6e' },
        { keyword: 'Fixed pipeline step / predetermined', arrow: 'tool', color: '#d97757' },
      ];
      heuristics.forEach((h, i) => {
        const hy = boxY + 40 + i * 22;
        // Keyword
        const kt = svgEl('text', {
          x: tx + 16, y: hy, fill: COLORS.dark, 'font-size': '10',
        });
        kt.textContent = h.keyword;
        hg.appendChild(kt);
        // Arrow
        const at = svgEl('text', {
          x: tx + 340, y: hy, fill: h.color,
          'font-size': '11', 'font-weight': '700',
        });
        at.textContent = '\u2192  ' + h.arrow;
        hg.appendChild(at);
      });
      svg.appendChild(hg);

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 1. Error Categories — Domain 2 */
  DIAGRAMS['error-categories'] = {
    title: 'Error Response Categories',
    domain: 2,
    steps: [
      { id: 'transient', label: 'Transient', description: 'Timeout or service unavailable — retryable with backoff.' },
      { id: 'validation', label: 'Validation', description: 'Bad input or missing field — fix the input then retry.' },
      { id: 'business', label: 'Business', description: 'Policy violation — not retryable, use alternative workflow.' },
      { id: 'permission', label: 'Permission', description: 'Access denied — not retryable, escalate to human.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 340');
      const quadrants = [
        { id: 'transient', x: 20, y: 40, color: COLORS.warning, title: 'Transient', sub: 'Timeout, unavailable', retry: 'Retryable: Yes' },
        { id: 'validation', x: 330, y: 40, color: COLORS.accent, title: 'Validation', sub: 'Bad input, missing field', retry: 'Retryable: Fix + retry' },
        { id: 'business', x: 20, y: 190, color: '#c44', title: 'Business', sub: 'Policy violation', retry: 'Retryable: No \u2192 Alt workflow' },
        { id: 'permission', x: 330, y: 190, color: '#8b5cf6', title: 'Permission', sub: 'Access denied', retry: 'Retryable: No \u2192 Escalate' },
      ];
      const qw = 290, qh = 130;
      quadrants.forEach(q => {
        const g = svgEl('g', { 'data-node-id': q.id, cursor: 'pointer' });
        g.appendChild(svgEl('rect', { x: q.x, y: q.y, width: qw, height: qh, rx: 10, fill: q.color, opacity: '0.12', stroke: q.color, 'stroke-width': '2' }));
        const t1 = svgEl('text', { x: q.x + qw / 2, y: q.y + 35, 'text-anchor': 'middle', fill: q.color, 'font-size': '15', 'font-weight': '700' });
        t1.textContent = q.title;
        g.appendChild(t1);
        const t2 = svgEl('text', { x: q.x + qw / 2, y: q.y + 60, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '12' });
        t2.textContent = q.sub;
        g.appendChild(t2);
        const t3 = svgEl('text', { x: q.x + qw / 2, y: q.y + 85, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '11', 'font-weight': '600' });
        t3.textContent = q.retry;
        g.appendChild(t3);
        svg.appendChild(g);
      });
      // Title
      const title = svgEl('text', { x: 320, y: 25, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '14', 'font-weight': '600' });
      title.textContent = 'Error Response Categories';
      svg.appendChild(title);
      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 2. Tool Misrouting Fix — Domain 2 */
  DIAGRAMS['tool-misrouting'] = {
    title: 'Tool Description Fix for Misrouting',
    domain: 2,
    steps: [
      { id: 'vague', label: 'Vague Descriptions', description: 'Both tools have identical vague descriptions like "Retrieves info".' },
      { id: 'misroute', label: 'Query Misroutes', description: 'An order status query is sent to get_customer instead of lookup_order.' },
      { id: 'expanded', label: 'Expanded Descriptions', description: 'Tool descriptions are rewritten with clear boundaries and use cases.' },
      { id: 'correct', label: 'Correct Routing', description: 'The same query now correctly routes to lookup_order.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 380');
      addArrowDef(svg);
      const pw = 300, ph = 340;

      // Panel backgrounds
      ['BEFORE', 'AFTER'].forEach((label, i) => {
        const px = i === 0 ? 10 : 330;
        svg.appendChild(svgEl('rect', { x: px, y: 30, width: pw, height: ph, rx: 10, fill: 'none', stroke: COLORS.nodeBorder, 'stroke-width': '1', 'stroke-dasharray': '6,4' }));
        const lt = svgEl('text', { x: px + pw / 2, y: 22, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '12', 'font-weight': '700', 'letter-spacing': '1' });
        lt.textContent = label;
        svg.appendChild(lt);
      });

      // BEFORE panel
      const bx = 10;
      drawNode(svg, { x: bx + 30, y: 55, w: 130, h: 38, label: 'get_customer', id: 'vague' });
      const desc1 = svgEl('text', { x: bx + 95, y: 112, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '10' });
      desc1.textContent = '"Retrieves info"';
      svg.appendChild(desc1);

      drawNode(svg, { x: bx + 140, y: 140, w: 130, h: 38, label: 'lookup_order', id: 'misroute' });
      const desc2 = svgEl('text', { x: bx + 205, y: 197, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '10' });
      desc2.textContent = '"Retrieves info"';
      svg.appendChild(desc2);

      // Query box
      const qt = svgEl('text', { x: bx + 150, y: 260, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11', 'font-weight': '500' });
      qt.textContent = '"order status query"';
      svg.appendChild(qt);
      // Wrong arrow (red dashed)
      svg.appendChild(svgEl('line', { x1: bx + 150, y1: 248, x2: bx + 95, y2: 97, stroke: '#c44', 'stroke-width': '2', 'stroke-dasharray': '5,3' }));
      const wrongLabel = svgEl('text', { x: bx + 60, y: 220, fill: '#c44', 'font-size': '11', 'font-weight': '700' });
      wrongLabel.textContent = '\u2717 WRONG';
      svg.appendChild(wrongLabel);

      // AFTER panel
      const ax = 330;
      drawNode(svg, { x: ax + 30, y: 55, w: 130, h: 38, label: 'get_customer', id: 'expanded' });
      const ed1 = svgEl('text', { x: ax + 95, y: 112, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '9' });
      ed1.textContent = '"Customer profile by ID"';
      svg.appendChild(ed1);

      drawNode(svg, { x: ax + 140, y: 140, w: 130, h: 38, label: 'lookup_order', id: 'correct' });
      const ed2 = svgEl('text', { x: ax + 205, y: 197, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '9' });
      ed2.textContent = '"Order status, tracking, items"';
      svg.appendChild(ed2);

      // Query
      const qt2 = svgEl('text', { x: ax + 150, y: 260, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11', 'font-weight': '500' });
      qt2.textContent = '"order status query"';
      svg.appendChild(qt2);
      // Correct arrow (green)
      svg.appendChild(svgEl('line', { x1: ax + 150, y1: 248, x2: ax + 205, y2: 182, stroke: COLORS.success, 'stroke-width': '2', 'marker-end': 'url(#arrowhead)' }));
      const okLabel = svgEl('text', { x: ax + 250, y: 230, fill: COLORS.success, 'font-size': '11', 'font-weight': '700' });
      okLabel.textContent = '\u2713 CORRECT';
      svg.appendChild(okLabel);

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 3. Plan Mode vs Direct Execution — Domain 3 */
  DIAGRAMS['plan-vs-direct'] = {
    title: 'Plan Mode vs Direct Execution',
    domain: 3,
    steps: [
      { id: 'task', label: 'Evaluate Task', description: 'Assess the incoming task for complexity, scope, and ambiguity.' },
      { id: 'plan', label: 'Plan Mode', description: 'Complex/multi-file tasks: investigate, design, then execute.' },
      { id: 'direct', label: 'Direct Execution', description: 'Clear scope, known fix, single file: implement immediately.' },
      { id: 'hybrid', label: 'Hybrid', description: 'Plan first, then switch to direct execution for implementation.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 380');
      addArrowDef(svg);

      // Top: New Task
      drawNode(svg, { x: 250, y: 20, w: 140, h: 42, label: 'New Task', id: 'task' });

      // Left branch
      drawArrow(svg, { x1: 270, y1: 62, x2: 155, y2: 130 });
      const lb = svgEl('text', { x: 170, y: 88, 'text-anchor': 'end', fill: COLORS.muted, 'font-size': '10' });
      lb.textContent = 'Complex? Multi-file?';
      svg.appendChild(lb);
      drawNode(svg, { x: 55, y: 130, w: 180, h: 42, label: 'Plan Mode', id: 'plan' });
      const planSub = svgEl('text', { x: 145, y: 196, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '10' });
      planSub.textContent = 'Investigate \u2192 Design \u2192 Execute';
      svg.appendChild(planSub);

      // Right branch
      drawArrow(svg, { x1: 370, y1: 62, x2: 485, y2: 130 });
      const rb = svgEl('text', { x: 470, y: 88, 'text-anchor': 'start', fill: COLORS.muted, 'font-size': '10' });
      rb.textContent = 'Clear scope? Known fix?';
      svg.appendChild(rb);
      drawNode(svg, { x: 400, y: 130, w: 180, h: 42, label: 'Direct Execution', id: 'direct' });
      const directSub = svgEl('text', { x: 490, y: 196, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '10' });
      directSub.textContent = 'Implement immediately';
      svg.appendChild(directSub);

      // Bottom: Hybrid
      drawArrow(svg, { x1: 145, y1: 176, x2: 280, y2: 270 });
      drawArrow(svg, { x1: 490, y1: 176, x2: 360, y2: 270 });
      drawNode(svg, { x: 230, y: 270, w: 180, h: 42, label: 'Hybrid Approach', id: 'hybrid' });
      const hybridSub = svgEl('text', { x: 320, y: 336, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '10' });
      hybridSub.textContent = 'Plan first, then execute directly';
      svg.appendChild(hybridSub);

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 4. Structured Handoff Protocol — Domain 1 */
  DIAGRAMS['handoff-protocol'] = {
    title: 'Structured Handoff to Human Agent',
    domain: 1,
    steps: [
      { id: 'ai', label: 'AI Conversation', description: 'AI agent conducts the customer conversation and gathers context.' },
      { id: 'compile', label: 'Compile Summary', description: 'AI compiles a structured handoff summary with all required fields.' },
      { id: 'fields', label: 'Required Fields', description: 'Customer ID, Conversation Summary, Root Cause, Refund Amount, Recommended Action.' },
      { id: 'human', label: 'Human Receives', description: 'Human agent receives the self-contained summary — no transcript access.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 380');
      addArrowDef(svg);

      // AI Agent
      drawNode(svg, { x: 20, y: 40, w: 120, h: 44, label: 'AI Agent', id: 'ai' });
      // Conversation bubbles below the node
      [100, 118, 136].forEach(y => {
        svg.appendChild(svgEl('rect', { x: 35, y, width: 45, height: 10, rx: 5, fill: COLORS.dimmed }));
      });

      // Handoff arrow
      drawArrow(svg, { x1: 140, y1: 62, x2: 195, y2: 62, label: 'handoff' });

      // Handoff Summary box
      const g = svgEl('g', { 'data-node-id': 'compile', cursor: 'pointer' });
      g.appendChild(svgEl('rect', { x: 195, y: 20, width: 250, height: 160, rx: 10, fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5' }));
      const ht = svgEl('text', { x: 320, y: 46, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '13', 'font-weight': '600' });
      ht.textContent = 'Handoff Summary';
      g.appendChild(ht);
      const fields = ['Customer ID', 'Conversation Summary', 'Root Cause Analysis', 'Refund Amount', 'Recommended Action'];
      fields.forEach((f, i) => {
        const ft = svgEl('text', { x: 215, y: 72 + i * 22, fill: COLORS.dark, 'font-size': '11' });
        ft.textContent = '\u2022 ' + f;
        g.appendChild(ft);
      });
      svg.appendChild(g);

      // Arrow to human
      drawArrow(svg, { x1: 445, y1: 62, x2: 500, y2: 62 });

      // Human Agent
      drawNode(svg, { x: 500, y: 40, w: 120, h: 44, label: 'Human Agent', id: 'human' });

      // Callout box
      const cg = svgEl('g', { 'data-node-id': 'fields', cursor: 'pointer' });
      cg.appendChild(svgEl('rect', { x: 100, y: 220, width: 440, height: 55, rx: 8, fill: '#fff3e0', stroke: COLORS.warning, 'stroke-width': '1.5' }));
      const ct = svgEl('text', { x: 320, y: 243, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11', 'font-weight': '600' });
      ct.textContent = '\u26a0 Human does NOT have conversation transcript';
      cg.appendChild(ct);
      const ct2 = svgEl('text', { x: 320, y: 263, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '10' });
      ct2.textContent = 'Summary must be self-contained';
      cg.appendChild(ct2);
      svg.appendChild(cg);

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 5. Path-Specific Rules — Domain 3 */
  DIAGRAMS['path-rules'] = {
    title: 'Path-Specific Rules vs Directory CLAUDE.md',
    domain: 3,
    steps: [
      { id: 'files', label: 'Test Files Spread', description: 'Test files are scattered across many directories in the project.' },
      { id: 'dir-approach', label: 'Directory Approach', description: 'Would need a CLAUDE.md in every directory — 50+ copies.' },
      { id: 'glob', label: 'Glob Pattern', description: 'A single rule file with paths: ["**/*.test.tsx"] catches all test files.' },
      { id: 'loads', label: 'Loads On Demand', description: 'Rule only loads when editing a matching test file.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 380');

      // Left: file tree
      const treeX = 20, treeY = 40;
      const fg = svgEl('g', { 'data-node-id': 'files', cursor: 'pointer' });
      fg.appendChild(svgEl('rect', { x: treeX, y: treeY, width: 190, height: 180, rx: 8, fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5' }));
      const treeTitle = svgEl('text', { x: treeX + 95, y: treeY + 20, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11', 'font-weight': '600' });
      treeTitle.textContent = 'Project Structure';
      fg.appendChild(treeTitle);
      const treeFiles = ['src/auth/login.test.tsx', 'src/api/users.test.tsx', 'src/utils/helpers.test.tsx', 'src/ui/button.test.tsx', 'src/db/query.test.tsx'];
      treeFiles.forEach((f, i) => {
        const ft = svgEl('text', { x: treeX + 15, y: treeY + 48 + i * 22, fill: COLORS.dark, 'font-size': '10', 'font-family': 'monospace' });
        ft.textContent = f;
        fg.appendChild(ft);
      });
      svg.appendChild(fg);

      // Right top: Directory approach (bad)
      const dg = svgEl('g', { 'data-node-id': 'dir-approach', cursor: 'pointer' });
      dg.appendChild(svgEl('rect', { x: 250, y: 40, width: 370, height: 100, rx: 8, fill: '#fef2f2', stroke: '#c44', 'stroke-width': '1.5' }));
      const dt = svgEl('text', { x: 435, y: 65, 'text-anchor': 'middle', fill: '#c44', 'font-size': '12', 'font-weight': '600' });
      dt.textContent = '\u2717 Directory CLAUDE.md Approach';
      dg.appendChild(dt);
      ['src/auth/CLAUDE.md', 'src/api/CLAUDE.md', 'src/utils/CLAUDE.md', '...50+ copies needed'].forEach((f, i) => {
        const ft = svgEl('text', { x: 270, y: 88 + i * 16, fill: COLORS.muted, 'font-size': '10', 'font-family': i < 3 ? 'monospace' : 'Inter,sans-serif', 'font-weight': i === 3 ? '600' : '400' });
        ft.textContent = f;
        dg.appendChild(ft);
      });
      svg.appendChild(dg);

      // Right bottom: Glob approach (good)
      const gg = svgEl('g', { 'data-node-id': 'glob', cursor: 'pointer' });
      gg.appendChild(svgEl('rect', { x: 250, y: 160, width: 370, height: 100, rx: 8, fill: '#f0fdf4', stroke: COLORS.success, 'stroke-width': '1.5' }));
      const gt = svgEl('text', { x: 435, y: 185, 'text-anchor': 'middle', fill: COLORS.success, 'font-size': '12', 'font-weight': '600' });
      gt.textContent = '\u2713 Path-Specific Rule';
      gg.appendChild(gt);
      const gp = svgEl('text', { x: 270, y: 210, fill: COLORS.dark, 'font-size': '10', 'font-family': 'monospace' });
      gp.textContent = '.claude/rules/testing.md';
      gg.appendChild(gp);
      const gp2 = svgEl('text', { x: 270, y: 228, fill: COLORS.muted, 'font-size': '10', 'font-family': 'monospace' });
      gp2.textContent = 'paths: ["**/*.test.tsx"]';
      gg.appendChild(gp2);
      const gp3 = svgEl('text', { x: 270, y: 248, fill: COLORS.muted, 'font-size': '10' });
      gp3.textContent = 'Single file catches ALL test files';
      gg.appendChild(gp3);
      svg.appendChild(gg);

      // Loads on demand note
      const lg = svgEl('g', { 'data-node-id': 'loads', cursor: 'pointer' });
      lg.appendChild(svgEl('rect', { x: 250, y: 280, width: 370, height: 40, rx: 8, fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5' }));
      const lt = svgEl('text', { x: 435, y: 305, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11' });
      lt.textContent = 'Rule loads only when editing a *.test.tsx file';
      lg.appendChild(lt);
      svg.appendChild(lg);

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 6. Access Failure vs Valid Empty Result — Domain 2 */
  DIAGRAMS['access-vs-empty'] = {
    title: 'Access Failure vs Valid Empty Result',
    domain: 2,
    steps: [
      { id: 'query', label: 'Tool Queries DB', description: 'A tool attempts to query the database for results.' },
      { id: 'fail', label: 'Access Failure', description: 'Connection fails — status: error — agent should consider retrying.' },
      { id: 'empty', label: 'Valid Empty', description: 'Query succeeds but returns zero results — status: success, results: [].' },
      { id: 'response', label: 'Different Responses', description: 'Access failure needs retry; empty result IS the answer — no retry.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 440');
      addArrowDef(svg);

      // Column headers
      const failTitle = svgEl('text', { x: 120, y: 25, 'text-anchor': 'middle', fill: '#c44', 'font-size': '13', 'font-weight': '700' });
      failTitle.textContent = 'Access Failure';
      svg.appendChild(failTitle);
      const emptyTitle = svgEl('text', { x: 500, y: 25, 'text-anchor': 'middle', fill: COLORS.success, 'font-size': '13', 'font-weight': '700' });
      emptyTitle.textContent = 'Valid Empty Result';
      svg.appendChild(emptyTitle);

      // Left flow: failure
      drawNode(svg, { x: 65, y: 45, w: 110, h: 38, label: 'Tool', id: 'query' });
      drawArrow(svg, { x1: 120, y1: 83, x2: 120, y2: 120 });

      const dbL = svgEl('g');
      dbL.appendChild(svgEl('rect', { x: 80, y: 120, width: 80, height: 38, rx: 8, fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5' }));
      const dbLt = svgEl('text', { x: 120, y: 144, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11' });
      dbLt.textContent = 'Database';
      dbL.appendChild(dbLt);
      svg.appendChild(dbL);
      const rx = svgEl('text', { x: 168, y: 144, fill: '#c44', 'font-size': '18', 'font-weight': '700' });
      rx.textContent = '\u2717';
      svg.appendChild(rx);

      drawArrow(svg, { x1: 120, y1: 158, x2: 120, y2: 200 });
      drawNode(svg, { x: 35, y: 200, w: 170, h: 38, label: 'Access Failure', id: 'fail' });

      const s1 = svgEl('text', { x: 120, y: 262, 'text-anchor': 'middle', fill: '#c44', 'font-size': '10', 'font-family': 'monospace' });
      s1.textContent = 'status: error';
      svg.appendChild(s1);

      drawArrow(svg, { x1: 120, y1: 272, x2: 120, y2: 310 });
      const retry = svgEl('text', { x: 120, y: 332, 'text-anchor': 'middle', fill: COLORS.warning, 'font-size': '13', 'font-weight': '600' });
      retry.textContent = 'Retry?';
      svg.appendChild(retry);

      // Right flow: valid empty
      drawNode(svg, { x: 445, y: 45, w: 110, h: 38, label: 'Tool', id: 'query-r' });
      drawArrow(svg, { x1: 500, y1: 83, x2: 500, y2: 120 });

      const dbR = svgEl('g');
      dbR.appendChild(svgEl('rect', { x: 460, y: 120, width: 80, height: 38, rx: 8, fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5' }));
      const dbRt = svgEl('text', { x: 500, y: 144, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11' });
      dbRt.textContent = 'Database';
      dbR.appendChild(dbRt);
      svg.appendChild(dbR);
      const gc = svgEl('text', { x: 548, y: 144, fill: COLORS.success, 'font-size': '18', 'font-weight': '700' });
      gc.textContent = '\u2713';
      svg.appendChild(gc);

      drawArrow(svg, { x1: 500, y1: 158, x2: 500, y2: 200 });
      drawNode(svg, { x: 405, y: 200, w: 190, h: 38, label: 'Valid Empty Result', id: 'empty' });

      const s2 = svgEl('text', { x: 500, y: 262, 'text-anchor': 'middle', fill: COLORS.success, 'font-size': '10', 'font-family': 'monospace' });
      s2.textContent = 'status: success, results: []';
      svg.appendChild(s2);

      drawArrow(svg, { x1: 500, y1: 272, x2: 500, y2: 310 });
      const noRetry = svgEl('text', { x: 500, y: 332, 'text-anchor': 'middle', fill: COLORS.success, 'font-size': '13', 'font-weight': '600' });
      noRetry.textContent = 'No results IS the answer';
      svg.appendChild(noRetry);

      // VS divider
      const vs = svgEl('text', { x: 310, y: 225, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '15', 'font-weight': '700' });
      vs.textContent = 'vs';
      svg.appendChild(vs);
      svg.appendChild(svgEl('line', { x1: 310, y1: 45, x2: 310, y2: 205, stroke: COLORS.dimmed, 'stroke-width': '1', 'stroke-dasharray': '4,3' }));
      svg.appendChild(svgEl('line', { x1: 310, y1: 245, x2: 310, y2: 350, stroke: COLORS.dimmed, 'stroke-width': '1', 'stroke-dasharray': '4,3' }));

      // Callout
      const cg = svgEl('g', { 'data-node-id': 'response', cursor: 'pointer' });
      cg.appendChild(svgEl('rect', { x: 120, y: 370, width: 400, height: 44, rx: 8, fill: '#fff3e0', stroke: COLORS.warning, 'stroke-width': '1.5' }));
      const ct = svgEl('text', { x: 320, y: 397, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11', 'font-weight': '600' });
      ct.textContent = 'Confusing these breaks recovery logic';
      cg.appendChild(ct);
      svg.appendChild(cg);

      if (step >= 0 && step < this.steps.length) highlightNode(svg, this.steps[step].id);
    },
  };

  /* 7. Claim-Source Provenance Chain — Domain 5 */
  DIAGRAMS['provenance-chain'] = {
    title: 'Information Provenance Through Synthesis',
    domain: 5,
    steps: [
      { id: 'agents', label: 'Agents Produce Claims', description: 'Web search and document analysis agents output structured claims with source metadata.' },
      { id: 'coordinator', label: 'Coordinator Merges', description: 'Coordinator merges claim-source mappings from all agents.' },
      { id: 'synthesis', label: 'Synthesis Preserves', description: 'Synthesis agent preserves attribution through summarisation.' },
      { id: 'report', label: 'Final Report', description: 'Final report includes claim + source URL + doc name + date.' },
    ],
    draw(container, { step = -1 } = {}) {
      const svg = createSvg(container, '0 0 640 380');
      addArrowDef(svg);
      const nw = 120, nh = 44;
      const midY = 100;

      // Web Search Agent
      drawNode(svg, { x: 20, y: midY - 60, w: nw, h: nh, label: 'Web Search', id: 'agents' });
      const ws = svgEl('text', { x: 80, y: midY - 4, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '9' });
      ws.textContent = 'claims + sources';
      svg.appendChild(ws);

      // Document Analysis Agent
      drawNode(svg, { x: 20, y: midY + 50, w: nw, h: nh, label: 'Doc Analysis', id: 'agents-doc' });
      const da = svgEl('text', { x: 80, y: midY + 106, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '9' });
      da.textContent = 'claims + sources';
      svg.appendChild(da);

      // Arrows to coordinator
      drawArrow(svg, { x1: 140, y1: midY - 38, x2: 200, y2: midY + 10 });
      drawArrow(svg, { x1: 140, y1: midY + 72, x2: 200, y2: midY + 30 });

      // Coordinator
      drawNode(svg, { x: 200, y: midY, w: nw, h: nh, label: 'Coordinator', id: 'coordinator' });
      const cm = svgEl('text', { x: 260, y: midY + 60, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '9' });
      cm.textContent = 'merges claim-source maps';
      svg.appendChild(cm);

      // Arrow to synthesis
      drawArrow(svg, { x1: 320, y1: midY + 22, x2: 380, y2: midY + 22 });

      // Synthesis Agent
      drawNode(svg, { x: 380, y: midY, w: nw, h: nh, label: 'Synthesis', id: 'synthesis' });
      const sa = svgEl('text', { x: 440, y: midY + 60, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': '9' });
      sa.textContent = 'preserves attribution';
      svg.appendChild(sa);

      // Arrow to report
      drawArrow(svg, { x1: 500, y1: midY + 22, x2: 540, y2: midY + 22 });

      // Final Report box
      const rg = svgEl('g', { 'data-node-id': 'report', cursor: 'pointer' });
      rg.appendChild(svgEl('rect', { x: 540, y: midY - 20, width: 90, height: 120, rx: 8, fill: COLORS.nodeBg, stroke: COLORS.nodeBorder, 'stroke-width': '1.5' }));
      const rt = svgEl('text', { x: 585, y: midY, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11', 'font-weight': '600' });
      rt.textContent = 'Final Report';
      rg.appendChild(rt);
      ['claim', 'source URL', 'doc name', 'date'].forEach((f, i) => {
        const ft = svgEl('text', { x: 554, y: midY + 22 + i * 18, fill: COLORS.muted, 'font-size': '9' });
        ft.textContent = '\u2022 ' + f;
        rg.appendChild(ft);
      });
      svg.appendChild(rg);

      // Callout
      const cg = svgEl('g');
      cg.appendChild(svgEl('rect', { x: 100, y: 250, width: 440, height: 40, rx: 8, fill: '#fff3e0', stroke: COLORS.warning, 'stroke-width': '1.5' }));
      const ct = svgEl('text', { x: 320, y: 275, 'text-anchor': 'middle', fill: COLORS.dark, 'font-size': '11', 'font-weight': '600' });
      ct.textContent = 'Without structured metadata, attribution dies during summarisation';
      cg.appendChild(ct);
      svg.appendChild(cg);

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
