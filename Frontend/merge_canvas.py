import re

with open(r'C:\Users\Admin\.gemini\antigravity\brain\61b6cf4e-d182-480a-92e1-e8ae0018f59e\void_canvas_old2.tsx', 'r', encoding='utf-8') as f:
    old_content = f.read()

header = """'use client';

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

"""

orbits_index = old_content.find('const ORBITS = [')
imports_index = old_content.find('export default function VoidCanvas')
orbits_block = old_content[orbits_index:imports_index]

main_block = """export default function VoidCanvas({ projects, buildLog }: VoidCanvasProps) {
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

  // maps new strapi model to old fields logic
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
    mouseX: 0,
    mouseY: 0,
    hoveredOrb: -1,
    diskAngle: 0,
    miniT: 0,
    W: 0, H: 0, cx: 0, cy: 0,
    projects: internalProjects, 
  });

  const orbPositions = useRef(internalProjects.map(() => ({ x: 0, y: 0, r: 0 })));
"""

rest_of_canvas = old_content[old_content.find('  // Initialize particles once'):]
rest_of_canvas = rest_of_canvas.replace('PROJECTS.map', 'internalProjects.map')
# remove generic types from older versions
rest_of_canvas = rest_of_canvas.replace('selectProject(proj: ProjectData, idx: number)', 'selectProject(proj: any, idx: number)')

# Handle URLs in the selectProject
select_pos = rest_of_canvas.find('st.panelOpen = true;')
# Before st.panelOpen = true; we add the links logic
link_code = """
      if (linksRef.current) {
        linksRef.current.innerHTML = '';
        if (proj.github) {
          const a = document.createElement('a'); a.href = proj.github; a.target = '_blank';
          a.className = 'vbtn-primary'; a.textContent = 'GitHub ->'; linksRef.current.appendChild(a);
        }
        if (proj.url) {
          const a = document.createElement('a'); a.href = proj.url; a.target = '_blank';
          a.className = 'vbtn-ghost'; a.textContent = 'Project ->'; linksRef.current.appendChild(a);
        }
      }
"""
rest_of_canvas = rest_of_canvas[:select_pos] + link_code + rest_of_canvas[select_pos:]


status_idx = rest_of_canvas.find('{/* Status bar */}')
bottom_part = rest_of_canvas[status_idx:]
rest_of_canvas = rest_of_canvas[:status_idx]

# Replace JSX
new_bottom = """        {/* Status bar */}
        <div className="void-status">
          <div className="dot" />
          <span className="live">LIVE</span>
          <span>|</span>
          <span>
            Currently: <span className="hl">{buildLog.currentProject}</span> - {buildLog.currentStatus}
          </span>
          <span>|</span>
          <span>Last signal: {formatTimeAgo(buildLog.lastSignal)}</span>
          <span>|</span>
          <span>Open to: {buildLog.openTo.join(' / ') || 'Open'}</span>
          <span>|</span>
          <span>Planets: {internalProjects.length}</span>
        </div>

        {/* Panel */}
        <div className="void-panel" ref={panelRef}>
          <div className="void-panel-header">
            <div className="void-panel-title" ref={titleRef}>Project Name</div>
            <div className="void-panel-close" id="panel-close-btn">ESC ├ù</div>
          </div>
          <div className="void-panel-domain" ref={domainRef}>DOMAIN ┬╖ STATUS</div>
          <div className="void-panel-divider" />
          <div className="void-panel-preview">
            <canvas ref={miniCanvasRef} width={344} height={140} />
          </div>
          <div className="void-panel-desc" ref={descRef}>Description goes here.</div>
          <div className="void-panel-stack" ref={stackRef} />
          <div className="void-panel-links" ref={linksRef}></div>
        </div>

        {/* Main canvas */}
        <canvas ref={canvasRef} id="void-canvas" />
      </div>
    </>
  );
}
"""

all_content = header + orbits_block + main_block + rest_of_canvas + new_bottom

# Now fix the navigation
nav_replacement = """        {/* Navigation */}
        <div className="void-nav">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>WORK</Link>
          <Link href="/stack" className={pathname === '/stack' ? 'active' : ''}>STACK</Link>
          <Link href="/signal" className={pathname === '/signal' ? 'active' : ''}>SIGNAL</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>CONTACT</Link>
        </div>
        {/* Hint */}"""

all_content = re.sub(r'\{\/\* Navigation \*\/\}[\\s\\S]*?\{\/\* Hint \*\/\}', nav_replacement, all_content)

# We also need to fix a couple of lint stuff 
all_content = all_content.replace('getOrbRadius(proj: ProjectData)', 'getOrbRadius(proj: any)')
all_content = all_content.replace('drawMiniCanvas(proj: ProjectData)', 'drawMiniCanvas(proj: any)')

with open(r'd:\Project-test\VOID-portfolio\Frontend\components\VoidCanvas.tsx', 'w', encoding='utf-8') as f:
    f.write(all_content)
