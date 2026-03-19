'use client';

import { useEffect, useRef } from 'react';

export default function CanvasBlackHole() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    let W: number, H: number, cx: number, cy: number;
    let animId: number;
    let t = 0;
    let diskAngle = 0;

    // ─── STARS ─────────────────────────────────────
    const STARS: { x: number; y: number; s: number; o: number; tw: number; twS: number }[] = [];
    for (let i = 0; i < 2200; i++) {
      STARS.push({
        x: Math.random(), y: Math.random(),
        s: 0.3 + Math.random() * 1.1,
        o: 0.2 + Math.random() * 0.8,
        tw: Math.random() * Math.PI * 2,
        twS: 0.005 + Math.random() * 0.015,
      });
    }

    // ─── JET PARTICLES ─────────────────────────────
    const JET_PARTICLES: any[] = [];
    for (let i = 0; i < 180; i++) {
      JET_PARTICLES.push({
        side: i % 2 === 0 ? 1 : -1,
        spread: (Math.random() - 0.5) * 0.18,
        speed: 0.004 + Math.random() * 0.005,
        life: Math.random(),
        size: 0.5 + Math.random() * 1.5,
        opacity: Math.random(),
      });
    }

    // ─── DISK PARTICLES ────────────────────────────
    const DISK_PARTICLES: any[] = [];
    for (let i = 0; i < 300; i++) {
      const r = 0.09 + Math.random() * 0.13;
      DISK_PARTICLES.push({
        angle: Math.random() * Math.PI * 2,
        r, baseR: r,
        speed: (0.003 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1),
        size: 0.5 + Math.random() * 1.2,
        opacity: 0.3 + Math.random() * 0.7,
        hue: 20 + Math.random() * 30,
      });
    }

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W / 2;
      cy = H / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawStars() {
      STARS.forEach((s) => {
        s.tw += s.twS;
        const o = s.o * (0.7 + Math.sin(s.tw) * 0.3);
        ctx.fillStyle = `rgba(220,215,255,${o})`;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.s, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawBlackHole() {
      diskAngle += 0.004;
      const bx = cx, by = cy * 0.95;
      const BHR = W * 0.065; // Slightly smaller to leave room for orbs

      // Outer haze
      const outerHaze = ctx.createRadialGradient(bx, by, BHR * 1.2, bx, by, BHR * 4.5);
      outerHaze.addColorStop(0, 'rgba(80,20,140,0.10)');
      outerHaze.addColorStop(0.4, 'rgba(50,10,100,0.05)');
      outerHaze.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = outerHaze;
      ctx.beginPath();
      ctx.ellipse(bx, by, BHR * 4.5, BHR * 1.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Disk particles (back layer)
      DISK_PARTICLES.forEach((p) => {
        if (p.speed > 0) return;
        p.angle += p.speed * (1 + t * 0.000001);
        const pr = p.r * W * 0.65;
        const px = bx + Math.cos(p.angle) * pr;
        const diskY = Math.sin(p.angle) * pr * 0.22;
        const py = by + diskY;
        const depth = Math.sin(p.angle);
        if (depth < 0) return;
        const heat = 1 - (p.r - 0.09) / 0.13;
        ctx.fillStyle = `hsla(${p.hue},95%,${55 + heat * 25}%,${p.opacity * (0.4 + depth * 0.6)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.6 + depth * 0.4), 0, Math.PI * 2);
        ctx.fill();
      });

      // Relativistic disk (main glow sweep)
      for (let layer = 4; layer >= 0; layer--) {
        const innerR = BHR * (1.15 + layer * 0.18);
        const outerR = BHR * (2.1 + layer * 0.35);
        const tiltY = 0.22 + layer * 0.02;
        const alpha = 0.18 - layer * 0.03;

        ctx.save();
        ctx.translate(bx, by);

        const grad = ctx.createConicGradient(diskAngle, 0, 0);
        const bright = `hsla(38,100%,75%,${alpha * 1.8})`;
        const mid = `hsla(25,95%,55%,${alpha})`;
        const dim = `hsla(15,80%,30%,${alpha * 0.4})`;
        const vdim = `hsla(10,60%,20%,${alpha * 0.15})`;
        grad.addColorStop(0, bright);
        grad.addColorStop(0.15, mid);
        grad.addColorStop(0.35, dim);
        grad.addColorStop(0.5, vdim);
        grad.addColorStop(0.65, dim);
        grad.addColorStop(0.85, mid);
        grad.addColorStop(1, bright);

        ctx.strokeStyle = grad;
        ctx.lineWidth = outerR - innerR;
        ctx.beginPath();
        ctx.ellipse(0, 0, (innerR + outerR) / 2, ((innerR + outerR) / 2) * tiltY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Photon ring
      const photonR = BHR * 1.18;
      ctx.save();
      ctx.translate(bx, by);
      const photonG = ctx.createConicGradient(diskAngle + Math.PI * 0.3, 0, 0);
      photonG.addColorStop(0, 'rgba(255,240,200,0.9)');
      photonG.addColorStop(0.2, 'rgba(255,200,120,0.4)');
      photonG.addColorStop(0.5, 'rgba(200,150,80,0.1)');
      photonG.addColorStop(0.8, 'rgba(255,200,120,0.4)');
      photonG.addColorStop(1, 'rgba(255,240,200,0.9)');
      ctx.strokeStyle = photonG;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(255,220,150,0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, 0, photonR, photonR * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Event horizon rim glow
      const rimG = ctx.createRadialGradient(bx, by, BHR * 0.85, bx, by, BHR * 1.1);
      rimG.addColorStop(0, 'rgba(0,0,0,1)');
      rimG.addColorStop(0.7, 'rgba(20,5,50,0.95)');
      rimG.addColorStop(0.9, 'rgba(80,20,160,0.3)');
      rimG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rimG;
      ctx.beginPath();
      ctx.arc(bx, by, BHR * 1.12, 0, Math.PI * 2);
      ctx.fill();

      // Core black
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(bx, by, BHR, 0, Math.PI * 2);
      ctx.fill();

      // Disk particles (front layer)
      DISK_PARTICLES.forEach((p) => {
        if (p.speed < 0) return;
        p.angle += p.speed * (1 + t * 0.000001);
        const pr = p.r * W * 0.65;
        const px = bx + Math.cos(p.angle) * pr;
        const diskY = Math.sin(p.angle) * pr * 0.22;
        const py = by + diskY;
        const depth = Math.sin(p.angle);
        if (depth > 0) return;
        const heat = 1 - (p.r - 0.09) / 0.13;
        ctx.fillStyle = `hsla(${p.hue},95%,${55 + heat * 25}%,${p.opacity * (0.4 + Math.abs(depth) * 0.6)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.6 + Math.abs(depth) * 0.4), 0, Math.PI * 2);
        ctx.fill();
      });

      // Polar jets
      drawJets(bx, by, BHR);

      // Lensing shimmer
      ctx.save();
      ctx.translate(bx, by);
      const lensG = ctx.createRadialGradient(0, 0, BHR, 0, 0, BHR * 1.6);
      lensG.addColorStop(0, 'rgba(100,50,200,0.0)');
      lensG.addColorStop(0.5, 'rgba(130,70,230,0.06)');
      lensG.addColorStop(0.8, 'rgba(80,30,160,0.04)');
      lensG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lensG;
      ctx.beginPath();
      ctx.arc(0, 0, BHR * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawJets(bx: number, by: number, BHR: number) {
      JET_PARTICLES.forEach((p) => {
        p.life += p.speed;
        if (p.life > 1) p.life = 0;
        const progress = p.life;
        const jx = bx + Math.sin(p.spread + progress * p.spread * 3) * BHR * progress * 2.5;
        const jy = by + p.side * progress * BHR * 3.5;
        const fade = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
        const ps = p.size * (1 - progress * 0.5);
        const r = Math.floor(160 + progress * 60);
        const g = Math.floor(100 - progress * 60);
        ctx.fillStyle = `rgba(${r},${g},255,${fade * p.opacity * 0.7})`;
        ctx.beginPath();
        ctx.arc(jx, jy, ps, 0, Math.PI * 2);
        ctx.fill();
      });

      [-1, 1].forEach((side) => {
        const jg = ctx.createRadialGradient(bx, by + side * BHR * 0.1, 0, bx, by + side * BHR * 0.5, BHR * 0.6);
        jg.addColorStop(0, 'rgba(180,140,255,0.25)');
        jg.addColorStop(0.4, 'rgba(120,80,220,0.08)');
        jg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = jg;
        ctx.beginPath();
        ctx.ellipse(bx, by + side * BHR * 0.5, BHR * 0.25, BHR * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);
      drawStars();
      drawBlackHole();
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: '#03000a',
      }}
    />
  );
}
