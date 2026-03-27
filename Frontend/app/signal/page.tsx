import { getExperiences } from '@/lib/strapi';
import type { Experience } from '@/lib/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function TimelineItem({ experience }: { experience: Experience }) {
  const typeColors: Record<string, string> = {
    FULLTIME: '#22c55e',
    INTERNSHIP: '#eab308',
    RESEARCH: '#7c3aed',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        position: 'relative',
      }}
    >
      {/* Timeline line + dot */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          width: '20px',
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: typeColors[experience.type] ?? 'var(--void-purple-500)',
            border: '2px solid var(--void-deep)',
            flexShrink: 0,
            marginTop: '6px',
          }}
        />
        <div
          style={{
            width: '1px',
            flexGrow: 1,
            background: 'rgba(192, 132, 252, 0.12)',
            marginTop: '8px',
          }}
        />
      </div>

      {/* Content */}
      <div
        className="glass"
        style={{
          padding: '24px',
          borderRadius: '12px',
          flex: 1,
          marginBottom: '24px',
        }}
      >
        <div
          className="font-accent"
          style={{
            fontSize: '10px',
            color: typeColors[experience.type] ?? 'var(--void-purple-300)',
            marginBottom: '8px',
          }}
        >
          {experience.type} · {formatDate(experience.startDate)} —{' '}
          {experience.endDate ? formatDate(experience.endDate) : 'Present'}
        </div>

        <h3
          className="font-display"
          style={{
            fontSize: '18px',
            color: 'var(--void-white)',
            marginBottom: '4px',
          }}
        >
          {experience.role}
        </h3>

        <div
          className="font-mono"
          style={{
            fontSize: '12px',
            color: 'rgba(248, 246, 255, 0.45)',
            marginBottom: '16px',
          }}
        >
          {experience.company} · {experience.location}
        </div>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {experience.highlights.map((highlight, i) => (
            <li
              key={i}
              className="font-mono"
              style={{
                fontSize: '12px',
                color: 'rgba(248, 246, 255, 0.65)',
                paddingLeft: '16px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: 'var(--void-purple-500)',
                }}
              >
                ›
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default async function SignalPage() {
  const experiences = await getExperiences();

  return (
    <div style={{ padding: '100px 40px 80px', height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            color: 'var(--void-white)',
            marginBottom: '12px',
          }}
        >
          Signal
        </h1>
        <p
          className="font-mono"
          style={{
            fontSize: '13px',
            color: 'rgba(248, 246, 255, 0.45)',
            marginBottom: '48px',
            maxWidth: '500px',
          }}
        >
          Career trajectory. Building production AI systems and shipping real products.
        </p>

        <div>
          {experiences.map((exp) => (
            <TimelineItem key={exp.id} experience={exp} />
          ))}
        </div>
      </div>

      </div>
  );
}
