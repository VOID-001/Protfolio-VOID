import type {
  BuildLog,
  ContactDetail,
  Experience,
  Project,
  Skill,
} from './types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '';

const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    slug: 'memoire',
    title: 'Memoire',
    shortDescription:
      'AI-powered personal knowledge graph that learns how you think. Semantic search over your entire digital life.',
    fullCaseStudy: '',
    stack: ['Python', 'LangChain', 'ChromaDB', 'FastAPI', 'React'],
    domain: 'AI_ML',
    orbitTier: 'A',
    complexity: 8,
    recency: 9,
    thumbnailUrl: '/placeholder.png',
    githubUrl: 'https://github.com/mangesh/memoire',
    projectUrl: '',
    status: 'LIVE',
    graphEdges: [{ slug: 'cv-search', relation: 'shares-embedding-layer' }],
  },
  {
    id: 2,
    slug: 'azure-pavilion',
    title: 'Azure Pavilion',
    shortDescription:
      'Graph-native diary app with AI characters. Memgraph-backed, context-aware emotional companion.',
    fullCaseStudy: '',
    stack: ['Next.js', 'Memgraph', 'TypeScript', 'n8n', 'OpenAI'],
    domain: 'LLM_INFRA',
    orbitTier: 'A',
    complexity: 9,
    recency: 10,
    thumbnailUrl: '/placeholder.png',
    githubUrl: 'https://github.com/mangesh/azure-pavilion',
    projectUrl: '',
    status: 'LIVE',
    graphEdges: [{ slug: 'memoire', relation: 'shared-graph-engine' }],
  },
  {
    id: 3,
    slug: 'serenity-cli',
    title: 'Serenity CLI',
    shortDescription:
      'Terminal-native LLM orchestration. Pipe commands through AI models with zero latency overhead.',
    fullCaseStudy: '',
    stack: ['Rust', 'vLLM', 'gRPC', 'Docker'],
    domain: 'BACKEND',
    orbitTier: 'B',
    complexity: 6,
    recency: 7,
    thumbnailUrl: '/placeholder.png',
    githubUrl: 'https://github.com/mangesh/serenity-cli',
    projectUrl: '',
    status: 'LIVE',
    graphEdges: [],
  },
  {
    id: 4,
    slug: 'cv-search',
    title: 'CV-Search',
    shortDescription:
      'Resume parser + semantic matcher. Screens 1000 CVs in 30 seconds with domain-specific embeddings.',
    fullCaseStudy: '',
    stack: ['Python', 'FAISS', 'Transformers', 'FastAPI', 'PostgreSQL'],
    domain: 'AI_ML',
    orbitTier: 'B',
    complexity: 5,
    recency: 6,
    thumbnailUrl: '/placeholder.png',
    githubUrl: 'https://github.com/mangesh/cv-search',
    projectUrl: '',
    status: 'WIP',
    graphEdges: [{ slug: 'memoire', relation: 'shared-embedding' }],
  },
  {
    id: 5,
    slug: 'adam-system',
    title: 'ADAM System',
    shortDescription:
      'Autonomous Data Analysis Machine. Self-improving pipeline that writes its own feature engineering.',
    fullCaseStudy: '',
    stack: ['Python', 'Pandas', 'Scikit-learn', 'Airflow', 'PostgreSQL'],
    domain: 'RESEARCH',
    orbitTier: 'C',
    complexity: 4,
    recency: 4,
    thumbnailUrl: '/placeholder.png',
    githubUrl: 'https://github.com/mangesh/adam-system',
    projectUrl: '',
    status: 'ARCHIVED',
    graphEdges: [],
  },
  {
    id: 6,
    slug: 'txt-to-sql',
    title: 'TxtToSQL',
    shortDescription:
      'Natural language to SQL transpiler. Fine-tuned T5 model achieving 89% execution accuracy on Spider.',
    fullCaseStudy: '',
    stack: ['Python', 'T5', 'HuggingFace', 'SQLite', 'Flask'],
    domain: 'AI_ML',
    orbitTier: 'C',
    complexity: 3,
    recency: 3,
    thumbnailUrl: '/placeholder.png',
    githubUrl: 'https://github.com/mangesh/txt-to-sql',
    projectUrl: '',
    status: 'ARCHIVED',
    graphEdges: [],
  },
];

