'use client';

import { useEffect, useState } from 'react';
import type { BuildLog } from '@/lib/types';

const DEFAULT_BUILD_LOG: BuildLog = {
  currentProject: 'Azure Pavilion',
  currentStatus: 'Implementing graph-native memory system',
  lastSignal: new Date().toISOString(),
  openTo: ['Hire', 'Collaborate'],
  githubActivity: '12 commits this week',
};

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

export default function MissionStatus() {
  const [buildLog, setBuildLog] = useState<BuildLog>(DEFAULT_BUILD_LOG);

  useEffect(() => {
    async function fetchBuildLog() {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
        if (!strapiUrl) return;
        const res = await fetch(`${strapiUrl}/api/build-log`);
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.attributes) {
            setBuildLog(data.data.attributes as BuildLog);
          } else if (data?.data) {
            setBuildLog(data.data as BuildLog);
          }
        }
      } catch {
        // Use default fallback â€” never show broken UI
      }
    }

    fetchBuildLog();
    const interval = setInterval(fetchBuildLog, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 font-mono"
      style={{
        height: '36px',
        background: 'rgba(4, 1, 10, 0.9)',
        borderTop: '1px solid rgba(192, 132, 252, 0.18)',
        display: 'flex',
        alignItems: 'center',
        paddingInline: '24px',
        fontSize: '12px',
        color: 'rgba(248, 246, 255, 0.55)',
        gap: '8px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
      aria-label="Mission status"
      role="status"
    >
      {/* Live pulse dot */}
      <span
        className="pulse-live"
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#22c55e',
          flexShrink: 0,
        }}
      />
      <span style={{ color: '#22c55e', fontWeight: 500 }}>LIVE</span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span>
        Currently:{' '}
        <span style={{ color: 'var(--void-purple-300)' }}>
          {buildLog.currentProject}
        </span>{' '}
        â€” {buildLog.currentStatus}
      </span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span>Last signal: {formatTimeAgo(buildLog.lastSignal)}</span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span>Open to: {buildLog.openTo.join(' / ') || 'Open'}</span>
    </div>
  );
}

