'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { BuildLog, Project, Skill, Experience, ContactDetail } from '@/lib/types';
import { getSkills, getExperiences, getContactDetail } from '@/lib/strapi';
import { Scene } from './three/Scene';
import { useSceneStore } from '@/hooks/useSceneStore';

interface VoidCanvasProps {
  projects: Project[];
  buildLog: BuildLog;
}

function formatTimeAgo(dateString: string): string {
  if (!dateString) return '';
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

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const DOMAIN_COLORS: Record<string, string> = {
  AI_ML: '#22d3ee',      // bright cyan
  LLM_INFRA: '#c084fc',  // bright purple
  BACKEND: '#38bdf8',    // bright sapphire
  FRONTEND: '#facc15',   // bright gold
  DEVOPS: '#fb7185',     // bright rose
  RESEARCH: '#4ade80',   // bright green
};

const DOMAIN_LABELS: Record<string, string> = {
  AI_ML: 'AI / ML',
  LLM_INFRA: 'LLM Infrastructure',
  BACKEND: 'Backend Systems',
  FRONTEND: 'Frontend / UI',
  DEVOPS: 'DevOps / MLOps',
  RESEARCH: 'Research',
};

export default function VoidCanvas({ projects, buildLog }: VoidCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [contact, setContact] = useState<ContactDetail | null>(null);

  const [introOpacity, setIntroOpacity] = useState(1);
  const [introVisible, setIntroVisible] = useState(true);

  const startIntro = () => {
    setIntroOpacity(0);
    useSceneStore.getState().setIntroState('warping');
    setTimeout(() => {
      setIntroVisible(false);
    }, 1200);
    setTimeout(() => {
      useSceneStore.getState().setIntroState('ready');
    }, 2500);
  };

  const pathname = usePathname();
  const hintRef = useRef<HTMLDivElement>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const setScrollSection = useSceneStore(s => s.setScrollSection);
  const setSceneBrightness = useSceneStore(s => s.setSceneBrightness);
  const selectedProject = useSceneStore(s => s.selectedProject);
  const setSelectedProject = useSceneStore(s => s.setSelectedProject);
  const setSelectedOrbit = useSceneStore(s => s.setSelectedOrbit);
  
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p > 85) p = 85;
      setLoadPct(Math.floor(p));
    }, 150);

    Promise.all([getSkills(), getExperiences(), getContactDetail()]).then(([s, e, cData]) => {
      setSkills(s);
      setExperiences(e);
      setContact(cData);
      clearInterval(interval);
      setLoadPct(100);
      setTimeout(() => setIsReady(true), 600);
    });
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setPanelOpen(true);
    }
  }, [selectedProject]);

  function closePanel() {
    setPanelOpen(false);
    setSelectedProject(null);
    setSelectedOrbit(-1);
  }

  const [currentSection, setCurrentSection] = useState(0);
  const isAnimatingRef = useRef(false);
  const navIds = ['nav-work', 'nav-stack', 'nav-experience', 'nav-contact'];

  const navigateToSection = (index: number) => {
    if (isAnimatingRef.current || index === currentSection) return;
    isAnimatingRef.current = true;
    setCurrentSection(index);
    setScrollSection(index);
    setSceneBrightness(index > 0 ? 0.25 : 1.0);

    const scroller = document.getElementById('void-scroll-container');
    if (scroller) {
      scroller.scrollTo({ top: window.innerHeight * index, behavior: 'smooth' });
    }

    // Update nav highlights
    navIds.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (el) {
        if (idx === index) el.classList.add('active');
        else el.classList.remove('active');
      }
    });

    setTimeout(() => { isAnimatingRef.current = false; }, 900);
  };

  // Update panel transforms on scroll events (triggered by programmatic scrollTo)
  useEffect(() => {
    const scroller = document.getElementById('void-scroll-container');
    if (!scroller) return;

    const handleScroll = () => {
      const scrollY = scroller.scrollTop;
      const h = window.innerHeight;

      const stackPanel = document.getElementById('stack-panel');
      const experiencePanel = document.getElementById('experience-panel');
      const contactPanel = document.getElementById('contact-panel');

      if (stackPanel) {
        const offset = Math.max(0, scrollY);
        stackPanel.style.transform = `translateY(${Math.max(0, h - offset)}px)`;
      }
      if (experiencePanel) {
        const offset = Math.max(0, scrollY - h);
        experiencePanel.style.transform = `translateY(${Math.max(0, h - offset)}px)`;
      }
      if (contactPanel) {
        const offset = Math.max(0, scrollY - h * 2);
        contactPanel.style.transform = `translateY(${Math.max(0, h - offset)}px)`;
      }
    };

    scroller.addEventListener('scroll', handleScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, []);

  // Removed blockWheel and blockTouch completely to allow native frictionless scrolling and 3D dragging on mobile
  useEffect(() => {
    const scroller = document.getElementById('void-scroll-container');
    if (!scroller) return;
    
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const hintTimeout = setTimeout(() => {
      if (hintRef.current) hintRef.current.style.opacity = '0';
    }, 5000);
    return () => clearTimeout(hintTimeout);
  }, []);

  useEffect(() => {
    let miniAnimId: number;
    let miniT = 0;
    
    if (panelOpen && selectedProject && miniCanvasRef.current) {
        const mc = miniCanvasRef.current;
        const mctx = mc.getContext('2d');
        if (!mctx) return;
        
        const mw = 344, mh = 140, mcx = mw / 2, mcy = mh / 2;
        const baseR = 28 + (selectedProject.complexity || 5) * 1.5;

        const loop = () => {
            if (!panelOpen) return;
            miniT += 0.02;
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
                mctx.rotate(miniT * 0.3 * (i % 2 === 0 ? 1 : -1));
                mctx.strokeStyle = `rgba(192,132,252,${opacity})`;
                mctx.lineWidth = 0.8;
                mctx.setLineDash([4, 8 + i * 3]);
                mctx.lineDashOffset = -miniT * 30 * (i + 1);
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
            mctx.rotate(miniT * 0.5);
            const sg = mctx.createLinearGradient(-baseR, 0, baseR, 0);
            sg.addColorStop(0, 'rgba(255,255,255,0)');
            sg.addColorStop(0.5, 'rgba(255,255,255,0.12)');
            sg.addColorStop(1, 'rgba(255,255,255,0)');
            mctx.fillStyle = sg;
            mctx.beginPath();
            mctx.ellipse(0, 0, baseR, baseR * 0.4, 0, 0, Math.PI * 2);
            mctx.fill();
            mctx.restore();

            mctx.fillStyle = selectedProject.status === 'LIVE' ? '#22c55e' : '#f59e0b';
            mctx.beginPath();
            mctx.arc(mcx + baseR + 8, mcy, 4, 0, Math.PI * 2);
            mctx.fill();
            mctx.fillStyle = selectedProject.status === 'LIVE' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)';
            mctx.beginPath();
            mctx.arc(mcx + baseR + 8, mcy, 8, 0, Math.PI * 2);
            mctx.fill();

            miniAnimId = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(miniAnimId);
    }
  }, [panelOpen, selectedProject]);

  return (
    <>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
          .void-root *{margin:0;padding:0;box-sizing:border-box}
          .void-root{width:100vw;min-height:400vh;background:#03000a;position:relative}
          #void-scroll-container{height:100vh;overflow-y:scroll;position:fixed;inset:0;z-index:1;scrollbar-width:none;-ms-overflow-style:none}
          #void-scroll-container::-webkit-scrollbar{display:none}
          #void-sticky-scene{position:sticky;top:0;height:100vh;overflow:hidden;z-index:0}
          #void-sections{position:absolute;top:0;left:0;width:100%;height:400vh;pointer-events:none;z-index:2}
          .void-scroll-panel{position:absolute;width:100%;height:100vh;background:rgba(4,1,14,0.94);backdrop-filter:blur(20px);border-top:1px solid rgba(192,132,252,0.15);pointer-events:auto;overflow-y:auto;overscroll-behavior:contain}
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
          
          /* Responsive Layout */
          .stack-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          @media (max-width: 900px) {
            .stack-grid { grid-template-columns: repeat(2, 1fr); }
            .void-panel { width: 100%; right: -100%; }
            .void-panel.open { right: 0; }
          }
          @media (max-width: 600px) {
            .void-root { font-size: 14px; }
            .stack-grid { grid-template-columns: 1fr; }
            .void-scroll-panel { padding: 80px 20px 100px !important; }
            
            /* Top Identity & Nav positioning */
            .void-identity { top: 16px; left: 16px; }
            .void-identity h1 { font-size: 16px; }
            .void-identity p { font-size: 9px; }
            
            .void-nav { top: 16px; right: 16px; gap: 8px; }
            .void-nav a { font-size: 9px; letter-spacing: 0.08em; }
            
            .void-status { display: none !important; }
            .void-hint { font-size: 8px; bottom: 30px; }
          }
        `}</style>

      <div className="void-root">
        {/* Intro Overlay */}
        {introVisible && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: '#03010e', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            transition: 'opacity 1.2s ease', opacity: introOpacity,
            pointerEvents: introOpacity === 0 ? 'none' : 'auto'
          }}>
            <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(192,132,252,0.5)' }}>
              VOID.SYS · INITIALIZING
            </p>
            <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '52px', fontWeight: 700, color: '#f0ecff', margin: '16px 0' }}>
              MANGESH PHADTE
            </h1>
            <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: 'rgba(240,236,255,0.45)' }}>
              AI Engineer · Goa, India
            </p>
            <button
              onClick={startIntro}
              disabled={!isReady}
              style={{
                marginTop: '48px', fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px',
                letterSpacing: '0.16em', padding: '14px 32px',
                border: '1px solid rgba(192,132,252,0.4)',
                background: 'transparent', color: '#c084fc',
                cursor: isReady ? 'pointer' : 'default', borderRadius: '4px',
                opacity: isReady ? 1 : 0.5, transition: 'all 0.3s'
              }}
            >
              {isReady ? 'ENTER THE VOID ↗' : 'LOADING SUBSYSTEMS...'}
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {!isReady && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#03000a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.6s', opacity: loadPct === 100 ? 0 : 1, pointerEvents: loadPct === 100 ? 'none' : 'auto' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, #000 30%, rgba(30,10,60,0.8) 60%, transparent 80%)', boxShadow: `0 0 ${40 + loadPct/2}px rgba(160, 80, 255, ${0.1 + loadPct/400}), inset 0 0 20px rgba(0,0,0,1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc', animation: 'vpulse 2s infinite', opacity: 0.5 + loadPct/200 }} />
              
              {/* Spinning orbiting dots reflecting progress */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', animation: 'spin 3s linear infinite' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', width: '4px', height: '4px', background: '#c084fc', borderRadius: '50%', transform: `scale(${loadPct / 100})`, opacity: loadPct / 100 }} />
              </div>
            </div>

            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
            
            <div className="font-mono" style={{ color: '#f0ecff', fontSize: '18px', letterSpacing: '0.2em', marginBottom: '16px', fontWeight: 500 }}>
              ESTABLISHING ORBIT
            </div>
            
            <div className="font-mono" style={{ color: 'rgba(192,132,252,0.6)', fontSize: '13px', letterSpacing: '0.1em', display:'flex', alignItems:'center', gap: '12px' }}>
              <div style={{width: '120px', height: '2px', background: 'rgba(192,132,252,0.2)', position: 'relative', overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${loadPct}%`, background: '#c084fc', transition: 'width 0.2s', boxShadow: '0 0 10px #c084fc'}} />
              </div>
              {loadPct}%
            </div>
          </div>
        )}

        <div className="void-identity">
          <h1>VOID.SYS</h1>
          <p>AI Engineer · Goa, IN</p>
        </div>



        <div className="void-nav">
          <a id="nav-work" className="active" onClick={() => navigateToSection(0)}>WORK</a>
          <a id="nav-stack" onClick={() => navigateToSection(1)}>STACK</a>
          <a id="nav-experience" onClick={() => navigateToSection(2)}>EXPERIENCE</a>
          <a id="nav-contact" onClick={() => navigateToSection(3)}>CONTACT</a>
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
          <span>Last signal: {mounted ? formatTimeAgo(buildLog.lastSignal) : '...'}</span>
          <span>|</span>
          <span>Open to: {buildLog.openTo.join(' / ') || 'Open'}</span>
          <span>|</span>
          <span>Planets: {projects.length}</span>
        </div>

        <div className={`void-panel ${panelOpen ? 'open' : ''}`}>
          <div className="void-panel-header">
            <div className="void-panel-title">{selectedProject?.title || 'Project Name'}</div>
            <div className="void-panel-close" onClick={closePanel}>ESC ×</div>
          </div>
          <div className="void-panel-domain">{selectedProject ? `${selectedProject.domain} · ${selectedProject.status}` : 'DOMAIN · STATUS'}</div>
          <div className="void-panel-divider" />
          <div className="void-panel-preview">
            <canvas ref={miniCanvasRef} width={344} height={140} />
          </div>
          <div className="void-panel-desc">{selectedProject?.shortDescription || 'Description goes here.'}</div>
          <div className="void-panel-stack">
            {selectedProject?.stack.map(s => <span key={s}>{s}</span>)}
          </div>
          <div className="void-panel-links">
            {selectedProject?.githubUrl && <a href={selectedProject.githubUrl} target="_blank" className="vbtn-primary" rel="noreferrer">GitHub ↗</a>}
            {selectedProject?.projectUrl && <a href={selectedProject.projectUrl} target="_blank" className="vbtn-ghost" rel="noreferrer">Project →</a>}
          </div>
        </div>

        <div id="void-scroll-container">
          <div style={{height: '400vh', position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none'}}>
            <section style={{height: '100vh'}}></section>
            <section style={{height: '100vh'}}></section>
            <section style={{height: '100vh'}}></section>
            <section style={{height: '100vh'}}></section>
          </div>
          
          <div id="void-sticky-scene">
            <Scene projects={projects} />
          </div>

          <div id="void-sections">
            <div id="stack-panel" className="void-scroll-panel" style={{top: '100vh', padding: '80px 40px'}}>
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 className="font-display" style={{ fontSize: 'clamp(28px, 5vw, 42px)', color: 'var(--void-white)', marginBottom: '12px' }}>Tech Stack</h1>
                <p className="font-mono" style={{ fontSize: '13px', color: 'rgba(248, 246, 255, 0.45)', marginBottom: '40px', maxWidth: '500px' }}>
                  The systems and tools I build with. Proficiency reflects production usage, not tutorial completion.
                </p>
                <div className="stack-grid">
                  {skills && skills.map((skill) => {
                    const domainColor = DOMAIN_COLORS[skill.domain] || '#7c3aed';
                    return (
                      <div key={skill.id} className="glass" style={{ padding: '22px', borderRadius: '12px', borderTop: `2px solid ${domainColor}`, background: `radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, ${domainColor} 8%, transparent), rgba(6,2,18,0.4))`, boxShadow: `0 8px 32px color-mix(in srgb, ${domainColor} 5%, transparent)` }}>
                        <div className="font-display" style={{ fontSize: '15px', color: 'var(--void-white)', marginBottom: '6px' }}>{skill.name}</div>
                        <div className="font-accent" style={{ fontSize: '10px', color: domainColor, letterSpacing: '0.1em', marginBottom: '14px', textShadow: `0 0 10px color-mix(in srgb, ${domainColor} 40%, transparent)` }}>{DOMAIN_LABELS[skill.domain] || skill.domain}</div>
                        <div style={{ width: '100%', height: '2px', background: 'rgba(192, 132, 252, 0.08)', borderRadius: '1px', marginBottom: '14px', overflow: 'hidden' }}>
                          <div style={{ width: `${skill.proficiency * 10}%`, height: '100%', background: domainColor, borderRadius: '1px', boxShadow: `0 0 8px ${domainColor}` }} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {skill.tools.map((tool) => (
                            <span key={tool} style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', letterSpacing: '0.08em', padding: '4px 10px', borderRadius: '4px', background: `color-mix(in srgb, ${domainColor} 12%, rgba(0,0,0,0.5))`, border: `1px solid color-mix(in srgb, ${domainColor} 30%, transparent)`, color: `color-mix(in srgb, ${domainColor} 90%, white)` }}>{tool}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div id="experience-panel" className="void-scroll-panel" style={{top: '200vh', padding: '100px 40px'}}>
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <h1 className="font-display" style={{ fontSize: 'clamp(28px, 5vw, 42px)', color: 'var(--void-white)', marginBottom: '12px' }}>Experience</h1>
                <p className="font-mono" style={{ fontSize: '13px', color: 'rgba(248, 246, 255, 0.45)', marginBottom: '48px', maxWidth: '500px' }}>
                  Career trajectory. Building production AI systems and shipping real products.
                </p>
                <div>
                  {experiences && experiences.map((exp) => {
                    const typeColors: Record<string, string> = { FULLTIME: '#22c55e', INTERNSHIP: '#eab308', RESEARCH: '#7c3aed' };
                    const tc = typeColors[exp.type] ?? 'var(--void-purple-500)';
                    return (
                      <div key={exp.id} style={{ display: 'flex', gap: '24px', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '20px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: tc, border: '2px solid var(--void-deep)', boxShadow: `0 0 12px ${tc}`, flexShrink: 0, marginTop: '6px' }} />
                          <div style={{ width: '1px', flexGrow: 1, background: 'rgba(192, 132, 252, 0.12)', marginTop: '8px' }} />
                        </div>
                        <div className="glass" style={{ padding: '24px', borderRadius: '12px', flex: 1, marginBottom: '24px', borderTop: `2px solid ${tc}`, background: `radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, ${tc} 8%, transparent), rgba(6,2,18,0.4))`, boxShadow: `0 8px 32px color-mix(in srgb, ${tc} 5%, transparent)` }}>
                          <div className="font-accent" style={{ fontSize: '10px', color: tc, marginBottom: '8px', textShadow: `0 0 10px color-mix(in srgb, ${tc} 40%, transparent)` }}>
                            {exp.type} · {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                          </div>
                          <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--void-white)', marginBottom: '4px' }}>{exp.role}</h3>
                          <div className="font-mono" style={{ fontSize: '12px', color: 'rgba(248, 246, 255, 0.45)', marginBottom: '16px' }}>{exp.company} · {exp.location}</div>
                          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {exp.highlights.map((highlight, i) => (
                              <li key={i} className="font-mono" style={{ fontSize: '12px', color: 'rgba(248, 246, 255, 0.65)', paddingLeft: '16px', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0, color: 'var(--void-purple-500)' }}>›</span>{highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div id="contact-panel" className="void-scroll-panel" style={{top: '300vh', padding: '100px 40px'}}>
              <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h1 className="font-display" style={{ fontSize: 'clamp(28px, 5vw, 42px)', color: 'var(--void-white)', marginBottom: '12px' }}>{contact?.title || 'Contact'}</h1>
                <p className="font-mono" style={{ fontSize: '13px', color: 'rgba(248, 246, 255, 0.45)', marginBottom: '48px', maxWidth: '450px', lineHeight: 1.7 }}>
                  {contact?.intro}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                  {contact && [
                    { label: 'EMAIL', href: `mailto:${contact.email}`, text: contact.email, enabled: Boolean(contact.email) },
                    { label: 'GITHUB', href: contact.githubUrl, text: (contact.githubUrl||'').replace(/^https?:\/\//, '') + ' ->', enabled: Boolean(contact.githubUrl) },
                    { label: 'LINKEDIN', href: contact.linkedinUrl, text: (contact.linkedinUrl||'').replace(/^https?:\/\//, '') + ' ->', enabled: Boolean(contact.linkedinUrl) },
                    { label: 'X / TWITTER', href: contact.xUrl, text: (contact.xUrl||'').replace(/^https?:\/\//, '') + ' ->', enabled: Boolean(contact.xUrl) },
                  ].filter(i => i.enabled).map(link => (
                    <a key={link.label} href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'} className="glass glass-interactive" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', borderRadius: '12px', textDecoration: 'none', color: 'var(--void-white)', width: '100%' }}>
                      <span className="font-accent" style={{ fontSize: '10px', color: 'var(--void-purple-300)', minWidth: '60px' }}>{link.label}</span>
                      <span className="font-mono" style={{ fontSize: '14px' }}>{link.text}</span>
                    </a>
                  ))}
                </div>
                {contact && (contact.location || contact.availability) && (
                  <div className="font-mono" style={{ marginTop: '48px', fontSize: '12px', color: 'rgba(248, 246, 255, 0.3)', letterSpacing: '0.04em' }}>
                    {[contact.location, contact.availability].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
