export default function IdentityMark() {
  return (
    <div className="fixed top-8 left-8 z-40 select-none" aria-label="Site identity">
      <div
        className="font-display"
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--void-white)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        VOID.SYS
      </div>
      <div
        className="font-mono"
        style={{
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--void-white)',
          opacity: 0.45,
          marginTop: '6px',
          letterSpacing: '0.04em',
        }}
      >
        AI Engineer · Goa, IN
      </div>
    </div>
  );
}