const MOCK_SKILLS: Skill[] = [
  {
    id: 1,
    name: 'Deep Learning',
    domain: 'AI_ML',
    proficiency: 9,
    tools: ['PyTorch', 'TensorFlow', 'JAX'],
    relatedProjectSlugs: ['memoire', 'cv-search'],
  },
  {
    id: 2,
    name: 'LLM Orchestration',
    domain: 'LLM_INFRA',
    proficiency: 9,
    tools: ['LangChain', 'vLLM', 'Ollama'],
    relatedProjectSlugs: ['azure-pavilion', 'serenity-cli'],
  },
  {
    id: 3,
    name: 'Backend Systems',
    domain: 'BACKEND',
    proficiency: 8,
    tools: ['FastAPI', 'Node.js', 'PostgreSQL', 'Redis'],
    relatedProjectSlugs: ['serenity-cli', 'cv-search'],
  },
  {
    id: 4,
    name: 'Frontend Engineering',
    domain: 'FRONTEND',
    proficiency: 7,
    tools: ['React', 'Next.js', 'Three.js', 'TypeScript'],
    relatedProjectSlugs: ['azure-pavilion'],
  },
  {
    id: 5,
    name: 'MLOps / DevOps',
    domain: 'DEVOPS',
    proficiency: 7,
    tools: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform'],
    relatedProjectSlugs: ['adam-system'],
  },
];

const MOCK_EXPERIENCES: Experience[] = [
  {
    id: 1,
    role: 'AI/ML Engineer',
    company: 'Independent',
    location: 'Goa, India',
    startDate: '2024-01-01',
    endDate: null,
    highlights: [
      'Building production LLM systems',
      'Open-source contributor',
      'Shipping real AI products',
    ],
    type: 'FULLTIME',
  },
  {
    id: 2,
    role: 'ML Research Intern',
    company: 'Research Lab',
    location: 'Remote',
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    highlights: [
      'NLP pipeline optimization',
      'Published fine-tuning results',
      'Reduced inference latency 40%',
    ],
    type: 'INTERNSHIP',
  },
];

const MOCK_BUILD_LOG: BuildLog = {
  currentProject: 'Azure Pavilion',
  currentStatus: 'Implementing graph-native memory system',
  lastSignal: new Date().toISOString(),
  openTo: ['Hire', 'Collaborate'],
  githubActivity: '12 commits this week',
};

const MOCK_CONTACT_DETAIL: ContactDetail = {
  title: 'Contact',
  intro:
    'Open to collaboration, consulting, and full-time roles in AI/ML engineering. I build production systems, not prototypes.',
  email: 'mangesh@voidsys.dev',
  githubUrl: 'https://github.com/mangesh',
  linkedinUrl: 'https://linkedin.com/in/mangesh',
  xUrl: 'https://x.com/mangesh',
  location: 'Based in Goa, India',
  availability: 'Available remotely worldwide',
};

