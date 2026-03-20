'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { BuildLog, Project } from '@/lib/types';
import { usePathname } from 'next/navigation';

interface VoidCanvasProps {
  projects: Project[];
  buildLog: BuildLog;
}

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

const ORBITS = [
  { r: 0.22, rotX: 1.25, rotY: 0.4, rotZ: 0.12, baseSpeed: 0.00035 },
  { r: 0.30, rotX: 1.35, rotY: -0.3, rotZ: -0.08, baseSpeed: 0.00022 },
  { r: 0.40, rotX: 1.40, rotY: 0.1, rotZ: 0.04, baseSpeed: 0.00013 },
];

const PLANET_COLORS: Record<string, { c1: string, c2: string, c3: string, c4: string, glow: string }> = {
  purple: { c1: '235,215,255', c2: '192,132,252', c3: '109,40,217', c4: '50,10,100', glow: '192,132,252' },
  blue: { c1: '215,235,255', c2: '96,165,250', c3: '37,99,235', c4: '10,30,100', glow: '96,165,250' },
  green: { c1: '215,255,225', c2: '74,222,128', c3: '22,163,74', c4: '10,80,30', glow: '74,222,128' },
  red: { c1: '255,215,215', c2: '248,113,113', c3: '220,38,38', c4: '100,20,20', glow: '248,113,113' },
  orange: { c1: '255,230,200', c2: '251,146,60', c3: '234,88,12', c4: '120,40,10', glow: '251,146,60' },
  yellow: { c1: '255,255,210', c2: '250,204,21', c3: '202,138,4', c4: '100,60,10', glow: '250,204,21' },
  cyan: { c1: '210,255,255', c2: '34,211,238', c3: '8,145,178', c4: '10,70,90', glow: '34,211,238' },
  magenta: { c1: '255,210,255', c2: '232,121,249', c3: '192,38,211', c4: '90,10,90', glow: '232,121,249' },
  white: { c1: '255,255,255', c2: '226,232,240', c3: '148,163,184', c4: '50,60,70', glow: '226,232,240' },
  silver: { c1: '240,240,245', c2: '161,161,170', c3: '82,82,91', c4: '30,30,40', glow: '161,161,170' },
  gold: { c1: '255,245,210', c2: '252,211,77', c3: '217,119,6', c4: '100,50,10', glow: '252,211,77' },
  rose: { c1: '255,220,230', c2: '251,113,133', c3: '225,29,72', c4: '100,10,30', glow: '251,113,133' },
  teal: { c1: '210,250,245', c2: '45,212,191', c3: '13,148,136', c4: '10,70,60', glow: '45,212,191' },
  indigo: { c1: '220,225,255', c2: '129,140,248', c3: '79,70,229', c4: '30,20,100', glow: '129,140,248' },
  violet: { c1: '235,215,255', c2: '167,139,250', c3: '124,58,237', c4: '50,20,100', glow: '167,139,250' },
  crimson: { c1: '255,200,210', c2: '244,63,94', c3: '159,18,57', c4: '80,10,20', glow: '244,63,94' },
  emerald: { c1: '210,255,220', c2: '52,211,153', c3: '5,150,105', c4: '10,70,40', glow: '52,211,153' },
  sapphire: { c1: '210,230,255', c2: '56,189,248', c3: '2,132,199', c4: '10,50,90', glow: '56,189,248' },
  amethyst: { c1: '240,210,255', c2: '216,180,254', c3: '147,51,234', c4: '70,20,110', glow: '216,180,254' },
  obsidian: { c1: '180,180,190', c2: '71,85,105', c3: '15,23,42', c4: '5,5,10', glow: '71,85,105' },
};

