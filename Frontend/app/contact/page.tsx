import Navigation from '@/components/ui/Navigation';
import IdentityMark from '@/components/ui/IdentityMark';
import MissionStatus from '@/components/ui/MissionStatus';
import { getContactDetail } from '@/lib/strapi';

function ContactLink({
  label,
  href,
  text,
}: {
  label: string;
  href: string;
  text: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
      className="glass glass-interactive"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 24px',
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'var(--void-white)',
        width: '100%',
      }}
    >
      <span
        className="font-accent"
        style={{ fontSize: '10px', color: 'var(--void-purple-300)', minWidth: '60px' }}
      >
        {label}
      </span>
      <span className="font-mono" style={{ fontSize: '14px' }}>
        {text}
      </span>
    </a>
  );
}

export default async function ContactPage() {
  const contact = await getContactDetail();

  const links = [
    {
      label: 'EMAIL',
      href: `mailto:${contact.email}`,
      text: contact.email,
      enabled: Boolean(contact.email),
    },
    {
      label: 'GITHUB',
      href: contact.githubUrl,
      text: contact.githubUrl.replace(/^https?:\/\//, '') + ' ->',
      enabled: Boolean(contact.githubUrl),
    },
    {
      label: 'LINKEDIN',
      href: contact.linkedinUrl,
      text: contact.linkedinUrl.replace(/^https?:\/\//, '') + ' ->',
      enabled: Boolean(contact.linkedinUrl),
    },
    {
      label: 'X / TWITTER',
      href: contact.xUrl,
      text: contact.xUrl.replace(/^https?:\/\//, '') + ' ->',
      enabled: Boolean(contact.xUrl),
    },
  ].filter((item) => item.enabled);

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
          {contact.title || 'Contact'}
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
          {contact.intro}
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
          }}
        >
          {links.map((link) => (
            <ContactLink
              key={link.label}
              label={link.label}
              href={link.href}
              text={link.text}
            />
          ))}
        </div>

        {(contact.location || contact.availability) && (
          <div
            className="font-mono"
            style={{
              marginTop: '48px',
              fontSize: '12px',
              color: 'rgba(248, 246, 255, 0.3)',
              letterSpacing: '0.04em',
            }}
          >
            {[contact.location, contact.availability].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>

      <MissionStatus />
    </div>
  );
}