async function strapiFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (STRAPI_TOKEN) {
      headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
    }

    const res = await fetch(`${STRAPI_URL}/api${endpoint}`, {
      headers,
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function unwrapEntity<T extends Record<string, unknown>>(entity: unknown): T {
  const root = asRecord(entity);
  const attrs = root.attributes;

  if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
    return attrs as T;
  }

  return root as T;
}

function getEntityId(entity: unknown): number {
  const root = asRecord(entity);
  return typeof root.id === 'number' ? root.id : 0;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function mapStrapiProject(raw: unknown): Project {
  const attrs = unwrapEntity<Record<string, unknown>>(raw);

  return {
    id: getEntityId(raw),
    slug: (attrs.slug as string) ?? '',
    title: (attrs.title as string) ?? '',
    shortDescription: (attrs.shortDescription as string) ?? '',
    fullCaseStudy: (attrs.fullCaseStudy as string) ?? '',
    stack: asStringArray(attrs.stack),
    domain: (attrs.domain as Project['domain']) ?? 'AI_ML',
    orbitTier: (attrs.orbitTier as Project['orbitTier']) ?? 'B',
    complexity: (attrs.complexity as number) ?? 5,
    recency: (attrs.recency as number) ?? 5,
    thumbnailUrl: (attrs.thumbnailUrl as string) ?? '/placeholder.png',
    videoLoopUrl: (attrs.videoLoopUrl as string) ?? undefined,
    githubUrl: (attrs.githubUrl as string) ?? '',
    projectUrl: (attrs.projectUrl as string) ?? '',
    status: (attrs.projectStatus as Project['status']) ?? 'WIP',
    planetColor: (attrs.planetColor as string) ?? undefined,
    graphEdges: (attrs.graphEdges as Project['graphEdges']) ?? [],
  };
}

function mapStrapiSkill(raw: unknown): Skill {
  const attrs = unwrapEntity<Record<string, unknown>>(raw);

  return {
    id: getEntityId(raw),
    name: (attrs.name as string) ?? '',
    domain: (attrs.domain as Skill['domain']) ?? 'AI_ML',
    proficiency: (attrs.proficiency as number) ?? 5,
    tools: asStringArray(attrs.tools),
    relatedProjectSlugs: asStringArray(attrs.relatedProjectSlugs),
  };
}

function mapStrapiExperience(raw: unknown): Experience {
  const attrs = unwrapEntity<Record<string, unknown>>(raw);

  return {
    id: getEntityId(raw),
    role: (attrs.role as string) ?? '',
    company: (attrs.company as string) ?? '',
    location: (attrs.location as string) ?? '',
    startDate: (attrs.startDate as string) ?? '',
    endDate: (attrs.endDate as string | null) ?? null,
    highlights: asStringArray(attrs.highlights),
    type: (attrs.type as Experience['type']) ?? 'FULLTIME',
  };
}

function mapBuildLog(raw: unknown): BuildLog {
  const attrs = unwrapEntity<Record<string, unknown>>(raw);

  return {
    currentProject: (attrs.currentProject as string) ?? MOCK_BUILD_LOG.currentProject,
    currentStatus: (attrs.currentStatus as string) ?? MOCK_BUILD_LOG.currentStatus,
    lastSignal: (attrs.lastSignal as string) ?? new Date().toISOString(),
    openTo: asStringArray(attrs.openTo),
    githubActivity: (attrs.githubActivity as string) ?? '',
  };
}

function mapContactDetail(raw: unknown): ContactDetail {
  const attrs = unwrapEntity<Record<string, unknown>>(raw);

  return {
    title: (attrs.title as string) ?? MOCK_CONTACT_DETAIL.title,
    intro: (attrs.intro as string) ?? MOCK_CONTACT_DETAIL.intro,
    email: (attrs.email as string) ?? MOCK_CONTACT_DETAIL.email,
    githubUrl: (attrs.githubUrl as string) ?? MOCK_CONTACT_DETAIL.githubUrl,
    linkedinUrl: (attrs.linkedinUrl as string) ?? MOCK_CONTACT_DETAIL.linkedinUrl,
    xUrl: (attrs.xUrl as string) ?? MOCK_CONTACT_DETAIL.xUrl,
    location: (attrs.location as string) ?? MOCK_CONTACT_DETAIL.location,
    availability: (attrs.availability as string) ?? MOCK_CONTACT_DETAIL.availability,
  };
}

export async function getProjects(): Promise<Project[]> {
  const response = await strapiFetch<{ data?: unknown[] }>(
    '/projects?sort=recency:desc'
  );

  if (Array.isArray(response?.data) && response.data.length > 0) {
    return response.data.map(mapStrapiProject);
  }

  return MOCK_PROJECTS;
}

export async function getSkills(): Promise<Skill[]> {
  const response = await strapiFetch<{ data?: unknown[] }>('/skills?sort=proficiency:desc');

  if (Array.isArray(response?.data) && response.data.length > 0) {
    return response.data.map(mapStrapiSkill);
  }

  return MOCK_SKILLS;
}

export async function getExperiences(): Promise<Experience[]> {
  const response = await strapiFetch<{ data?: unknown[] }>('/experiences?sort=startDate:desc');

  if (Array.isArray(response?.data) && response.data.length > 0) {
    return response.data.map(mapStrapiExperience);
  }

  return MOCK_EXPERIENCES;
}

export async function getBuildLog(): Promise<BuildLog> {
  const response = await strapiFetch<{ data?: unknown }>('/build-log');

  if (response?.data) {
    return mapBuildLog(response.data);
  }

  return MOCK_BUILD_LOG;
}

export async function getContactDetail(): Promise<ContactDetail> {
  const response = await strapiFetch<{ data?: unknown }>('/contact-detail');

  if (response?.data) {
    return mapContactDetail(response.data);
  }

  return MOCK_CONTACT_DETAIL;
}