export default function VoidCanvas({ projects, buildLog }: VoidCanvasProps) {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const initP = useCallback(() => {
    return projects.map((p, i) => ({
      id: p.id,
      name: p.title,
      domain: p.domain,
      tier: p.orbitTier === 'A' ? 0 : p.orbitTier === 'B' ? 1 : 2,
      complexity: p.complexity,
      desc: p.shortDescription,
      stack: p.stack,
      status: p.status,
      github: p.githubUrl,
      url: p.projectUrl,
      color: p.planetColor,
      phase: i / Math.max(1, projects.length),
    }));
  }, [projects]);
  const internalProjects = initP();

  const stateRef = useRef({
    t: 0,
    selectedOrbit: -1,
    selectedProject: null as any,
    expandedOrb: null as number | null,
    expandProgress: 0,
    orbitSpeeds: ORBITS.map(o => o.baseSpeed),
    orbitAlpha: [0.18, 0.14, 0.10],
    panelOpen: false,
    mouseX: 0, mouseY: 0,
    hoveredOrb: -1,
    diskAngle: 0,
    miniT: 0,
    W: 0, H: 0, cx: 0, cy: 0,
    
    // 3D Camera State
    camRotX: 0, camRotY: 0, camScale: 1.0,
    targetCamRotX: 0, targetCamRotY: 0, targetCamScale: 1.0,
    isDragging: false, dragStartX: 0, dragStartY: 0, clickStartX: 0, clickStartY: 0,

    projects: internalProjects, 
  });

  const orbPositions = useRef(internalProjects.map(() => ({ x: 0, y: 0, r: 0 })));
  const diskParticles = useRef<any[]>([]);
  const stars = useRef<any[]>([]);

  const initParticles = useCallback(() => {
    const st = stateRef.current;
    
    // Stars 3D uniform shell
    const s = [];
    for (let i = 0; i < 2200; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 0.5 + Math.random() * 2; // shell radius multiplier
      
      s.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        size: 0.3 + Math.random() * 1.1,
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
        hue: 260 + Math.random() * 30, // Purple range
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

    // ─── 3D ENGINE MATH ──────────────────────────────
    function projectEllipse(angle: number, cfg: any) {
      // 1. Point on local orbit plane
      let vx = Math.cos(angle) * cfg.r * st.W;
      let vy = 0;
      let vz = Math.sin(angle) * cfg.r * st.W;

      // 2. Orbit initial alignments
      const cx = Math.cos(cfg.rotX), sx = Math.sin(cfg.rotX);
      let ny = vy * cx - vz * sx;
      let nz = vy * sx + vz * cx;
      vy = ny; vz = nz;

      const cy = Math.cos(cfg.rotY), sy = Math.sin(cfg.rotY);
      let nx = vx * cy + vz * sy;
      nz = -vx * sy + vz * cy;
      vx = nx; vz = nz;

      const cz = Math.cos(cfg.rotZ), sz = Math.sin(cfg.rotZ);
      nx = vx * cz - vy * sz;
      ny = vx * sz + vy * cz;
      vx = nx; vy = ny;

      // 3. User Interactive Camera Spin
      const ccx = Math.cos(st.camRotX), scx = Math.sin(st.camRotX);
      let cny = vy * ccx - vz * scx;
      let cnz = vy * scx + vz * ccx;
      vy = cny; vz = cnz;

      const ccy = Math.cos(st.camRotY), scy = Math.sin(st.camRotY);
      let cnx = vx * ccy + vz * scy;
      cnz = -vx * scy + vz * ccy;
      vx = cnx; vz = cnz;

      // 4. Zoom Scale
      vx *= st.camScale;
      vy *= st.camScale;
      vz *= st.camScale;

      const pz = vz;
      const depth = (pz + cfg.r * st.W * st.camScale) / (2 * cfg.r * st.W * st.camScale);
      return { x: st.cx + vx, y: st.cy * 0.95 + vy, depth, pz };
    }

    function getOrbRadius(proj: any) {
      return (8 + proj.complexity * 1.8) * (st.W / 1440) * st.camScale;
    }

    function isNearOrbit(mx: number, my: number, oi: number) {
      const cfg = ORBITS[oi];
      for (let a = 0; a < Math.PI * 2; a += 0.08) {
        const pt = projectEllipse(a, cfg);
        const dx = mx - pt.x, dy = my - pt.y;
        if (Math.sqrt(dx * dx + dy * dy) < 18 * st.camScale) return true;
      }
      return false;
    }

    // ─── PANEL ───────────────────────────────────────
    function selectProject(proj: any, idx: number) {
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
        proj.stack.forEach((s: string) => {
          const sp = document.createElement('span');
          sp.textContent = s;
          stackRef.current!.appendChild(sp);
        });
      }
      if (panelRef.current) panelRef.current.classList.add('open');
      
      if (linksRef.current) {
        linksRef.current.innerHTML = '';
        if (proj.github) {
          const a = document.createElement('a'); a.href = proj.github; a.target = '_blank';
          a.className = 'vbtn-primary'; a.textContent = 'GitHub ↗'; linksRef.current.appendChild(a);
        }
        if (proj.url) {
          const a = document.createElement('a'); a.href = proj.url; a.target = '_blank';
          a.className = 'vbtn-ghost'; a.textContent = 'Project →'; linksRef.current.appendChild(a);
        }
      }
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
    function drawMiniCanvas(proj: any) {
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

        const g = mctx.createRadialGradient(mcx, mcy, 0, mcx, mcy, baseR * 2.5);
        g.addColorStop(0, 'rgba(192,132,252,0.15)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = g;
        mctx.fillRect(0, 0, mw, mh);

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

        const cg = mctx.createRadialGradient(mcx - baseR * 0.25, mcy - baseR * 0.25, 0, mcx, mcy, baseR);
        cg.addColorStop(0, 'rgba(230,210,255,0.95)');
        cg.addColorStop(0.4, 'rgba(192,132,252,0.9)');
        cg.addColorStop(0.8, 'rgba(109,40,217,0.8)');
        cg.addColorStop(1, 'rgba(60,10,120,0.6)');
        mctx.fillStyle = cg;
        mctx.beginPath();
        mctx.arc(mcx, mcy, baseR, 0, Math.PI * 2);
        mctx.fill();

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

    // ─── USER CAMERA INTERACTION EVENTS ───────────────────────
    function handleMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      st.isDragging = true;
      st.dragStartX = e.clientX;
      st.dragStartY = e.clientY;
      st.clickStartX = e.clientX;
      st.clickStartY = e.clientY;
      if (!st.panelOpen) canvas!.style.cursor = 'grabbing';
    }

    function handleMouseMove(e: MouseEvent) {
      st.mouseX = e.clientX;
      st.mouseY = e.clientY;
      if (st.isDragging && !st.panelOpen) {
        const dx = e.clientX - st.dragStartX;
        const dy = e.clientY - st.dragStartY;
        // Sensitivity multipliers
        st.targetCamRotY += dx * 0.005;
        st.targetCamRotX += dy * 0.005;
        st.dragStartX = e.clientX;
        st.dragStartY = e.clientY;
      }
    }

    function handleMouseUp(e: MouseEvent) {
      st.isDragging = false;
      if (!st.panelOpen) canvas!.style.cursor = 'grab';
    }

    function handleWheel(e: WheelEvent) {
      if (st.panelOpen) return;
      st.targetCamScale += e.deltaY * -0.001;
      st.targetCamScale = Math.max(0.4, Math.min(st.targetCamScale, 3.0));
    }

    function handleClick(e: MouseEvent) {
      const dist = Math.sqrt(Math.pow(e.clientX - st.clickStartX, 2) + Math.pow(e.clientY - st.clickStartY, 2));
      if (dist > 5) return; // Ignore drag release

      const mx = e.clientX, my = e.clientY;

      for (let i = 0; i < st.projects.length; i++) {
        const op = orbPositions.current[i];
        const dx = mx - op.x, dy = my - op.y;
        if (Math.sqrt(dx * dx + dy * dy) < op.r * 2.5) {
          selectProject(st.projects[i], i);
          return;
        }
      }

      for (let oi = 0; oi < ORBITS.length; oi++) {
        if (isNearOrbit(mx, my, oi)) {
          st.selectedOrbit = st.selectedOrbit === oi ? -1 : oi;
          return;
        }
      }

      if (st.panelOpen) closePanel();
      else st.selectedOrbit = -1;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel();
    }

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);

    canvas.style.cursor = 'grab';

    const hintTimeout = setTimeout(() => {
      if (hintRef.current) hintRef.current.style.opacity = '0';
    }, 5000);

    // ─── DRAW: 3D STARS ─────────────────────────────────
    function drawStars() {
      const cx = st.cx, cy = st.cy * 0.95;
      const ccx = Math.cos(st.camRotX), scx = Math.sin(st.camRotX);
      const ccy = Math.cos(st.camRotY), scy = Math.sin(st.camRotY);
      const globalRadius = st.W * 1.5;

      stars.current.forEach(s => {
        s.tw += s.twS;
        
        let nx = s.x * globalRadius;
        let ny = s.y * globalRadius;
        let nz = s.z * globalRadius;

        // Apply camera spin
        let tempNx = nx * ccx - nz * scx;
        let tempNz = nx * scx + nz * ccx;
        nx = tempNx; nz = tempNz;

        let tempNy = ny * ccy - nz * scy;
        tempNz = ny * scy + nz * ccy;
        ny = tempNy; nz = tempNz;

        // Apply zoom
        nx *= st.camScale;
        ny *= st.camScale;

        const px = cx + nx;
        const py = cy + ny;

        if (px < 0 || px > st.W || py < 0 || py > st.H) return;

        // Only draw visible sphere surface (depth trick or just cull if behind origin)
        if (nz > 0) return;

        const o = s.o * (0.7 + Math.sin(s.tw) * 0.3);
        ctx.fillStyle = `rgba(220,215,255,${o})`;
        ctx.beginPath();
        ctx.arc(px, py, s.size * Math.sqrt(st.camScale), 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ─── DRAW: BLACK HOLE LAYERS ─────────────────────
    function getBHR() { return st.W * 0.085 * st.camScale; }

    function drawDiskArc(isFront: boolean) {
      const BHR = getBHR();
      const diskTilt = -0.35; 
      const diskYRatio = 0.12; 
      const diskR = BHR * 2.2; 
      const bx = st.cx, by = st.cy * 0.95;
      st.diskAngle += 0.004;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(diskTilt);
      
      const startA = isFront ? 0 : Math.PI;
      const endA = isFront ? Math.PI : Math.PI * 2;

      ctx.beginPath();
      ctx.ellipse(0, 0, diskR * 1.1, diskR * 1.1 * diskYRatio, 0, startA, endA);
      ctx.strokeStyle = isFront ? 'rgba(160,80,255,0.1)' : 'rgba(140,60,250,0.05)';
      ctx.lineWidth = BHR * 0.4;
      ctx.stroke();

      for(let i=0; i<3; i++) {
        ctx.beginPath();
        const r = diskR * (1 - i * 0.15);
        ctx.ellipse(0, 0, r, r * diskYRatio, 0, startA, endA);
        
        ctx.lineWidth = (i === 0 ? 1.5 : (i === 1 ? 3 : 8)) * st.camScale;
        ctx.strokeStyle = i === 0 ? 'rgba(255,240,255,0.9)' : 
                          (i === 1 ? 'rgba(210,140,255,0.6)' : 'rgba(140,40,255,0.2)');
        
        if (isFront && i === 0) {
          ctx.shadowColor = 'rgba(210,140,255,0.8)';
          ctx.shadowBlur = 15 * st.camScale;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
      }
      ctx.restore();

      diskParticles.current.forEach(p => {
        p.angle += p.speed * (1 + st.t * 0.000001);
        const px = Math.cos(p.angle) * p.r * st.W * 1.2 * st.camScale;
        const py = Math.sin(p.angle) * p.r * st.W * 1.2 * diskYRatio * st.camScale;
        
        const rotX = px * Math.cos(diskTilt) - py * Math.sin(diskTilt);
        const rotY = px * Math.sin(diskTilt) + py * Math.cos(diskTilt);
        
        const finalX = bx + rotX;
        const finalY = by + rotY;

        const depth = Math.sin(p.angle);
        const isParticleFront = depth >= 0;

        if (isParticleFront === isFront) {
          const heat = 1 - (p.r - 0.09) / 0.13;
          ctx.fillStyle = `hsla(${p.hue},90%,${65 + heat * 20}%,${p.opacity * (0.4 + Math.abs(depth) * 0.6)})`;
          ctx.beginPath();
          ctx.arc(finalX, finalY, p.size * (0.6 + Math.abs(depth) * 0.4) * st.camScale, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    function drawBlackHoleCore() {
      const BHR = getBHR();
      const bx = st.cx, by = st.cy * 0.95;

      const outerHaze = ctx.createRadialGradient(bx, by, BHR * 1.0, bx, by, BHR * 3.5);
      outerHaze.addColorStop(0, 'rgba(60,20,100,0.05)');
      outerHaze.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = outerHaze;
      ctx.beginPath();
      ctx.ellipse(bx, by, BHR * 3.5, BHR * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      const rimG = ctx.createRadialGradient(bx, by, BHR * 0.95, bx, by, BHR * 1.05);
      rimG.addColorStop(0, 'rgba(0,0,0,1)');
      rimG.addColorStop(0.8, 'rgba(30,10,60,0.85)');
      rimG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rimG;
      ctx.beginPath();
      ctx.arc(bx, by, BHR * 1.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(bx, by, BHR, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(bx, by);
      const lensG = ctx.createRadialGradient(0, 0, BHR, 0, 0, BHR * 1.4);
      lensG.addColorStop(0, 'rgba(90,40,200,0.0)');
      lensG.addColorStop(0.5, 'rgba(110,60,210,0.05)');
      lensG.addColorStop(0.8, 'rgba(60,20,140,0.03)');
      lensG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lensG;
      ctx.beginPath();
      ctx.arc(0, 0, BHR * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ─── DRAW: ORBITS ────────────────────────────────
    function drawOrbitsArc(isFront: boolean) {
      for (let oi = 0; oi < ORBITS.length; oi++) {
        const cfg = ORBITS[oi];
        const isSelected = st.selectedOrbit === oi;
        const alpha = st.orbitAlpha[oi];

        ctx.save();
        ctx.strokeStyle = isSelected
          ? `rgba(220,180,255,${alpha + 0.15})`
          : `rgba(160,100,240,${alpha + 0.08})`; 
        ctx.lineWidth = (isSelected ? 1.5 : 1.0) * st.camScale;

        if (isSelected && isFront) {
          ctx.shadowColor = 'rgba(192,132,252,0.5)';
          ctx.shadowBlur = 12 * st.camScale;
        }

        ctx.beginPath();
        const pts = 120;
        let drawing = false;
        for (let i = 0; i <= pts + 2; i++) {
          const angle = ((i % pts) / pts) * Math.PI * 2;
          const pt = projectEllipse(angle, cfg);
          
          const valid = isFront ? (pt.pz >= -15) : (pt.pz <= 15);
          
          if (valid) {
            if (!drawing) {
              ctx.moveTo(pt.x, pt.y);
              drawing = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            drawing = false;
          }
        }
        ctx.stroke();

        if (isSelected && isFront) {
          const labelPt = projectEllipse(Math.PI * 1.2, cfg);
          ctx.font = `${Math.floor(10 * st.camScale)}px "IBM Plex Mono"`;
          ctx.fillStyle = 'rgba(220,180,255,0.85)';
          ctx.textAlign = 'center';
          ctx.fillText(`ORBIT ${String.fromCharCode(65 + oi)} · ${oi === 0 ? 'INNER' : oi === 1 ? 'MID' : 'OUTER'}`, labelPt.x, labelPt.y - 14 * st.camScale);
        }

        ctx.restore();
      }
    }

    // ─── DRAW: ORBS ──────────────────────────────────
    function drawOrbsSet(isFront: boolean) {
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

        if (isFront ? pt.pz < 0 : pt.pz >= 0) return;

        const isExpanded = st.expandedOrb === i;
        const depthScale = 0.6 + pt.depth * 0.4;
        const baseR = getOrbRadius(p) * depthScale;
        const expandScale = isExpanded ? (1 + st.expandProgress * 2.5) : 1;
        const r = baseR * expandScale;
        const px = pt.x, py = pt.y;

        orbPositions.current[i] = { x: px, y: py, r: baseR * 1.2 };

        const glowR = r * 2.5;
        const glowAlpha = isExpanded ? 0.25 : 0.12;
        const pc = PLANET_COLORS[p.color || "purple"] || PLANET_COLORS["purple"];
        
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        glow.addColorStop(0, `rgba(${pc.glow},${glowAlpha})`);
        glow.addColorStop(0.5, `rgba(${pc.c3},${glowAlpha * 0.4})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fill();

        const orbG = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r);
        const brightness = isExpanded ? 1.15 : depthScale;
        orbG.addColorStop(0, `rgba(${pc.c1},${0.95 * brightness})`);
        orbG.addColorStop(0.35, `rgba(${pc.c2},${0.9 * brightness})`);
        orbG.addColorStop(0.7, `rgba(${pc.c3},${0.8 * brightness})`);
        orbG.addColorStop(1, `rgba(${pc.c4},${0.6 * brightness})`);
        ctx.fillStyle = orbG;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();

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

        if (isExpanded && st.expandProgress > 0.3) {
          const ep = Math.min(1, (st.expandProgress - 0.3) / 0.7);

          for (let ri = 0; ri < 3; ri++) {
            const rr = r * (1.5 + ri * 0.7);
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(st.t * 0.015 * (ri % 2 === 0 ? 1 : -1));
            ctx.strokeStyle = `rgba(${pc.glow},${0.25 * ep - ri * 0.06})`;
            ctx.lineWidth = 0.8 * st.camScale;
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
          ctx.font = `${Math.floor(9 * depthScale)}px "IBM Plex Mono"`;
          ctx.fillStyle = statusColor;
          ctx.fillText('● ' + p.status, px, py - r * 1.8 + 16 * st.camScale);
          ctx.restore();
        } else if (!isExpanded) {
          const dx = st.mouseX - px, dy = st.mouseY - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < baseR * 2.5) {
            st.hoveredOrb = i;
            ctx.font = `${Math.floor(10 * st.camScale)}px "IBM Plex Mono"`;
            ctx.fillStyle = 'rgba(220,200,255,0.75)';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, px, py - baseR * 1.6);
          }
        }

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

      // Interpolate Camera
      st.camRotX += (st.targetCamRotX - st.camRotX) * 0.1;
      st.camRotY += (st.targetCamRotY - st.camRotY) * 0.1;
      st.camScale += (st.targetCamScale - st.camScale) * 0.1;

      for (let i = 0; i < 3; i++) {
        const target = st.selectedOrbit === i ? ORBITS[i].baseSpeed * 0.15 : ORBITS[i].baseSpeed;
        st.orbitSpeeds[i] += (target - st.orbitSpeeds[i]) * 0.04;
      }

      for (let i = 0; i < 3; i++) {
        const target = st.selectedOrbit === i ? 0.55 : (st.selectedOrbit === -1 ? 0.18 - i * 0.04 : 0.08);
        st.orbitAlpha[i] += (target - st.orbitAlpha[i]) * 0.06;
      }

      if (st.expandedOrb !== null && st.expandProgress < 1) {
        st.expandProgress = Math.min(1, st.expandProgress + 0.04);
      }

      drawStars();

      drawOrbitsArc(false);  
      drawOrbsSet(false);    
      drawDiskArc(false);    
      
      drawBlackHoleCore();   
      
      drawDiskArc(true);     
      drawOrbitsArc(true);   
      drawOrbsSet(true);     
      
      st.projects.forEach(p => {
        p.phase = (p.phase + st.orbitSpeeds[p.tier]) % 1;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    const panelCloseEl = document.getElementById('panel-close-btn');
    const panelCloseHandler = () => closePanel();
    panelCloseEl?.addEventListener('click', panelCloseHandler);

    return () => {
      cancelAnimationFrame(animId);
      if (miniAnimId) cancelAnimationFrame(miniAnimId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      panelCloseEl?.removeEventListener('click', panelCloseHandler);
      clearTimeout(hintTimeout);
    };
  }, [initParticles, pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        .void-root *{margin:0;padding:0;box-sizing:border-box}
        .void-root{width:100vw;height:100vh;overflow:hidden;background:#03000a;position:fixed;inset:0}
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
        <div className="void-identity">
          <h1>VOID.SYS</h1>
          <p>AI Engineer · Goa, IN</p>
        </div>

        <div className="void-nav">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>WORK</Link>
          <Link href="/stack" className={pathname === '/stack' ? 'active' : ''}>STACK</Link>
          <Link href="/signal" className={pathname === '/signal' ? 'active' : ''}>SIGNAL</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>CONTACT</Link>
        </div>

        <div className="void-hint" ref={hintRef}>
          DRAG TO SPIN · SCROLL TO ZOOM · CLICK ORBIT RING TO SLOW · CLICK ORB TO EXPLORE
        </div>

        <div className="void-status">
          <div className="dot" />
          <span className="live">LIVE</span>
          <span>|</span>
          <span>
            Currently: <span className="hl">{buildLog.currentProject}</span> — {buildLog.currentStatus}
          </span>
          <span>|</span>
          <span>Last signal: {formatTimeAgo(buildLog.lastSignal)}</span>
          <span>|</span>
          <span>Open to: {buildLog.openTo.join(' / ') || 'Open'}</span>
          <span>|</span>
          <span>Planets: {internalProjects.length}</span>
        </div>

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
          <div className="void-panel-links" ref={linksRef}></div>
        </div>

        <canvas ref={canvasRef} id="void-canvas" />
      </div>
    </>
  );
}
