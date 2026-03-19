'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useOrbInteraction } from '@/hooks/useOrbInteraction';

const panelVariants: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      type: 'tween',
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    x: '100%',
    transition: {
      type: 'tween',
      duration: 0.4,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

export default function ProjectPanel() {
  const { selectedProject, clearSelection, state } = useOrbInteraction();

  const handleClose = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // ESC key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  return (
    <AnimatePresence>
      {state === 'selected' && selectedProject && (
        <motion.aside
          className="project-panel glass"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-label={`Project details: ${selectedProject.title}`}
          role="dialog"
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px',
            }}
          >
            <h2
              className="font-display"
              style={{
                fontSize: '22px',
                color: 'var(--void-white)',
                lineHeight: 1.2,
              }}
            >
              {selectedProject.title}
            </h2>
            <button
              onClick={handleClose}
              aria-label="Close panel"
              style={{
                background: 'none',
                border: '1px solid rgba(192, 132, 252, 0.25)',
                color: 'var(--void-purple-300)',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.05em',
                transition: 'border-color 0.2s',
                flexShrink: 0,
                marginLeft: '12px',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderColor =
                  'rgba(192, 132, 252, 0.6)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor =
                  'rgba(192, 132, 252, 0.25)';
              }}
            >
              ESC ×
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'rgba(192, 132, 252, 0.12)',
              marginBottom: '20px',
            }}
          />

          {/* Thumbnail */}
          <div
            style={{
              width: '100%',
              height: '180px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
              background: 'rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(192, 132, 252, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className="font-accent"
              style={{
                fontSize: '12px',
                color: 'rgba(248, 246, 255, 0.25)',
              }}
            >
              [ Media ]
            </span>
          </div>

          {/* Stack tags */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '16px',
            }}
          >
            {selectedProject.stack.map((tech) => (
              <span key={tech} className="tag-chip">
                {tech}
              </span>
            ))}
          </div>

          {/* Domain */}
          <div
            className="font-accent"
            style={{
              fontSize: '11px',
              color: 'var(--void-purple-300)',
              marginBottom: '20px',
            }}
          >
            Domain: {selectedProject.domain.replace('_', ' / ')}
          </div>

          {/* Description */}
          <p
            className="font-mono"
            style={{
              fontSize: '13px',
              lineHeight: 1.65,
              color: 'rgba(248, 246, 255, 0.75)',
              marginBottom: '28px',
            }}
          >
            {selectedProject.shortDescription}
          </p>

          {/* Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '28px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background:
                  selectedProject.status === 'LIVE'
                    ? '#22c55e'
                    : selectedProject.status === 'WIP'
                    ? '#eab308'
                    : '#64748b',
              }}
            />
            <span
              style={{
                color: 'rgba(248, 246, 255, 0.45)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
              }}
            >
              {selectedProject.status}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {selectedProject.githubUrl && (
              <a
                href={selectedProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass glass-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  color: 'var(--void-white)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                }}
              >
                GitHub ↗
              </a>
            )}
            <button
              className="glass glass-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                borderRadius: '6px',
                color: 'var(--void-purple-300)',
                background: 'rgba(124, 58, 237, 0.15)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                letterSpacing: '0.04em',
              }}
            >
              Case Study →
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
