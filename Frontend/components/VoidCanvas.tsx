'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ProjectData {
  id: number;
  name: string;
  domain: string;
  tier: number;
  complexity: number;
  recency: number;
  desc: string;
  stack: string[];
  status: string;
  github: string;
  phase: number;
}

const PROJECTS: ProjectData[] = [
  { id: 0, name: 'Memoire', domain: 'LLM INFRA', tier: 0, complexity: 9, recency: 10,
    desc: 'AI notes platform with graph memory. Chat with your own journal entries. Memgraph + Next.js + Docker.',
    stack: ['Next.js', 'TypeScript', 'Memgraph', 'Docker', 'LLM'],
    status: 'WIP', github: '#', phase: 0.1 },
  { id: 1, name: 'Azure Pavilion', domain: 'LLM INFRA', tier: 0, complexity: 10, recency: 10,
    desc: 'Open-source LiteLLM-inspired control plane. Multi-model routing, API key issuance, vLLM backend.',
    stack: ['vLLM', 'LiteLLM', 'FastAPI', 'Docker', 'OpenAPI'],
    status: 'WIP', github: '#', phase: 0.6 },
  { id: 2, name: 'Serenity CLI', domain: 'BACKEND', tier: 1, complexity: 7, recency: 8,
    desc: 'Internal AI CLI backed by private LLM endpoints. Auth, API key control, auditable consumption inside private networks.',
    stack: ['Python', 'FastAPI', 'CLI', 'Auth', 'Docker'],
    status: 'WIP', github: '#', phase: 0.0 },
  { id: 3, name: 'CV-Search', domain: 'AI / ML', tier: 1, complexity: 7, recency: 7,
    desc: 'Vector DB resume ranking system. LLM-powered similarity re-ranking for recruiters. pgvector + FastAPI.',
    stack: ['pgvector', 'FastAPI', 'SQLAlchemy', 'LLM', 'Python'],
    status: 'LIVE', github: '#', phase: 0.45 },
  { id: 4, name: 'ADAM System', domain: 'RESEARCH', tier: 2, complexity: 9, recency: 6,
    desc: 'Automotive Diagnostic & Monitoring. OBD-II + Raspberry Pi. AI driver behavior analysis. BITS Pilani research.',
    stack: ['Python', 'OBD-II', 'Raspberry Pi', 'ML', 'SQLite'],
    status: 'LIVE', github: '#', phase: 0.15 },
  { id: 5, name: 'TxtToSQL', domain: 'BACKEND', tier: 2, complexity: 6, recency: 5,
    desc: 'Natural language to SQL. Buffer-based context injection solves LLM memory limits. SQLAlchemy + Cursor.',
    stack: ['Python', 'SQLAlchemy', 'LLM', 'FastAPI', 'NLP'],
    status: 'LIVE', github: '#', phase: 0.65 },
];

const ORBITS = [
  { a: 0.30, b: 0.14, tx: 0.55, ty: 0.08, baseSpeed: 0.00035 },
  { a: 0.40, b: 0.20, tx: 0.45, ty: 0.06, baseSpeed: 0.00022 },
  { a: 0.52, b: 0.26, tx: 0.35, ty: 0.04, baseSpeed: 0.00013 },
];

