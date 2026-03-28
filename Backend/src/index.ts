import type { Core } from '@strapi/strapi';

const DEFAULT_PROJECTS = [
  {
    title: 'Memoire',
    slug: 'memoire',
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
    projectStatus: 'LIVE',
    planetColor: 'cyan',
    graphEdges: [{ slug: 'cv-search', relation: 'shares-embedding-layer' }],
  },
  {
    title: 'Azure Pavilion',
    slug: 'azure-pavilion',
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
    projectStatus: 'LIVE',
    planetColor: 'amethyst',
    graphEdges: [{ slug: 'memoire', relation: 'shared-graph-engine' }],
  },
  {
    title: 'Serenity CLI',
    slug: 'serenity-cli',
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
    projectStatus: 'LIVE',
    planetColor: 'sapphire',
    graphEdges: [],
  },
  {
    title: 'CV-Search',
    slug: 'cv-search',
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
    projectStatus: 'WIP',
    planetColor: 'teal',
    graphEdges: [{ slug: 'memoire', relation: 'shared-embedding' }],
  },
  {
    title: 'ADAM System',
    slug: 'adam-system',
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
    projectStatus: 'ARCHIVED',
    planetColor: 'emerald',
    graphEdges: [],
  },
  {
    title: 'TxtToSQL',
    slug: 'txt-to-sql',
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
    projectStatus: 'ARCHIVED',
    planetColor: 'violet',
    graphEdges: [],
  },
];

const DEFAULT_SKILLS = [
  {
    name: 'Deep Learning',
    domain: 'AI_ML',
    proficiency: 9,
    tools: ['PyTorch', 'TensorFlow', 'JAX'],
    relatedProjectSlugs: ['memoire', 'cv-search'],
  },
  {
    name: 'LLM Orchestration',
    domain: 'LLM_INFRA',
    proficiency: 9,
    tools: ['LangChain', 'vLLM', 'Ollama'],
    relatedProjectSlugs: ['azure-pavilion', 'serenity-cli'],
  },
  {
    name: 'Backend Systems',
    domain: 'BACKEND',
    proficiency: 8,
    tools: ['FastAPI', 'Node.js', 'PostgreSQL', 'Redis'],
    relatedProjectSlugs: ['serenity-cli', 'cv-search'],
  },
  {
    name: 'Frontend Engineering',
    domain: 'FRONTEND',
    proficiency: 7,
    tools: ['React', 'Next.js', 'Three.js', 'TypeScript'],
    relatedProjectSlugs: ['azure-pavilion'],
  },
  {
    name: 'MLOps / DevOps',
    domain: 'DEVOPS',
    proficiency: 7,
    tools: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform'],
    relatedProjectSlugs: ['adam-system'],
  },
];

const DEFAULT_EXPERIENCES = [
  {
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

const DEFAULT_BUILD_LOG = {
  currentProject: 'Azure Pavilion',
  currentStatus: 'Implementing graph-native memory system',
  lastSignal: new Date().toISOString(),
  openTo: ['Hire', 'Collaborate'],
  githubActivity: '12 commits this week',
};

const DEFAULT_CONTACT_DETAIL = {
  title: 'Contact',
  intro:
    'Open to collaboration, consulting, and full-time roles in AI/ML engineering. I build production systems, not prototypes.',
  email: 'gavrav333@gmail.com',
  githubUrl: 'https://github.com/gavrav333',
  linkedinUrl: 'https://linkedin.com/in/gavrav333',
  xUrl: 'https://x.com/gavrav333',
  location: 'Based in Goa, India',
  availability: 'Available remotely worldwide',
};

async function ensurePublishedCollection(
  strapi: Core.Strapi,
  uid: 'api::project.project' | 'api::skill.skill' | 'api::experience.experience',
  defaults: Record<string, unknown>[],
  key: 'slug' | 'name' | 'role'
) {
  const documents = strapi.documents(uid);
  const existing = (await documents.findMany({ status: 'published' as any })) as Array<
    Record<string, unknown>
  >;

  if (uid === 'api::project.project') {
    const placeholder = existing.find((entry) => entry.slug === 'test');
    if (placeholder?.documentId && !defaults.some((item) => item.slug === 'test')) {
      await documents.delete({ documentId: String(placeholder.documentId) });
    }
  }

  // Prevent seeding default arrays if the user has already entered custom data
  if (existing.length > 0 && !existing.every((e) => e[key] === 'test')) {
    return;
  }

  const refreshed = (await documents.findMany({ status: 'published' as any })) as Array<
    Record<string, unknown>
  >;
  const existingKeys = new Set(
    refreshed
      .map((entry) => entry[key])
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
  );

  for (const item of defaults) {
    const value = item[key];
    if (typeof value === 'string' && !existingKeys.has(value)) {
      await documents.create({ data: item as any, status: 'published' as any });
    }
  }
}

async function ensureSingleton(
  strapi: Core.Strapi,
  uid: 'api::build-log.build-log' | 'api::contact-detail.contact-detail',
  data: Record<string, unknown>
) {
  const documents = strapi.documents(uid);
  const existing = (await documents.findFirst()) as
    | (Record<string, unknown> & { documentId?: string })
    | null;

  if (!existing?.documentId) {
    await documents.create({ data: data as any });
    return;
  }

  await documents.update({
    documentId: existing.documentId,
    data: data as any,
  });
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const roleService = strapi.plugin('users-permissions').service('role');
      if (!roleService) return;
      const roles = await roleService.find();
      const publicRole = roles.find((r: any) => r.type === 'public');

      if (publicRole) {
        const apis = ['build-log', 'contact-detail', 'experience', 'project', 'skill'];
        
        for (const api of apis) {
          const findAction = `api::${api}.${api}.find`;
          const findOneAction = `api::${api}.${api}.findOne`;
          
          for (const action of [findAction, findOneAction]) {
            const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({
              where: { action, role: publicRole.id }
            });
            
            if (!exists) {
              await strapi.db.query('plugin::users-permissions.permission').create({
                data: { action, role: publicRole.id }
              });
            }
          }
        }
        console.log('Public permissions successfully bootstrapped for PostgreSQL.');
      }

      await ensurePublishedCollection(
        strapi,
        'api::project.project',
        DEFAULT_PROJECTS,
        'slug'
      );
      await ensurePublishedCollection(strapi, 'api::skill.skill', DEFAULT_SKILLS, 'name');
      await ensurePublishedCollection(
        strapi,
        'api::experience.experience',
        DEFAULT_EXPERIENCES,
        'role'
      );
      await ensureSingleton(strapi, 'api::build-log.build-log', DEFAULT_BUILD_LOG);
      await ensureSingleton(
        strapi,
        'api::contact-detail.contact-detail',
        DEFAULT_CONTACT_DETAIL
      );

      console.log('Default CMS content ensured for projects, skills, experiences, and singletons.');
    } catch (err) {
      console.error('Failed to bootstrap public permissions:', err);
    }
  },
};
