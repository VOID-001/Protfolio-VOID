import Navigation from '@/components/ui/Navigation';
import IdentityMark from '@/components/ui/IdentityMark';
import MissionStatus from '@/components/ui/MissionStatus';
import { getSkills } from '@/lib/strapi';
import type { Skill, Domain } from '@/lib/types';

const DOMAIN_COLORS: Record<Domain, string> = {
  AI_ML: '#7c3aed',
  LLM_INFRA: '#6d28d9',
  BACKEND: '#4338ca',
  FRONTEND: '#5b21b6',
  DEVOPS: '#4f46e5',
  RESEARCH: '#7c3aed',
};

const DOMAIN_LABELS: Record<Domain, string> = {
  AI_ML: 'AI / ML',
  LLM_INFRA: 'LLM Infrastructure',
  BACKEND: 'Backend Systems',
  FRONTEND: 'Frontend / UI',
  DEVOPS: 'DevOps / MLOps',
  RESEARCH: 'Research',
};

function SkillCard({ skill }: { skill: Skill }) {
  const domainColor = DOMAIN_COLORS[skill.domain];

  return (
    <div
      className="glass glass-interactive"
      style={{
        padding: '24px',
        borderRadius: '12px',
        borderLeft: `3px solid ${domainColor}`,
      }}
    >
      <div
        className="font-display"
        style={{ fontSize: '16px', color: 'var(--void-white)', marginBottom: '6px' }}
      >
        {skill.name}
      </div>
      <div
        className="font-accent"
        style={{
          fontSize: '10px',
          color: domainColor,
          marginBottom: '16px',
        }}
      >
        {DOMAIN_LABELS[skill.domain]}
      </div>

      {/* Proficiency bar */}
      <div
        style={{
          width: '100%',
          height: '3px',
          background: 'rgba(192, 132, 252, 0.08)',
          borderRadius: '2px',
          marginBottom: '16px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${skill.proficiency * 10}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${domainColor}, var(--void-purple-300))`,
            borderRadius: '2px',
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Tools */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {skill.tools.map((tool) => (
          <span key={tool} className="tag-chip">
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function StackPage() {
  const skills = await getSkills();

  // Group by domain
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.domain]) acc[skill.domain] = [];
    acc[skill.domain].push(skill);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', padding: '100px 40px 80px' }}>
      <IdentityMark />
      <Navigation />

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            color: 'var(--void-white)',
            marginBottom: '12px',
          }}
        >
          Tech Stack
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
          The systems and tools I build with. Proficiency reflects production usage, not tutorial completion.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {Object.entries(grouped).map(([domain, domainSkills]) => (
            <div key={domain}>
              {domainSkills.map((skill) => (
                <div key={skill.id} style={{ marginBottom: '20px' }}>
                  <SkillCard skill={skill} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <MissionStatus />
    </div>
  );
}