export default function VoidCanvas() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // All mutable state lives in refs to avoid re-renders
  const stateRef = useRef({
    t: 0,
    selectedOrbit: -1,
    selectedProject: null as ProjectData | null,
    expandedOrb: null as number | null,
    expandProgress: 0,
    orbitSpeeds: ORBITS.map(o => o.baseSpeed),
    orbitAlpha: [0.18, 0.14, 0.10],
    panelOpen: false,
    mouseX: 0,
    mouseY: 0,
    hoveredOrb: -1,
    diskAngle: 0,
    miniT: 0,
    W: 0, H: 0, cx: 0, cy: 0,
    projects: PROJECTS.map(p => ({ ...p })), // mutable copy
  });

  const orbPositions = useRef(PROJECTS.map(() => ({ x: 0, y: 0, r: 0 })));

  // Initialize particles once
  const diskParticles = useRef<any[]>([]);
  const stars = useRef<any[]>([]);

  const initParticles = useCallback(() => {
    // Stars
    const s = [];
    for (let i = 0; i < 2200; i++) {
      s.push({
        x: Math.random(), y: Math.random(),
        s: 0.3 + Math.random() * 1.1,
        o: 0.2 + Math.random() * 0.8,
        tw: Math.random() * Math.PI * 2,
        twS: 0.005 + Math.random() * 0.015,
      });
    }
    stars.current = s;

    // Disk particles (Purple accretion ring)
    const dp = [];
    for (let i = 0; i < 300; i++) {
      const r = 0.09 + Math.random() * 0.13;
      dp.push({
        angle: Math.random() * Math.PI * 2,
        r, baseR: r,
        speed: (0.003 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1),
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.3 + Math.random() * 0.7,
        hue: 260 + Math.random() * 30, // Purple range replacing orange
      });
    }
    diskParticles.current = dp;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;
    const st = stateRef.current;

    initParticles();

    // ─── RESIZE ──────────────────────────────────────
    function resize() {
      st.W = canvas!.width = window.innerWidth;
      st.H = canvas!.height = window.innerHeight;
      st.cx = st.W / 2;
      st.cy = st.H / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    // ─── HELPERS ─────────────────────────────────────
    function projectEllipse(angle: number, cfg: typeof ORBITS[0]) {
      const ex = Math.cos(angle) * cfg.a * st.W;
      const ez = Math.sin(angle) * cfg.b * st.W;
      const px = ex;
      const py = ez * Math.sin(cfg.tx) - (cfg.b * st.W * 0.5) * Math.cos(cfg.tx) * 0.12;
      const pz = ez * Math.cos(cfg.tx);
      const depth = (pz + cfg.b * st.W) / (2 * cfg.b * st.W);
      return { x: st.cx + px, y: st.cy * 0.95 + py, depth, pz };
    }

    function getOrbRadius(proj: ProjectData) {
      return (8 + proj.complexity * 1.8) * (st.W / 1440);
    }

    function isNearOrbit(mx: number, my: number, oi: number) {
      const cfg = ORBITS[oi];
      for (let a = 0; a < Math.PI * 2; a += 0.08) {
        const pt = projectEllipse(a, cfg);
        const dx = mx - pt.x, dy = my - pt.y;
        if (Math.sqrt(dx * dx + dy * dy) < 18) return true;
      }
      return false;
    }

    // ─── PANEL ───────────────────────────────────────
    function selectProject(proj: ProjectData, idx: number) {
      if (st.expandedOrb === idx) { closePanel(); return; }
      st.expandedOrb = idx;
      st.expandProgress = 0;
      st.selectedProject = proj;
      st.selectedOrbit = proj.tier;

      if (titleRef.current) titleRef.current.textContent = proj.name;
      if (domainRef.current) domainRef.current.textContent = proj.domain + ' · ' + proj.status;
      if (descRef.current) descRef.current.textContent = proj.desc;
      if (stackRef.current) {
        stackRef.current.innerHTML = '';
        proj.stack.forEach(s => {
          const sp = document.createElement('span');
          sp.textContent = s;
          stackRef.current!.appendChild(sp);
        });
      }
      if (panelRef.current) panelRef.current.classList.add('open');
      st.panelOpen = true;
      drawMiniCanvas(proj);
    }

    function closePanel() {
      if (panelRef.current) panelRef.current.classList.remove('open');
      st.panelOpen = false;
      st.expandedOrb = null;
      st.selectedOrbit = -1;
    }

    // ─── MINI CANVAS ─────────────────────────────────
    let miniAnimId: number;
    function drawMiniCanvas(proj: ProjectData) {
      const mc = miniCanvasRef.current;
      if (!mc) return;
      const mctx = mc.getContext('2d') as CanvasRenderingContext2D;
      if (!mctx) return;
      const mw = 344, mh = 140, mcx = mw / 2, mcy = mh / 2;
      const baseR = 28 + proj.complexity * 1.5;

      if (miniAnimId) cancelAnimationFrame(miniAnimId);

      (function loop() {
        if (!st.panelOpen) return;
        st.miniT += 0.02;
        mctx.clearRect(0, 0, mw, mh);

        // Glow
        const g = mctx.createRadialGradient(mcx, mcy, 0, mcx, mcy, baseR * 2.5);
        g.addColorStop(0, 'rgba(192,132,252,0.15)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = g;
        mctx.fillRect(0, 0, mw, mh);

        // Rotating rings
        for (let i = 0; i < 3; i++) {
          const rr = baseR * 1.4 + i * 8;
          const opacity = 0.15 - i * 0.04;
          mctx.save();
          mctx.translate(mcx, mcy);
          mctx.rotate(st.miniT * 0.3 * (i % 2 === 0 ? 1 : -1));
          mctx.strokeStyle = `rgba(192,132,252,${opacity})`;
          mctx.lineWidth = 0.8;
          mctx.setLineDash([4, 8 + i * 3]);
          mctx.lineDashOffset = -st.miniT * 30 * (i + 1);
          mctx.beginPath();
          mctx.ellipse(0, 0, rr, rr * 0.35, 0, 0, Math.PI * 2);
          mctx.stroke();
          mctx.restore();
        }

        // Core orb
        const cg = mctx.createRadialGradient(mcx - baseR * 0.25, mcy - baseR * 0.25, 0, mcx, mcy, baseR);
        cg.addColorStop(0, 'rgba(230,210,255,0.95)');
        cg.addColorStop(0.4, 'rgba(192,132,252,0.9)');
        cg.addColorStop(0.8, 'rgba(109,40,217,0.8)');
        cg.addColorStop(1, 'rgba(60,10,120,0.6)');
        mctx.fillStyle = cg;
        mctx.beginPath();
        mctx.arc(mcx, mcy, baseR, 0, Math.PI * 2);
        mctx.fill();

        // Shimmer
        mctx.save();
        mctx.translate(mcx, mcy);
        mctx.rotate(st.miniT * 0.5);
        const sg = mctx.createLinearGradient(-baseR, 0, baseR, 0);
        sg.addColorStop(0, 'rgba(255,255,255,0)');
        sg.addColorStop(0.5, 'rgba(255,255,255,0.12)');
        sg.addColorStop(1, 'rgba(255,255,255,0)');
        mctx.fillStyle = sg;
        mctx.beginPath();
        mctx.ellipse(0, 0, baseR, baseR * 0.4, 0, 0, Math.PI * 2);
        mctx.fill();
        mctx.restore();

        // Status dot
        mctx.fillStyle = proj.status === 'LIVE' ? '#22c55e' : '#f59e0b';
        mctx.beginPath();
        mctx.arc(mcx + baseR + 8, mcy, 4, 0, Math.PI * 2);
        mctx.fill();
        mctx.fillStyle = proj.status === 'LIVE' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)';
        mctx.beginPath();
        mctx.arc(mcx + baseR + 8, mcy, 8, 0, Math.PI * 2);
        mctx.fill();

        miniAnimId = requestAnimationFrame(loop);
      })();
    }

    // ─── EVENTS ──────────────────────────────────────
    function handleMouseMove(e: MouseEvent) {
      st.mouseX = e.clientX;
      st.mouseY = e.clientY;
    }

    function handleClick(e: MouseEvent) {
      const mx = e.clientX, my = e.clientY;

      // Check orb clicks first
      for (let i = 0; i < st.projects.length; i++) {
        const op = orbPositions.current[i];
        const dx = mx - op.x, dy = my - op.y;
        if (Math.sqrt(dx * dx + dy * dy) < op.r * 2.5) {
          selectProject(st.projects[i], i);
          return;
        }
      }

      // Check orbit ring clicks
      for (let oi = 0; oi < ORBITS.length; oi++) {
        if (isNearOrbit(mx, my, oi)) {
          st.selectedOrbit = st.selectedOrbit === oi ? -1 : oi;
          return;
        }
      }

      // Click empty space
      if (st.panelOpen) closePanel();
      else st.selectedOrbit = -1;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel();
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    // Hint fade
    const hintTimeout = setTimeout(() => {
      if (hintRef.current) hintRef.current.style.opacity = '0';
    }, 5000);

    // ─── DRAW: STARS ─────────────────────────────────
    function drawStars() {
      stars.current.forEach(s => {
        s.tw += s.twS;
        const o = s.o * (0.7 + Math.sin(s.tw) * 0.3);
        ctx.fillStyle = `rgba(220,215,255,${o})`;
        ctx.beginPath();
        ctx.arc(s.x * st.W, s.y * st.H, s.s, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ─── DRAW: BLACK HOLE LAYERS ─────────────────────
    const BHR = st.W * 0.085; // slightly smaller than 0.095 to give space
    const diskTilt = -0.35; // Diagonal tilt like the reference
    const diskYRatio = 0.12; // Very flat disk
    const diskR = BHR * 2.2; 

    function drawDiskArc(isFront: boolean) {
      const bx = st.cx, by = st.cy * 0.95;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(diskTilt);
      
      // For a flat disk tilted, front is 0 to PI, back is PI to 2PI
      const startA = isFront ? 0 : Math.PI;
      const endA = isFront ? Math.PI : Math.PI * 2;

      // Outer diffuse glow
      ctx.beginPath();
      ctx.ellipse(0, 0, diskR * 1.1, diskR * 1.1 * diskYRatio, 0, startA, endA);
      ctx.strokeStyle = isFront ? 'rgba(160,80,255,0.1)' : 'rgba(140,60,250,0.05)';
      ctx.lineWidth = BHR * 0.4;
      ctx.stroke();

      // Dense glowing rings
      for(let i=0; i<3; i++) {
        ctx.beginPath();
        const r = diskR * (1 - i * 0.15);
        ctx.ellipse(0, 0, r, r * diskYRatio, 0, startA, endA);
        
        ctx.lineWidth = i === 0 ? 1.5 : (i === 1 ? 3 : 8);
        ctx.strokeStyle = i === 0 ? 'rgba(255,240,255,0.9)' : 
                          (i === 1 ? 'rgba(210,140,255,0.6)' : 'rgba(140,40,255,0.2)');
        
        if (isFront && i === 0) {
          ctx.shadowColor = 'rgba(210,140,255,0.8)';
          ctx.shadowBlur = 15;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
      }

      ctx.restore();

      // Particles belonging to this side
      const pzThreshold = 0;
      diskParticles.current.forEach(p => {
        p.angle += p.speed * (1 + st.t * 0.000001);
        const px = Math.cos(p.angle) * p.r * st.W * 1.2;
        const py = Math.sin(p.angle) * p.r * st.W * 1.2 * diskYRatio;
        
        // rotate particle position by diskTilt
        const rotX = px * Math.cos(diskTilt) - py * Math.sin(diskTilt);
        const rotY = px * Math.sin(diskTilt) + py * Math.cos(diskTilt);
        
        const finalX = bx + rotX;
        const finalY = by + rotY;

        // Depth is approximately Math.sin(p.angle). 
        // angle=0->PI is front (sin>0), PI->2PI is back (sin<0)
        const depth = Math.sin(p.angle);
        const isParticleFront = depth >= 0;

        if (isParticleFront === isFront) {
          const heat = 1 - (p.r - 0.09) / 0.13;
          ctx.fillStyle = `hsla(${p.hue},90%,${65 + heat * 20}%,${p.opacity * (0.4 + Math.abs(depth) * 0.6)})`;
          ctx.beginPath();
          ctx.arc(finalX, finalY, p.size * (0.6 + Math.abs(depth) * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    function drawBlackHoleCore() {
      const bx = st.cx, by = st.cy * 0.95;

      // Event horizon edge sharpness (matte black with tiny edge bleed)
      const rimG = ctx.createRadialGradient(bx, by, BHR * 0.95, bx, by, BHR * 1.05);
      rimG.addColorStop(0, 'rgba(0,0,0,1)');
      rimG.addColorStop(0.7, 'rgba(25,5,40,0.8)');
      rimG.addColorStop(0.9, 'rgba(60,20,100,0.3)');
      rimG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rimG;
      ctx.beginPath();
      ctx.arc(bx, by, BHR * 1.08, 0, Math.PI * 2);
      ctx.fill();

      // Core (Absolute 100% flat matte black, no reflection)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(bx, by, BHR, 0, Math.PI * 2);
      ctx.fill();

      // Lensing shimmer around the edges
      ctx.save();
      ctx.translate(bx, by);
      const lensG = ctx.createRadialGradient(0, 0, BHR, 0, 0, BHR * 1.4);
      lensG.addColorStop(0, 'rgba(100,50,200,0.0)');
      lensG.addColorStop(0.5, 'rgba(130,70,230,0.04)');
      lensG.addColorStop(0.8, 'rgba(80,15,160,0.02)');
      lensG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lensG;
      ctx.beginPath();
      ctx.arc(0, 0, BHR * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ─── DRAW: ORBITS ────────────────────────────────
    function drawOrbitsArc(isFront: boolean) {
      // In JS sin(angle) controls z-depth. Front is angles 0 to PI. Back is PI to 2PI.
      const startPct = isFront ? 0 : 0.5;
      const endPct = isFront ? 0.5 : 1.0;

      for (let oi = 0; oi < ORBITS.length; oi++) {
        const cfg = ORBITS[oi];
        const isSelected = st.selectedOrbit === oi;
        const alpha = st.orbitAlpha[oi];

        ctx.save();
        ctx.strokeStyle = isSelected
          ? `rgba(220,180,255,${alpha})`
          : `rgba(192,132,252,${alpha})`;
        ctx.lineWidth = isSelected ? 1.5 : 0.8;
        ctx.setLineDash(isSelected ? [] : [4, 12]);

        if (isSelected && isFront) {
          ctx.shadowColor = 'rgba(192,132,252,0.4)';
          ctx.shadowBlur = 12;
        }

        ctx.beginPath();
        const pts = 100;
        let first = true;
        for (let i = 0; i <= pts; i++) {
          const angle = (startPct + (i / pts) * (endPct - startPct)) * Math.PI * 2;
          const pt = projectEllipse(angle, cfg);
          if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Draw label only on front pass
        if (isSelected && isFront) {
          const labelPt = projectEllipse(Math.PI * 1.2, cfg);
          ctx.font = '10px "IBM Plex Mono"';
          ctx.fillStyle = 'rgba(220,180,255,0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(`ORBIT ${String.fromCharCode(65 + oi)} · ${oi === 0 ? 'INNER' : oi === 1 ? 'MID' : 'OUTER'}`, labelPt.x, labelPt.y - 14);
        }

        ctx.restore();
      }
    }

    // ─── DRAW: ORBS ──────────────────────────────────
    function drawOrbsSet(isFront: boolean) {
      // Sort by depth (back to front)
      const sorted = st.projects.map((p, i) => ({ p, i }));
      sorted.sort((a, b) => {
        const ptA = projectEllipse(a.p.phase * Math.PI * 2, ORBITS[a.p.tier]);
        const ptB = projectEllipse(b.p.phase * Math.PI * 2, ORBITS[b.p.tier]);
        return ptB.pz - ptA.pz;
      });

      st.hoveredOrb = -1;

      sorted.forEach(({ p, i }) => {
        const cfg = ORBITS[p.tier];
        const angle = p.phase * Math.PI * 2;
        const pt = projectEllipse(angle, cfg);

        // Front pass renders elements with pt.pz >= 0, Back pass renders pt.pz < 0
        if (isFront ? pt.pz < 0 : pt.pz >= 0) return;

        const isExpanded = st.expandedOrb === i;
        const depthScale = 0.6 + pt.depth * 0.4;
        const baseR = getOrbRadius(p) * depthScale;
        const expandScale = isExpanded ? (1 + st.expandProgress * 2.5) : 1;
        const r = baseR * expandScale;
        const px = pt.x, py = pt.y;

        orbPositions.current[i] = { x: px, y: py, r: baseR * 1.2 };

        // Glow / corona
        const glowR = r * 2.5;
        const glowAlpha = isExpanded ? 0.25 : 0.12;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        glow.addColorStop(0, `rgba(192,132,252,${glowAlpha})`);
        glow.addColorStop(0.5, `rgba(109,40,217,${glowAlpha * 0.4})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Orb surface
        const orbG = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r);
        const brightness = isExpanded ? 1.15 : depthScale;
        orbG.addColorStop(0, `rgba(235,215,255,${0.95 * brightness})`);
        orbG.addColorStop(0.35, `rgba(192,132,252,${0.9 * brightness})`);
        orbG.addColorStop(0.7, `rgba(109,40,217,${0.8 * brightness})`);
        orbG.addColorStop(1, `rgba(50,10,100,${0.6 * brightness})`);
        ctx.fillStyle = orbG;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();

        // Surface shimmer
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(st.t * 0.02 * (isExpanded ? 0.5 : 1));
        const shimG = ctx.createLinearGradient(-r, 0, r, 0);
        shimG.addColorStop(0, 'rgba(255,255,255,0)');
        shimG.addColorStop(0.5, 'rgba(255,255,255,0.15)');
        shimG.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = shimG;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Expanded state
        if (isExpanded && st.expandProgress > 0.3) {
          const ep = Math.min(1, (st.expandProgress - 0.3) / 0.7);

          for (let ri = 0; ri < 3; ri++) {
            const rr = r * (1.5 + ri * 0.7);
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(st.t * 0.015 * (ri % 2 === 0 ? 1 : -1));
            ctx.strokeStyle = `rgba(192,132,252,${0.25 * ep - ri * 0.06})`;
            ctx.lineWidth = 0.8;
            ctx.setLineDash([3, 7 + ri * 2]);
            ctx.beginPath();
            ctx.ellipse(0, 0, rr, rr * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          ctx.save();
          ctx.globalAlpha = ep;
          ctx.font = `bold ${Math.floor(11 * depthScale)}px "IBM Plex Mono"`;
          ctx.fillStyle = 'rgba(240,230,255,0.9)';
          ctx.textAlign = 'center';
          ctx.fillText(p.name, px, py - r * 1.8);

          const statusColor = p.status === 'LIVE' ? 'rgba(34,197,94,0.85)' : 'rgba(245,158,11,0.85)';
          ctx.font = '9px "IBM Plex Mono"';
          ctx.fillStyle = statusColor;
          ctx.fillText('● ' + p.status, px, py - r * 1.8 + 16);
          ctx.restore();
        } else if (!isExpanded) {
          // Hover label
          const dx = st.mouseX - px, dy = st.mouseY - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < baseR * 2.5) {
            st.hoveredOrb = i;
            ctx.font = '10px "IBM Plex Mono"';
            ctx.fillStyle = 'rgba(220,200,255,0.75)';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, px, py - baseR * 1.6);
          }
        }

        // Status dot
        const dotColor = p.status === 'LIVE' ? '#22c55e' : '#f59e0b';
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(px + r * 0.75, py - r * 0.75, 2.5 * depthScale, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ─── MAIN LOOP ───────────────────────────────────
    let animId: number;
    function draw() {
      st.t++;
      ctx.clearRect(0, 0, st.W, st.H);

      // Speeds
      for (let i = 0; i < 3; i++) {
        const target = st.selectedOrbit === i ? ORBITS[i].baseSpeed * 0.15 : ORBITS[i].baseSpeed;
        st.orbitSpeeds[i] += (target - st.orbitSpeeds[i]) * 0.04;
      }

      // Orbit alpha
      for (let i = 0; i < 3; i++) {
        const target = st.selectedOrbit === i ? 0.55 : (st.selectedOrbit === -1 ? 0.18 - i * 0.04 : 0.08);
        st.orbitAlpha[i] += (target - st.orbitAlpha[i]) * 0.06;
      }

      // Expand progress
      if (st.expandedOrb !== null && st.expandProgress < 1) {
        st.expandProgress = Math.min(1, st.expandProgress + 0.04);
      }

      drawStars();

      // BACK LAYER: Behind the black hole
      drawOrbitsArc(false);  // back of orbits
      drawOrbsSet(false);    // orbs pushed into -Z space
      drawDiskArc(false);    // back of accretion disk
      
      // CORE: Central occlusion body
      drawBlackHoleCore();   
      
      // FRONT LAYER: In front of the black hole
      drawDiskArc(true);     // front of accretion disk
      drawOrbitsArc(true);   // front of orbits
      drawOrbsSet(true);     // orbs pulled into +Z space
      
      // Update orb phases globally once per frame
      st.projects.forEach(p => {
        p.phase = (p.phase + st.orbitSpeeds[p.tier]) % 1;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    // Panel close button
    const panelCloseEl = document.getElementById('panel-close-btn');
    const panelCloseHandler = () => closePanel();
    panelCloseEl?.addEventListener('click', panelCloseHandler);

    return () => {
      cancelAnimationFrame(animId);
      if (miniAnimId) cancelAnimationFrame(miniAnimId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      panelCloseEl?.removeEventListener('click', panelCloseHandler);
      clearTimeout(hintTimeout);
    };
  }, [initParticles]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        .void-root *{margin:0;padding:0;box-sizing:border-box}
        .void-root{width:100vw;height:100vh;overflow:hidden;background:#03000a;cursor:default;position:fixed;inset:0}
        #void-canvas{display:block;width:100%;height:100%;position:absolute;inset:0;z-index:1}
        .void-identity{position:fixed;top:28px;left:32px;z-index:10;pointer-events:none}
        .void-identity h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:#f0ecff;letter-spacing:-.01em}
        .void-identity p{font-family:'IBM Plex Mono',monospace;font-size:11px;color:rgba(192,132,252,.45);margin-top:3px;letter-spacing:.06em}
        .void-nav{position:fixed;top:28px;right:32px;z-index:10;display:flex;flex-direction:column;gap:18px;text-align:right}
        .void-nav a{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.14em;color:rgba(240,236,255,.32);text-decoration:none;transition:color .25s,letter-spacing .25s;cursor:pointer}
        .void-nav a:hover,.void-nav a.active{color:#c084fc;letter-spacing:.18em}
        .void-status{position:fixed;bottom:0;left:0;right:0;z-index:10;height:34px;background:rgba(3,0,10,.92);border-top:1px solid rgba(192,132,252,.1);display:flex;align-items:center;padding:0 20px;gap:14px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:rgba(240,236,255,.38)}
        .void-status .dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:vpulse 2s infinite;flex-shrink:0}
        .void-status .live{color:#22c55e;font-weight:500;letter-spacing:.08em}
        .void-status .hl{color:#c084fc}
        @keyframes vpulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.4)}50%{opacity:.7;box-shadow:0 0 0 4px rgba(34,197,94,0)}}
        .void-panel{position:fixed;right:-440px;top:0;bottom:34px;width:400px;z-index:20;background:rgba(6,2,18,.88);border-left:1px solid rgba(192,132,252,.15);backdrop-filter:blur(24px) saturate(180%);transition:right .6s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;box-shadow:inset 1px 0 0 rgba(192,132,252,.06),-20px 0 60px rgba(0,0,0,.6)}
        .void-panel.open{right:0}
        .void-panel-header{padding:28px 28px 0;display:flex;justify-content:space-between;align-items:flex-start}
        .void-panel-title{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;color:#f0ecff;line-height:1.2}
        .void-panel-close{font-family:'IBM Plex Mono',monospace;font-size:13px;color:rgba(192,132,252,.5);cursor:pointer;padding:4px 8px;border:1px solid rgba(192,132,252,.2);border-radius:4px;transition:all .2s;flex-shrink:0;margin-top:2px}
        .void-panel-close:hover{color:#c084fc;border-color:rgba(192,132,252,.5);background:rgba(192,132,252,.08)}
        .void-panel-domain{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;color:#7c3aed;padding:20px 28px 0}
        .void-panel-divider{height:1px;background:rgba(192,132,252,.12);margin:18px 28px}
        .void-panel-preview{margin:0 28px;height:140px;border-radius:10px;background:rgba(124,58,237,.08);border:1px solid rgba(192,132,252,.15);display:flex;align-items:center;justify-content:center;overflow:hidden}
        .void-panel-preview canvas{border-radius:10px}
        .void-panel-desc{padding:18px 28px 0;font-family:'IBM Plex Mono',monospace;font-size:12px;color:rgba(240,236,255,.65);line-height:1.75}
        .void-panel-stack{padding:16px 28px 0;display:flex;flex-wrap:wrap;gap:7px}
        .void-panel-stack span{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.08em;padding:4px 10px;border-radius:4px;background:rgba(124,58,237,.18);border:1px solid rgba(192,132,252,.25);color:rgba(192,132,252,.85)}
        .void-panel-links{padding:22px 28px;margin-top:auto;display:flex;gap:12px}
        .void-panel-links a{flex:1;text-align:center;padding:10px;border-radius:6px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.08em;text-decoration:none;transition:all .2s}
        .vbtn-primary{background:rgba(124,58,237,.25);border:1px solid rgba(192,132,252,.4);color:#c084fc}
        .vbtn-primary:hover{background:rgba(124,58,237,.4);border-color:#c084fc}
        .vbtn-ghost{background:transparent;border:1px solid rgba(192,132,252,.2);color:rgba(240,236,255,.5)}
        .vbtn-ghost:hover{border-color:rgba(192,132,252,.4);color:rgba(240,236,255,.8)}
        .void-hint{position:fixed;bottom:50px;left:50%;transform:translateX(-50%);font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.12em;color:rgba(240,236,255,.22);text-align:center;pointer-events:none;transition:opacity 1s;z-index:5}
      `}</style>

      <div className="void-root">
        {/* Identity */}
        <div className="void-identity">
          <h1>VOID.SYS</h1>
          <p>AI Engineer · Goa, IN</p>
        </div>

        {/* Navigation - Converted to Next.js Links */}
        <div className="void-nav">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>WORK</Link>
          <Link href="/stack" className={pathname === '/stack' ? 'active' : ''}>STACK</Link>
          <Link href="/signal" className={pathname === '/signal' ? 'active' : ''}>SIGNAL</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>CONTACT</Link>
        </div>

        {/* Hint */}
        <div className="void-hint" ref={hintRef}>
          CLICK ORBIT RING TO SLOW · CLICK ORB TO EXPLORE
        </div>

        {/* Status bar */}
        <div className="void-status">
          <div className="dot" />
          <span className="live">LIVE</span>
          <span>|</span>
          <span>Currently: <span className="hl">Azure Pavilion</span> — LiteLLM control plane</span>
          <span>|</span>
          <span>Last signal: 2m ago</span>
          <span>|</span>
          <span>Open to: Hire / Collaborate</span>
        </div>

        {/* Panel */}
        <div className="void-panel" ref={panelRef}>
          <div className="void-panel-header">
            <div className="void-panel-title" ref={titleRef}>Project Name</div>
            <div className="void-panel-close" id="panel-close-btn">ESC ×</div>
          </div>
          <div className="void-panel-domain" ref={domainRef}>DOMAIN · STATUS</div>
          <div className="void-panel-divider" />
          <div className="void-panel-preview">
            <canvas ref={miniCanvasRef} width={344} height={140} />
          </div>
          <div className="void-panel-desc" ref={descRef}>Description goes here.</div>
          <div className="void-panel-stack" ref={stackRef} />
          <div className="void-panel-links">
            <a href="#" className="vbtn-primary">GitHub ↗</a>
            <a href="#" className="vbtn-ghost">Case Study →</a>
          </div>
        </div>

        {/* Main canvas */}
        <canvas ref={canvasRef} id="void-canvas" />
      </div>
    </>
  );
}
