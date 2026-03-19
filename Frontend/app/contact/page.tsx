import Navigation from '@/components/ui/Navigation';
import IdentityMark from '@/components/ui/IdentityMark';
import MissionStatus from '@/components/ui/MissionStatus';

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '100px 40px 80px' }}>
      <IdentityMark />
      <Navigation />

      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            color: 'var(--void-white)',
            marginBottom: '12px',
          }}
        >
          Contact
        </h1>
        <p
          className="font-mono"
          style={{
            fontSize: '13px',
            color: 'rgba(248, 246, 255, 0.45)',
            marginBottom: '48px',
            maxWidth: '450px',
            lineHeight: 1.7,
          }}
        >
          Open to collaboration, consulting, and full-time roles in AI/ML
          engineering. I build production systems, not prototypes.
        </p>

        {/* Contact links */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
          }}
        >
          <a
            href="mailto:mangesh@voidsys.dev"
            className="glass glass-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--void-white)',
            }}
          >
            <span
              className="font-accent"
              style={{ fontSize: '10px', color: 'var(--void-purple-300)', minWidth: '60px' }}
            >
              EMAIL
            </span>
            <span className="font-mono" style={{ fontSize: '14px' }}>
              mangesh@voidsys.dev
            </span>
          </a>

          <a
            href="https://github.com/mangesh"
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--void-white)',
            }}
          >
            <span
              className="font-accent"
              style={{ fontSize: '10px', color: 'var(--void-purple-300)', minWidth: '60px' }}
            >
              GITHUB
            </span>
            <span className="font-mono" style={{ fontSize: '14px' }}>
              github.com/mangesh ↗
            </span>
          </a>

          <a
            href="https://linkedin.com/in/mangesh"
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--void-white)',
            }}
          >
            <span
              className="font-accent"
              style={{ fontSize: '10px', color: 'var(--void-purple-300)', minWidth: '60px' }}
            >
              LINKEDIN
            </span>
            <span className="font-mono" style={{ fontSize: '14px' }}>
              linkedin.com/in/mangesh ↗
            </span>
          </a>

          <a
            href="https://x.com/mangesh"
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--void-white)',
            }}
          >
            <span
              className="font-accent"
              style={{ fontSize: '10px', color: 'var(--void-purple-300)', minWidth: '60px' }}
            >
              X / TWITTER
            </span>
            <span className="font-mono" style={{ fontSize: '14px' }}>
              @mangesh ↗
            </span>
          </a>
        </div>

        {/* Location */}
        <div
          className="font-mono"
          style={{
            marginTop: '48px',
            fontSize: '12px',
            color: 'rgba(248, 246, 255, 0.3)',
            letterSpacing: '0.04em',
          }}
        >
          Based in Goa, India · Available remotely worldwide
        </div>
      </div>

      <MissionStatus />
    </div>
  );
}
