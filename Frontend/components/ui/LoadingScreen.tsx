'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation before calling onComplete
      setTimeout(onComplete, 500);
    }, 2400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          aria-label="Loading VOID.SYS"
          role="alert"
          aria-live="polite"
        >
          {/* Aurora background for loading screen */}
          <div className="aurora-container" aria-hidden="true">
            <div className="aurora-orb aurora-orb-1" />
            <div className="aurora-orb aurora-orb-2" />
            <div className="aurora-orb aurora-orb-3" />
          </div>

          {/* Noise overlay */}
          <div className="noise-overlay" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg">
              <filter id="noise-loading">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.65"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#noise-loading)" />
            </svg>
          </div>

          {/* Main content */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div className="loading-title">VOID.SYS</div>

            <div className="loading-bar-track">
              <div className="loading-bar-fill" />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="font-mono"
              style={{
                marginTop: '20px',
                fontSize: '11px',
                letterSpacing: '0.12em',
                color: 'var(--void-white)',
              }}
            >
              INITIALIZING SYSTEMS
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
