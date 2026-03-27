export default function Loading() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#03000a',
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: '"IBM Plex Mono", monospace'
    }}>
      <style>{`
        @keyframes vpulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(192, 132, 252, 0.4); }
          50% { opacity: 0.5; box-shadow: 0 0 0 8px rgba(192, 132, 252, 0); }
        }
        @keyframes drift {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-20px) scale(1.1); opacity: 0; }
        }
      `}</style>
      
      {/* Central Black Hole Core Concept */}
      <div style={{
        position: 'relative',
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #000 40%, rgba(30,10,60,0.8) 60%, transparent 80%)',
        boxShadow: '0 0 40px rgba(160, 80, 255, 0.15), inset 0 0 20px rgba(0,0,0,1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '40px'
      }}>
        {/* Pulsing singularity */}
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#c084fc',
          animation: 'vpulse 2s infinite'
        }} />
      </div>

      <div style={{ 
        color: '#f0ecff', 
        fontSize: '14px', 
        letterSpacing: '0.2em',
        marginBottom: '12px',
        fontWeight: 500
      }}>
        ESTABLISHING ORBIT
      </div>
      
      <div style={{ 
        color: 'rgba(192,132,252,0.6)', 
        fontSize: '11px',
        letterSpacing: '0.1em'
      }}>
        INITIALIZING SPATIAL DATA...
      </div>
    </div>
  );
}
