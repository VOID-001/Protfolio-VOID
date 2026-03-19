'use client';

import { useEffect } from 'react';

export default function VanillaApp() {
  useEffect(() => {
    const canvas = document.getElementById('c') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    let W: number, H: number, cx: number, cy: number;
    let animationFrameId: number;

    const PROJECTS = [
      { id:0, name:'Memoire', domain:'LLM INFRA', tier:0, complexity:9, recency:10,
        desc:'AI notes platform with graph memory. Chat with your own journal entries. Memgraph + Next.js + Docker.',
        stack:['Next.js','TypeScript','Memgraph','Docker','LLM'],
        status:'WIP', github:'#', phase:0.1 },
      { id:1, name:'Azure Pavilion', domain:'LLM INFRA', tier:0, complexity:10, recency:10,
        desc:'Open-source LiteLLM-inspired control plane. Multi-model routing, API key issuance, vLLM backend.',
        stack:['vLLM','LiteLLM','FastAPI','Docker','OpenAPI'],
        status:'WIP', github:'#', phase:0.6 },
      { id:2, name:'Serenity CLI', domain:'BACKEND', tier:1, complexity:7, recency:8,
        desc:'Internal AI CLI backed by private LLM endpoints. Auth, API key control, auditable consumption inside private networks.',
        stack:['Python','FastAPI','CLI','Auth','Docker'],
        status:'WIP', github:'#', phase:0.0 },
      { id:3, name:'CV-Search', domain:'AI / ML', tier:1, complexity:7, recency:7,
        desc:'Vector DB resume ranking system. LLM-powered similarity re-ranking for recruiters. pgvector + FastAPI.',
        stack:['pgvector','FastAPI','SQLAlchemy','LLM','Python'],
        status:'LIVE', github:'#', phase:0.45 },
      { id:4, name:'ADAM System', domain:'RESEARCH', tier:2, complexity:9, recency:6,
        desc:'Automotive Diagnostic & Monitoring. OBD-II + Raspberry Pi. AI driver behavior analysis. BITS Pilani research.',
        stack:['Python','OBD-II','Raspberry Pi','ML','SQLite'],
        status:'LIVE', github:'#', phase:0.15 },
      { id:5, name:'TxtToSQL', domain:'BACKEND', tier:2, complexity:6, recency:5,
        desc:'Natural language to SQL. Buffer-based context injection solves LLM memory limits. SQLAlchemy + Cursor.',
        stack:['Python','SQLAlchemy','LLM','FastAPI','NLP'],
        status:'LIVE', github:'#', phase:0.65 },
    ];

    // ORBIT CONFIGS: [semi-major, semi-minor, tiltX, tiltY, baseSpeed]
    const ORBITS = [
      { a:0.30, b:0.14, tx:0.55, ty:0.08, baseSpeed:0.00035, color:'rgba(192,132,252,', slowColor:'rgba(220,180,255,' },
      { a:0.40, b:0.20, tx:0.45, ty:0.06, baseSpeed:0.00022, color:'rgba(147,107,220,', slowColor:'rgba(200,160,255,' },
      { a:0.52, b:0.26, tx:0.35, ty:0.04, baseSpeed:0.00013, color:'rgba(110,70,190,',  slowColor:'rgba(170,130,240,' },
    ];

    // State
    let t = 0;
    let selectedOrbit = -1;  // which orbit ring is slowed
    let selectedProject: any = null;
    let expandedOrb: number | null = null;
    let expandProgress = 0;
    let orbitSpeeds = ORBITS.map(o => o.baseSpeed);
    let orbitAlpha = [0.18, 0.14, 0.10];  // current opacity of each orbit ring
    let panelOpen = false;

    // Particles for jets
    const JET_PARTICLES: any[] = [];
    for(let i=0;i<180;i++){
      JET_PARTICLES.push({
        side: i%2===0?1:-1,
        t: Math.random(),
        spread: (Math.random()-.5)*.18,
        speed: 0.004 + Math.random()*0.005,
        life: Math.random(),
        size: 0.5 + Math.random()*1.5,
        opacity: Math.random()
      });
    }

    // Disk particles (accretion)
    const DISK_PARTICLES: any[] = [];
    for(let i=0;i<300;i++){
      const r = 0.09 + Math.random()*0.13;
      DISK_PARTICLES.push({
        angle: Math.random()*Math.PI*2,
        r, baseR:r,
        speed: (0.003+Math.random()*0.004) * (Math.random()>.5?1:-1),
        size: 0.5+Math.random()*1.2,
        opacity: 0.3+Math.random()*0.7,
        hue: 20+Math.random()*30  // amber to orange range
      });
    }

    function resize(){
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W/2; cy = H/2;
    }
    resize();
    window.addEventListener('resize', resize);

    // Orb world positions (updated each frame)
    const orbPositions = PROJECTS.map(()=>({x:0,y:0,r:0,visible:true}));

    function projectEllipse(angle: number, orb: any, cfg: any){
      // 3D ellipse projection with tilt
      const ex = Math.cos(angle)*cfg.a*W;
      const ez = Math.sin(angle)*cfg.b*W;
      // Apply tilt (isometric-ish)
      const px = ex;
      const py = ez*Math.sin(cfg.tx) - (cfg.b*W*0.5)*Math.cos(cfg.tx)*0.12;
      const pz = ez*Math.cos(cfg.tx);
      // Depth for size scaling
      const depth = (pz + cfg.b*W) / (2*cfg.b*W);
      return { x: cx+px, y: cy*0.95+py, depth, pz };
    }

    function getOrbRadius(proj: any){
      return (8 + proj.complexity * 1.8) * (W/1440);
    }

    // Mouse tracking
    let mouseX=0, mouseY=0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX=e.clientX; mouseY=e.clientY;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const handleClick = (e: MouseEvent) => {
      const mx=e.clientX, my=e.clientY;

      // Check orb clicks first
      for(let i=0;i<PROJECTS.length;i++){
        const op=orbPositions[i];
        const dx=mx-op.x, dy=my-op.y;
        if(Math.sqrt(dx*dx+dy*dy) < op.r*2.5){
          selectProject(PROJECTS[i], i);
          return;
        }
      }

      // Check orbit ring clicks
      for(let oi=0;oi<ORBITS.length;oi++){
        if(isNearOrbit(mx,my,oi)){
          if(selectedOrbit===oi){ selectedOrbit=-1; }
          else { selectedOrbit=oi; }
          return;
        }
      }

      // Click empty space - deselect
      if(panelOpen) closePanel();
      else { selectedOrbit=-1; }
    };
    canvas.addEventListener('click', handleClick);

    function isNearOrbit(mx: number, my: number, oi: number){
      const cfg=ORBITS[oi];
      // Sample points on the orbit ellipse
      for(let a=0;a<Math.PI*2;a+=0.08){
        const pt=projectEllipse(a,null,cfg);
        const dx=mx-pt.x, dy=my-pt.y;
        if(Math.sqrt(dx*dx+dy*dy)<18) return true;
      }
      return false;
    }

    function selectProject(proj: any, idx: number){
      if(expandedOrb===idx){
        closePanel(); return;
      }
      expandedOrb=idx;
      expandProgress=0;
      selectedProject=proj;
      selectedOrbit=proj.tier;

      // Fill panel
      const titleEl = document.getElementById('panel-title');
      const domainEl = document.getElementById('panel-domain');
      const descEl = document.getElementById('panel-desc');
      const stackEl = document.getElementById('panel-stack');
      const panelEl = document.getElementById('panel');

      if(titleEl) titleEl.textContent=proj.name;
      if(domainEl) domainEl.textContent=proj.domain+' · '+proj.status;
      if(descEl) descEl.textContent=proj.desc;
      if(stackEl) {
        stackEl.innerHTML='';
        proj.stack.forEach((s: string)=>{
          const sp=document.createElement('span');
          sp.textContent=s; stackEl.appendChild(sp);
        });
      }
      if(panelEl) panelEl.classList.add('open');
      panelOpen=true;
      drawMiniCanvas(proj);
    }

    function closePanel(){
      const panelEl = document.getElementById('panel');
      if(panelEl) panelEl.classList.remove('open');
      panelOpen=false;
      expandedOrb=null;
      selectedOrbit=-1;
    }

    document.getElementById('panel-close')?.addEventListener('click', closePanel);

    // Mini canvas - rotating orb preview
    let miniT=0;
    let miniAnimId: number;
    function drawMiniCanvas(proj: any){
      const mc = document.getElementById('mini-canvas') as HTMLCanvasElement;
      if(!mc) return;
      const mctx = mc.getContext('2d') as CanvasRenderingContext2D;
      if(!mctx) return;
      const mw=344,mh=140,mcx=mw/2,mcy=mh/2;
      const baseR=28+proj.complexity*1.5;

      if(miniAnimId) cancelAnimationFrame(miniAnimId);

      (function loop(){
        if(!panelOpen) return;
        miniT+=0.02;
        mctx.clearRect(0,0,mw,mh);

        // Glow
        const g=mctx.createRadialGradient(mcx,mcy,0,mcx,mcy,baseR*2.5);
        g.addColorStop(0,'rgba(192,132,252,0.15)');
        g.addColorStop(1,'rgba(0,0,0,0)');
        mctx.fillStyle=g;
        mctx.fillRect(0,0,mw,mh);

        // Rotating ring around orb
        for(let i=0;i<3;i++){
          const rr=baseR*1.4+i*8;
          const opacity=0.15-i*0.04;
          const dashOffset=-miniT*30*(i+1);
          mctx.save();
          mctx.translate(mcx,mcy);
          mctx.rotate(miniT*0.3*(i%2===0?1:-1));
          mctx.strokeStyle=`rgba(192,132,252,${opacity})`;
          mctx.lineWidth=0.8;
          mctx.setLineDash([4,8+i*3]);
          mctx.lineDashOffset=dashOffset;
          mctx.beginPath();
          mctx.ellipse(0,0,rr,rr*0.35,0,0,Math.PI*2);
          mctx.stroke();
          mctx.restore();
        }

        // Core orb
        const cg=mctx.createRadialGradient(mcx-baseR*0.25,mcy-baseR*0.25,0,mcx,mcy,baseR);
        cg.addColorStop(0,'rgba(230,210,255,0.95)');
        cg.addColorStop(0.4,'rgba(192,132,252,0.9)');
        cg.addColorStop(0.8,'rgba(109,40,217,0.8)');
        cg.addColorStop(1,'rgba(60,10,120,0.6)');
        mctx.fillStyle=cg;
        mctx.beginPath();
        mctx.arc(mcx,mcy,baseR,0,Math.PI*2);
        mctx.fill();

        // Surface shimmer (rotating highlight)
        mctx.save();
        mctx.translate(mcx,mcy);
        mctx.rotate(miniT*0.5);
        const sg=mctx.createLinearGradient(-baseR,0,baseR,0);
        sg.addColorStop(0,'rgba(255,255,255,0)');
        sg.addColorStop(0.5,'rgba(255,255,255,0.12)');
        sg.addColorStop(1,'rgba(255,255,255,0)');
        mctx.fillStyle=sg;
        mctx.beginPath();
        mctx.ellipse(0,0,baseR,baseR*0.4,0,0,Math.PI*2);
        mctx.fill();
        mctx.restore();

        // Status dot
        mctx.fillStyle=proj.status==='LIVE'?'#22c55e':'#f59e0b';
        mctx.beginPath();
        mctx.arc(mcx+baseR+8,mcy,4,0,Math.PI*2);
        mctx.fill();
        mctx.fillStyle=proj.status==='LIVE'?'rgba(34,197,94,0.2)':'rgba(245,158,11,0.2)';
        mctx.beginPath();
        mctx.arc(mcx+baseR+8,mcy,8,0,Math.PI*2);
        mctx.fill();

        miniAnimId = requestAnimationFrame(loop);
      })();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if(e.key==='Escape') closePanel();
    };
    window.addEventListener('keydown', handleKeyDown);

    const hintTimeout = setTimeout(()=>{
      const hint = document.getElementById('hint');
      if(hint) hint.style.opacity='0';
    },5000);

    // ─── MAIN RENDER ───────────────────────────────────
    function draw(){
      t++;
      ctx.clearRect(0,0,W,H);

      // Update speeds
      for(let i=0;i<3;i++){
        const target = selectedOrbit===i ? ORBITS[i].baseSpeed*0.15 : ORBITS[i].baseSpeed;
        orbitSpeeds[i] += (target - orbitSpeeds[i])*0.04;
      }

      // Update orbit alphas
      for(let i=0;i<3;i++){
        const target = selectedOrbit===i ? 0.55 : (selectedOrbit===-1 ? 0.18-i*0.04 : 0.08);
        orbitAlpha[i] += (target-orbitAlpha[i])*0.06;
      }

      // Update expand progress
      if(expandedOrb!==null && expandProgress<1){
        expandProgress=Math.min(1,expandProgress+0.04);
      }

      drawStars();
      drawBlackHole();
      drawOrbits();
      drawOrbs();

      animationFrameId = requestAnimationFrame(draw);
    }

    // ─── STARS ─────────────────────────────────────────
    const STARS: any[] = [];
    for(let i=0;i<2200;i++){
      STARS.push({
        x:Math.random(),y:Math.random(),
        s:0.3+Math.random()*1.1,
        o:0.2+Math.random()*0.8,
        tw:Math.random()*Math.PI*2,
        twS:0.005+Math.random()*0.015
      });
    }
    function drawStars(){
      STARS.forEach(s=>{
        s.tw+=s.twS;
        const o=s.o*(0.7+Math.sin(s.tw)*0.3);
        ctx.fillStyle=`rgba(220,215,255,${o})`;
        ctx.beginPath();
        ctx.arc(s.x*W,s.y*H,s.s,0,Math.PI*2);
        ctx.fill();
      });
    }

    // ─── BLACK HOLE ──────────────────
    let diskAngle=0;
    function drawBlackHole(){
      diskAngle+=0.004;
      const bx=cx, by=cy*0.95;
      const BHR=W*0.095;  // black hole radius

      // ── Outer haze / nebula ──
      const outerHaze=ctx.createRadialGradient(bx,by,BHR*1.2,bx,by,BHR*4.5);
      outerHaze.addColorStop(0,'rgba(80,20,140,0.10)');
      outerHaze.addColorStop(0.4,'rgba(50,10,100,0.05)');
      outerHaze.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=outerHaze;
      ctx.beginPath();
      ctx.ellipse(bx,by,BHR*4.5,BHR*1.8,0,0,Math.PI*2);
      ctx.fill();

      // ── Disk particle system (below) ──
      DISK_PARTICLES.forEach(p=>{
        if(p.speed>0) return;  // top layer drawn after hole
        p.angle+=p.speed*(1+t*0.000001);
        const pr=p.r*W*0.95;
        const px=bx+Math.cos(p.angle)*pr;
        const diskY=Math.sin(p.angle)*pr*0.22;
        const py=by+diskY;
        const depth=Math.sin(p.angle);
        if(depth<0) return; // skip front particles here
        const heat=1-((p.r-0.09)/0.13);
        const hue=p.hue;
        ctx.fillStyle=`hsla(${hue},95%,${55+heat*25}%,${p.opacity*(0.4+depth*0.6)})`;
        ctx.beginPath();
        ctx.arc(px,py,p.size*(0.6+depth*0.4),0,Math.PI*2);
        ctx.fill();
      });

      // ── Relativistic disk (main glow sweep) ──
      for(let layer=4;layer>=0;layer--){
        const innerR=BHR*(1.15+layer*0.18);
        const outerR=BHR*(2.1+layer*0.35);
        const tiltY=0.22+layer*0.02;
        const alpha=(0.18-layer*0.03);

        ctx.save();
        ctx.translate(bx,by);

        // Relativistic brightening
        const grad=ctx.createConicGradient(diskAngle,0,0);
        const bright=`hsla(38,100%,75%,${alpha*1.8})`;
        const mid=`hsla(25,95%,55%,${alpha})`;
        const dim=`hsla(15,80%,30%,${alpha*0.4})`;
        const vdim=`hsla(10,60%,20%,${alpha*0.15})`;
        grad.addColorStop(0, bright);
        grad.addColorStop(0.15, mid);
        grad.addColorStop(0.35, dim);
        grad.addColorStop(0.5, vdim);
        grad.addColorStop(0.65, dim);
        grad.addColorStop(0.85, mid);
        grad.addColorStop(1, bright);

        ctx.strokeStyle=grad;
        ctx.lineWidth=(outerR-innerR);
        ctx.globalAlpha=1;

        ctx.beginPath();
        ctx.ellipse(0,0,(innerR+outerR)/2,(innerR+outerR)/2*tiltY,0,0,Math.PI*2);
        ctx.stroke();

        ctx.restore();
      }

      // ── Photon ring (thin bright line) ──
      const photonR=BHR*1.18;
      ctx.save();
      ctx.translate(bx,by);
      const photonG=ctx.createConicGradient(diskAngle+Math.PI*0.3,0,0);
      photonG.addColorStop(0,'rgba(255,240,200,0.9)');
      photonG.addColorStop(0.2,'rgba(255,200,120,0.4)');
      photonG.addColorStop(0.5,'rgba(200,150,80,0.1)');
      photonG.addColorStop(0.8,'rgba(255,200,120,0.4)');
      photonG.addColorStop(1,'rgba(255,240,200,0.9)');
      ctx.strokeStyle=photonG;
      ctx.lineWidth=2.5;
      ctx.shadowColor='rgba(255,220,150,0.8)';
      ctx.shadowBlur=8;
      ctx.beginPath();
      ctx.ellipse(0,0,photonR,photonR*0.2,0,0,Math.PI*2);
      ctx.stroke();
      ctx.restore();

      // ── Event horizon (black sphere with purple rim) ──
      const rimG=ctx.createRadialGradient(bx,by,BHR*0.85,bx,by,BHR*1.1);
      rimG.addColorStop(0,'rgba(0,0,0,1)');
      rimG.addColorStop(0.7,'rgba(20,5,50,0.95)');
      rimG.addColorStop(0.9,'rgba(80,20,160,0.3)');
      rimG.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=rimG;
      ctx.beginPath();
      ctx.arc(bx,by,BHR*1.12,0,Math.PI*2);
      ctx.fill();

      // Core black
      ctx.fillStyle='#000000';
      ctx.beginPath();
      ctx.arc(bx,by,BHR,0,Math.PI*2);
      ctx.fill();

      // ── Disk particles (front, above hole) ──
      DISK_PARTICLES.forEach(p=>{
        if(p.speed<0) return;
        p.angle+=p.speed*(1+t*0.000001);
        const pr=p.r*W*0.95;
        const px=bx+Math.cos(p.angle)*pr;
        const diskY=Math.sin(p.angle)*pr*0.22;
        const py=by+diskY;
        const depth=Math.sin(p.angle);
        if(depth>0) return;
        const heat=1-((p.r-0.09)/0.13);
        const hue=p.hue;
        ctx.fillStyle=`hsla(${hue},95%,${55+heat*25}%,${p.opacity*(0.4+Math.abs(depth)*0.6)})`;
        ctx.beginPath();
        ctx.arc(px,py,p.size*(0.6+Math.abs(depth)*0.4),0,Math.PI*2);
        ctx.fill();
      });

      // ── Polar jets ──
      drawJets(bx,by,BHR);

      // ── Gravitational lensing shimmer ──
      ctx.save();
      ctx.translate(bx,by);
      const lensG=ctx.createRadialGradient(0,0,BHR*1.0,0,0,BHR*1.6);
      lensG.addColorStop(0,'rgba(100,50,200,0.0)');
      lensG.addColorStop(0.5,'rgba(130,70,230,0.06)');
      lensG.addColorStop(0.8,'rgba(80,30,160,0.04)');
      lensG.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=lensG;
      ctx.beginPath();
      ctx.arc(0,0,BHR*1.6,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    function drawJets(bx: number, by: number, BHR: number){
      JET_PARTICLES.forEach(p=>{
        p.life+=p.speed;
        if(p.life>1) p.life=0;

        const progress=p.life;
        const jx=bx + Math.sin(p.spread+progress*p.spread*3)*BHR*progress*2.5;
        const jy=by + p.side*progress*BHR*3.5;
        const fade=progress<0.2?progress/0.2:1-((progress-0.2)/0.8);
        const ps=p.size*(1-progress*0.5);

        const r=Math.floor(160+progress*60);
        const g=Math.floor(100-progress*60);
        const b=255;
        ctx.fillStyle=`rgba(${r},${g},${b},${fade*p.opacity*0.7})`;
        ctx.beginPath();
        ctx.arc(jx,jy,ps,0,Math.PI*2);
        ctx.fill();
      });

      [-1,1].forEach(side=>{
        const jg=ctx.createRadialGradient(bx,by+side*BHR*0.1,0,bx,by+side*BHR*0.5,BHR*0.6);
        jg.addColorStop(0,'rgba(180,140,255,0.25)');
        jg.addColorStop(0.4,'rgba(120,80,220,0.08)');
        jg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=jg;
        ctx.beginPath();
        ctx.ellipse(bx,by+side*BHR*0.5,BHR*0.25,BHR*0.6,0,0,Math.PI*2);
        ctx.fill();
      });
    }

    // ─── ORBIT RINGS ───────────────────────────────────
    function drawOrbits(){
      const bx=cx,by=cy*0.95;
      for(let oi=0;oi<ORBITS.length;oi++){
        const cfg=ORBITS[oi];
        const isSelected=selectedOrbit===oi;
        const alpha=orbitAlpha[oi];

        ctx.save();

        ctx.strokeStyle=isSelected
          ? `rgba(220,180,255,${alpha})`
          : `rgba(192,132,252,${alpha})`;
        ctx.lineWidth=isSelected?1.5:0.8;
        if(!isSelected){ctx.setLineDash([4,12]);}
        else{ctx.setLineDash([]);}

        if(isSelected){
          ctx.shadowColor='rgba(192,132,252,0.4)';
          ctx.shadowBlur=12;
        }

        ctx.beginPath();
        const pts=200;
        for(let i=0;i<=pts;i++){
          const angle=(i/pts)*Math.PI*2;
          const pt=projectEllipse(angle,null,cfg);
          if(i===0) ctx.moveTo(pt.x,pt.y);
          else ctx.lineTo(pt.x,pt.y);
        }
        ctx.closePath();
        ctx.stroke();

        if(isSelected){
          const labelPt=projectEllipse(Math.PI*1.2,null,cfg);
          ctx.font='10px "IBM Plex Mono"';
          ctx.fillStyle='rgba(220,180,255,0.7)';
          ctx.textAlign='center';
          ctx.fillText(`ORBIT ${String.fromCharCode(65+oi)} · ${oi===0?'INNER':oi===1?'MID':'OUTER'}`,labelPt.x,labelPt.y-14);
        }

        ctx.restore();
      }
    }

    // Hover tracking
    let hoveredOrb=-1;

    // ─── ORBS ──────────────────────────────────────────
    function drawOrbs(){
      const bx=cx,by=cy*0.95;

      // Sort by depth (back to front)
      const sorted=[...PROJECTS].map((p,i)=>({p,i}));
      sorted.sort((a,b)=>{
        const cfgA=ORBITS[a.p.tier], cfgB=ORBITS[b.p.tier];
        const ptA=projectEllipse(a.p.phase*Math.PI*2,null,cfgA);
        const ptB=projectEllipse(b.p.phase*Math.PI*2,null,cfgB);
        return ptB.pz-ptA.pz;
      });

      // Update phases
      PROJECTS.forEach((p)=>{
        p.phase=(p.phase+orbitSpeeds[p.tier])%1;
      });

      hoveredOrb=-1;

      sorted.forEach(({p,i})=>{
        const cfg=ORBITS[p.tier];
        const angle=p.phase*Math.PI*2;
        const pt=projectEllipse(angle,null,cfg);

        const isExpanded=expandedOrb===i;
        const depthScale=0.6+pt.depth*0.4;
        const baseR=getOrbRadius(p)*depthScale;
        const expandScale=isExpanded?(1+expandProgress*2.5):1;
        const r=baseR*expandScale;
        const px=pt.x, py=pt.y;

        orbPositions[i]={x:px,y:py,r:baseR*1.2, visible: true};

        // ── Orb glow / corona ──
        const glowR=r*2.5;
        const glowAlpha=isExpanded?0.25:0.12;
        const glow=ctx.createRadialGradient(px,py,0,px,py,glowR);
        glow.addColorStop(0,`rgba(192,132,252,${glowAlpha})`);
        glow.addColorStop(0.5,`rgba(109,40,217,${glowAlpha*0.4})`);
        glow.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=glow;
        ctx.beginPath();
        ctx.arc(px,py,glowR,0,Math.PI*2);
        ctx.fill();

        // ── Orb surface ──
        const orbG=ctx.createRadialGradient(
          px-r*0.3,py-r*0.3,0,
          px,py,r
        );
        const brightness=isExpanded?1.15:depthScale;
        orbG.addColorStop(0,`rgba(235,215,255,${0.95*brightness})`);
        orbG.addColorStop(0.35,`rgba(192,132,252,${0.9*brightness})`);
        orbG.addColorStop(0.7,`rgba(109,40,217,${0.8*brightness})`);
        orbG.addColorStop(1,`rgba(50,10,100,${0.6*brightness})`);
        ctx.fillStyle=orbG;
        ctx.beginPath();
        ctx.arc(px,py,r,0,Math.PI*2);
        ctx.fill();

        // ── Rotating surface shimmer ──
        ctx.save();
        ctx.translate(px,py);
        ctx.rotate(t*0.02*(isExpanded?0.5:1));
        const shimG=ctx.createLinearGradient(-r,0,r,0);
        shimG.addColorStop(0,'rgba(255,255,255,0)');
        shimG.addColorStop(0.5,'rgba(255,255,255,0.15)');
        shimG.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=shimG;
        ctx.beginPath();
        ctx.ellipse(0,0,r,r*0.3,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();

        // ── Expanded state: orbital rings + label ──
        if(isExpanded && expandProgress>0.3){
          const ep=Math.min(1,(expandProgress-0.3)/0.7);

          // Rotating rings
          for(let ri=0;ri<3;ri++){
            const rr=r*(1.5+ri*0.7);
            ctx.save();
            ctx.translate(px,py);
            ctx.rotate(t*0.015*(ri%2===0?1:-1));
            ctx.strokeStyle=`rgba(192,132,252,${0.25*ep-ri*0.06})`;
            ctx.lineWidth=0.8;
            ctx.setLineDash([3,7+ri*2]);
            ctx.beginPath();
            ctx.ellipse(0,0,rr,rr*0.3,0,0,Math.PI*2);
            ctx.stroke();
            ctx.restore();
          }

          // Project name label
          ctx.save();
          ctx.globalAlpha=ep;
          ctx.font=`bold ${Math.floor(11*depthScale)}px "IBM Plex Mono"`;
          ctx.fillStyle='rgba(240,230,255,0.9)';
          ctx.textAlign='center';
          ctx.fillText(p.name,px,py-r*1.8);

          // Status badge
          const statusColor=p.status==='LIVE'?'rgba(34,197,94,0.85)':'rgba(245,158,11,0.85)';
          ctx.font=`9px "IBM Plex Mono"`;
          ctx.fillStyle=statusColor;
          ctx.fillText('● '+p.status,px,py-r*1.8+16);
          ctx.restore();
        } else if(!isExpanded){
          // Normal hover label
          const mx=mouseX-px, my=mouseY-py;
          const dist=Math.sqrt(mx*mx+my*my);
          if(dist<baseR*2.5){
            hoveredOrb=i;
            ctx.font=`10px "IBM Plex Mono"`;
            ctx.fillStyle='rgba(220,200,255,0.75)';
            ctx.textAlign='center';
            ctx.fillText(p.name,px,py-baseR*1.6);
          }
        }

        // Status dot (always visible)
        const dotColor=p.status==='LIVE'?'#22c55e':'#f59e0b';
        ctx.fillStyle=dotColor;
        ctx.beginPath();
        ctx.arc(px+r*0.75,py-r*0.75,2.5*depthScale,0,Math.PI*2);
        ctx.fill();
      });
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if(miniAnimId) cancelAnimationFrame(miniAnimId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      document.getElementById('panel-close')?.removeEventListener('click', closePanel);
      clearTimeout(hintTimeout);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

        .vanilla-app * {margin:0;padding:0;box-sizing:border-box}
        .vanilla-app {width:100vw;height:100vh;overflow:hidden;background:#03000a;cursor:default}

        #c{display:block;width:100vw;height:100vh;position:absolute;top:0;left:0;z-index:1}

        /* UI OVERLAYS */
        #identity{position:fixed;top:28px;left:32px;z-index:10;pointer-events:none}
        #identity h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:#f0ecff;letter-spacing:-.01em}
        #identity p{font-family:'IBM Plex Mono',monospace;font-size:11px;color:rgba(192,132,252,.45);margin-top:3px;letter-spacing:.06em}

        #nav{position:fixed;top:28px;right:32px;z-index:10;display:flex;flex-direction:column;gap:18px;text-align:right}
        #nav a{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.14em;color:rgba(240,236,255,.32);text-decoration:none;transition:color .25s,letter-spacing .25s;cursor:pointer}
        #nav a:hover,#nav a.active{color:#c084fc;letter-spacing:.18em}

        #status{position:fixed;bottom:0;left:0;right:0;z-index:10;height:34px;background:rgba(3,0,10,.92);border-top:1px solid rgba(192,132,252,.1);display:flex;align-items:center;padding:0 20px;gap:14px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:rgba(240,236,255,.38)}
        #status .dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse-dot 2s infinite;flex-shrink:0}
        #status .live{color:#22c55e;font-weight:500;letter-spacing:.08em}
        #status .highlight{color:#c084fc}
        @keyframes pulse-dot{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.4)}50%{opacity:.7;box-shadow:0 0 0 4px rgba(34,197,94,0)}}

        /* PROJECT PANEL */
        #panel{
          position:fixed;right:-440px;top:0;bottom:34px;width:400px;z-index:20;
          background:rgba(6,2,18,.88);
          border-left:1px solid rgba(192,132,252,.15);
          backdrop-filter:blur(24px) saturate(180%);
          transition:right .6s cubic-bezier(.16,1,.3,1);
          display:flex;flex-direction:column;
          box-shadow:inset 1px 0 0 rgba(192,132,252,.06),-20px 0 60px rgba(0,0,0,.6)
        }
        #panel.open{right:0}
        #panel-header{padding:28px 28px 0;display:flex;justify-content:space-between;align-items:flex-start}
        #panel-title{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;color:#f0ecff;line-height:1.2}
        #panel-close{
          font-family:'IBM Plex Mono',monospace;font-size:13px;color:rgba(192,132,252,.5);
          cursor:pointer;padding:4px 8px;border:1px solid rgba(192,132,252,.2);border-radius:4px;
          transition:all .2s;flex-shrink:0;margin-top:2px
        }
        #panel-close:hover{color:#c084fc;border-color:rgba(192,132,252,.5);background:rgba(192,132,252,.08)}
        #panel-domain{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;color:#7c3aed;padding:20px 28px 0}
        #panel-divider{height:1px;background:rgba(192,132,252,.12);margin:18px 28px}
        #panel-preview{
          margin:0 28px;height:140px;border-radius:10px;
          background:rgba(124,58,237,.08);border:1px solid rgba(192,132,252,.15);
          display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative
        }
        #panel-preview canvas{border-radius:10px}
        #panel-desc{padding:18px 28px 0;font-family:'IBM Plex Mono',monospace;font-size:12px;color:rgba(240,236,255,.65);line-height:1.75}
        #panel-stack{padding:16px 28px 0;display:flex;flex-wrap:wrap;gap:7px}
        #panel-stack span{
          font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.08em;
          padding:4px 10px;border-radius:4px;
          background:rgba(124,58,237,.18);border:1px solid rgba(192,132,252,.25);
          color:rgba(192,132,252,.85)
        }
        #panel-links{padding:22px 28px;margin-top:auto;display:flex;gap:12px}
        #panel-links a{
          flex:1;text-align:center;padding:10px;border-radius:6px;
          font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.08em;
          text-decoration:none;transition:all .2s;
        }
        .btn-primary{background:rgba(124,58,237,.25);border:1px solid rgba(192,132,252,.4);color:#c084fc}
        .btn-primary:hover{background:rgba(124,58,237,.4);border-color:#c084fc}
        .btn-ghost{background:transparent;border:1px solid rgba(192,132,252,.2);color:rgba(240,236,255,.5)}
        .btn-ghost:hover{border-color:rgba(192,132,252,.4);color:rgba(240,236,255,.8)}

        /* ORBIT HINT */
        #hint{
          position:fixed;bottom:50px;left:50%;transform:translateX(-50%);
          font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.12em;
          color:rgba(240,236,255,.22);text-align:center;pointer-events:none;
          transition:opacity 1s;z-index:5
        }
      `}</style>
      <div className="vanilla-app">
        <div id="identity">
          <h1>VOID.SYS</h1>
          <p>AI Engineer · Goa, IN</p>
        </div>

        <div id="nav">
          <a className="active">WORK</a>
          <a>STACK</a>
          <a>SIGNAL</a>
          <a>CONTACT</a>
        </div>

        <div id="hint">CLICK ORBIT RING TO SLOW · CLICK ORB TO EXPLORE</div>

        <div id="status">
          <div className="dot"></div>
          <span className="live">LIVE</span>
          <span>|</span>
          <span>Currently: <span className="highlight">Azure Pavilion</span> — LiteLLM control plane</span>
          <span>|</span>
          <span>Last signal: 2m ago</span>
          <span>|</span>
          <span>Open to: Hire / Collaborate</span>
        </div>

        <div id="panel">
          <div id="panel-header">
            <div id="panel-title">Project Name</div>
            <div id="panel-close">ESC ×</div>
          </div>
          <div id="panel-domain">DOMAIN · STATUS</div>
          <div id="panel-divider"></div>
          <div id="panel-preview">
            <canvas id="mini-canvas" width="344" height="140"></canvas>
          </div>
          <div id="panel-desc">Description goes here.</div>
          <div id="panel-stack"></div>
          <div id="panel-links">
            <a href="#" className="btn-primary">GitHub ↗</a>
            <a href="#" className="btn-ghost">Case Study →</a>
          </div>
        </div>

        <canvas id="c"></canvas>
      </div>
    </>
  );
}
