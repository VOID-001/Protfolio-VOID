'use client';

import dynamic from 'next/dynamic';

// Client-only — uses Canvas 2D, requestAnimationFrame, DOM manipulation
const VoidCanvas = dynamic(() => import('@/components/VoidCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed', inset: 0, background: '#03000a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px',
      color: 'rgba(240,236,255,0.3)', letterSpacing: '0.12em',
    }}>
      INITIALIZING VOID.SYS...
    </div>
  ),
});

export default function HomePage() {
  return <VoidCanvas />;
}
