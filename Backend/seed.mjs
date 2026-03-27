/**
 * Strapi v5 CMS Seed Script (using Content Manager admin API)
 * Clears all existing data and populates from Mangesh Phadte's resume.
 * 
 * Usage: node seed.mjs
 */

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'phadte4141@gmail.com';
const ADMIN_PASSWORD = 'Thruxton@1200';

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function getAdminToken() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Admin login failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.data.token;
}

function headers(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// Content Manager base URL for Strapi v5
const CM = '/content-manager';

// ─── Collection Type Operations ─────────────────────────────────────────────────

async function cmFindAll(token, uid) {
  const res = await fetch(`${STRAPI_URL}${CM}/collection-types/${uid}?page=1&pageSize=100`, {
    headers: headers(token),
  });
  if (!res.ok) {
    console.log(`  ⚠ Could not fetch ${uid}: ${res.status}`);
    return [];
  }
  const json = await res.json();
  return json.results || json.data || json || [];
}

async function cmDelete(token, uid, documentId) {
  const res = await fetch(`${STRAPI_URL}${CM}/collection-types/${uid}/${documentId}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  return res.ok;
}

async function cmCreate(token, uid, data) {
  const res = await fetch(`${STRAPI_URL}${CM}/collection-types/${uid}`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.log(`  ✗ Failed to create ${uid}: ${res.status} ${errText}`);
    return null;
  }
  const json = await res.json();
  // Strapi v5 wraps in { data: { ... } }
  return json.data || json;
}

async function cmPublish(token, uid, documentId) {
  const res = await fetch(`${STRAPI_URL}${CM}/collection-types/${uid}/${documentId}/actions/publish`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.log(`  ⚠ Publish failed for ${uid}/${documentId}: ${res.status} ${errText}`);
    return false;
  }
  return true;
}

async function deleteAllEntries(token, uid) {
  const entries = await cmFindAll(token, uid);
  for (const entry of entries) {
    const docId = entry.documentId || entry.id;
    const ok = await cmDelete(token, uid, docId);
    console.log(`  ${ok ? '✓' : '✗'} Deleted ${uid} entry: ${docId}`);
  }
}

async function createAndPublish(token, uid, data, label) {
  const entry = await cmCreate(token, uid, data);
  if (!entry) return null;
  const docId = entry.documentId || entry.id;
  const published = await cmPublish(token, uid, docId);
  console.log(`  ${published ? '✓' : '⚠'} ${label} → ${docId}`);
  return entry;
}

// ─── Single Type Operations ─────────────────────────────────────────────────────

async function cmGetSingle(token, uid) {
  const res = await fetch(`${STRAPI_URL}${CM}/single-types/${uid}`, {
    headers: headers(token),
  });
  if (!res.ok) return null;
  return await res.json();
}

async function cmPutSingle(token, uid, data) {
  const res = await fetch(`${STRAPI_URL}${CM}/single-types/${uid}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.log(`  ✗ Failed to upsert ${uid}: ${res.status} ${errText}`);
    return null;
  }
  const json = await res.json();
  console.log(`  ✓ Updated single type: ${uid}`);
  return json.data || json;
}

// ─── Resume Data ────────────────────────────────────────────────────────────────

const EXPERIENCES = [
  {
    role: 'Trainee Junior AI Developer',
    company: 'Tentwenty Digital LLP',
    location: 'Porvorim, Goa',
    startDate: '2025-08-01',
    endDate: '2026-05-31',
    type: 'FULLTIME',
    highlights: [
      'Built end-to-end AI systems for local and on-prem deployment, covering backend APIs, agentic workflows, and frontend delivery',
      'Engineered agentic AI workflows using n8n, enabling multi-step autonomous reasoning pipelines deployed via Docker',
      'Developed AI-driven frontends using Next.js + TypeScript, containerized and exposed securely using Cloudflare Tunnel',
      'Deployed and managed open-source LLM stacks including LiteLLM, vLLM, OpenWebUI, LLaMA.cpp',
      'Conducted internal and external AI & code audits, identifying performance bottlenecks and pre-deployment risks',
      'Led SEO and frontend audits improving production readiness and post-launch stability',
      'Proactively flagged critical bugs and design gaps before deployment, reducing production incidents',
    ],
  },
  {
    role: 'AI Intern Developer',
    company: 'Remote Software Solutions',
    location: 'Porvorim, Goa',
    startDate: '2024-06-01',
    endDate: '2025-05-31',
    type: 'INTERNSHIP',
    highlights: [
      'Developed and implemented FastAPI projects utilizing Python libraries',
      'Leveraged advanced AI libraries to integrate machine learning models',
      'Collaborated on two company-specific projects from requirements to deployment',
      'Hands-on experience in remote team collaboration and agile methodologies',
    ],
  },
  {
    role: 'Research Intern',
    company: 'BITS Pilani',
    location: 'Zuarinagar, Sancoale, Goa',
    startDate: '2023-02-01',
    endDate: '2025-05-31',
    type: 'RESEARCH',
    highlights: [
      'Implemented streamlined process for gathering Vehicle Data in Real Time',
      'Created backend for AI-based Driver Behavior Analysis',
      'Building a Black-Box system for vehicles with onboard AI-powered analysis and diagnostics',
    ],
  },
];

const PROJECTS = [
  {
    title: 'Automotive Diagnostics & Monitoring System',
    slug: 'automotive-diagnostics',
    shortDescription: 'AI-powered vehicle safety system for accident data collection, engine risk identification, and diagnostics.',
    fullCaseStudy: '## Overview\nUsing electronic devices to enhance vehicle safety, user convenience, and forensic capabilities like accident data collection.\n\n## Key Features\n- Proactive engine risk identification\n- Real-time vehicle data collection\n- AI-powered diagnostics\n- Accident data forensics\n\n## Impact\nImproves overall road safety and creates a well-informed consumer experience.',
    stack: ['FastAPI', 'Python', 'TensorFlow', 'Raspberry Pi', 'OBD-II'],
    domain: 'RESEARCH',
    orbitTier: 'A',
    complexity: 8,
    recency: 8,
    thumbnailUrl: '/placeholder.png',
    githubUrl: '',
    projectUrl: '',
    projectStatus: 'WIP',
    planetColor: 'emerald',
    graphEdges: [],
  },
  {
    title: 'Memoire',
    slug: 'memoire',
    shortDescription: 'AI-powered personal memory & reflection system with LLM journaling and graph-based storage.',
    fullCaseStudy: '## Overview\nFull-stack AI notes and diary platform using Next.js + TypeScript and containerized backend.\n\n## Key Features\n- LLM-assisted journaling — chat with your notes\n- Self-reflection and insight extraction\n- Memgraph graph-based memory storage\n- Privacy-first, local or self-hosted via Docker',
    stack: ['Next.js', 'TypeScript', 'Memgraph', 'Docker', 'LLM'],
    domain: 'AI_ML',
    orbitTier: 'A',
    complexity: 9,
    recency: 9,
    thumbnailUrl: '/placeholder.png',
    githubUrl: '',
    projectUrl: '',
    projectStatus: 'WIP',
    planetColor: 'purple',
    graphEdges: [{ slug: 'azure-pavilion', relation: 'shared-graph-engine' }],
  },
  {
    title: 'Azure Pavilion',
    slug: 'azure-pavilion',
    shortDescription: 'Open-source LLM deployment & control plane with vLLM, monitoring, and access control.',
    fullCaseStudy: '## Overview\nLiteLLM-inspired control plane for deploying models via vLLM.\n\n## Key Features\n- Model monitoring & request routing\n- API key issuance and access control\n- OpenAPI-compatible — drop-in replacement for OpenAI APIs\n- Enterprise LLM infrastructure focus',
    stack: ['Python', 'vLLM', 'LiteLLM', 'FastAPI', 'Docker'],
    domain: 'LLM_INFRA',
    orbitTier: 'A',
    complexity: 9,
    recency: 10,
    thumbnailUrl: '/placeholder.png',
    githubUrl: '',
    projectUrl: '',
    projectStatus: 'WIP',
    planetColor: 'sapphire',
    graphEdges: [{ slug: 'serenity-cli', relation: 'shared-llm-infra' }],
  },
  {
    title: 'Serenity CLI',
    slug: 'serenity-cli',
    shortDescription: 'Custom CLI backed by internal LLMs with auth and API key-based access control.',
    fullCaseStudy: '## Overview\nCLI tool backed by internally deployed LLMs.\n\n## Key Features\n- Integrated authentication & API key access\n- Org-wide AI access without exposing raw endpoints\n- Auditable AI consumption in private networks',
    stack: ['Python', 'LLM', 'CLI', 'Docker'],
    domain: 'AI_ML',
    orbitTier: 'B',
    complexity: 7,
    recency: 8,
    thumbnailUrl: '/placeholder.png',
    githubUrl: '',
    projectUrl: '',
    projectStatus: 'WIP',
    planetColor: 'cyan',
    graphEdges: [{ slug: 'azure-pavilion', relation: 'shared-llm-infra' }],
  },
  {
    title: 'CV-Search',
    slug: 'cv-search',
    shortDescription: 'LLM-based resume screening with vector DB storage and similarity re-ranking.',
    fullCaseStudy: '## Overview\nResume → text → vector DB → LLM similarity search → re-ranking.\n\n## Key Features\n- Vector database storage for efficient retrieval\n- LLM-based similarity search by skills & experience\n- Streamlines recruiter candidate selection',
    stack: ['Python', 'FastAPI', 'Vector DB', 'LLM', 'Transformers'],
    domain: 'AI_ML',
    orbitTier: 'B',
    complexity: 6,
    recency: 6,
    thumbnailUrl: '/placeholder.png',
    githubUrl: '',
    projectUrl: '',
    projectStatus: 'ARCHIVED',
    planetColor: 'gold',
    graphEdges: [{ slug: 'memoire', relation: 'shared-embedding' }],
  },
  {
    title: 'TxtToSQL',
    slug: 'txt-to-sql',
    shortDescription: 'Natural language to SQL converter with buffer-based context management.',
    fullCaseStudy: '## Overview\nNL → SQL via LLM tokenization with buffer-based context.\n\n## Key Features\n- NL query → SQL generation\n- Execution via SQLAlchemy with API output\n- Buffer system solving LLM memory limitations\n- Enables non-technical DB querying',
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'LLM', 'PostgreSQL'],
    domain: 'AI_ML',
    orbitTier: 'C',
    complexity: 5,
    recency: 5,
    thumbnailUrl: '/placeholder.png',
    githubUrl: '',
    projectUrl: '',
    projectStatus: 'ARCHIVED',
    planetColor: 'orange',
    graphEdges: [],
  },
];

const SKILLS = [
  {
    name: 'Languages',
    domain: 'BACKEND',
    proficiency: 8,
    tools: ['Python', 'C++'],
    relatedProjectSlugs: ['memoire', 'cv-search', 'txt-to-sql', 'serenity-cli'],
  },
  {
    name: 'Backend Development',
    domain: 'BACKEND',
    proficiency: 9,
    tools: ['FastAPI', 'REST APIs', 'SQL', 'SQLAlchemy'],
    relatedProjectSlugs: ['cv-search', 'txt-to-sql', 'azure-pavilion'],
  },
  {
    name: 'AI / Machine Learning',
    domain: 'AI_ML',
    proficiency: 9,
    tools: ['LLMs', 'RAG', 'Model Fine-Tuning', 'Evaluation & Testing'],
    relatedProjectSlugs: ['memoire', 'cv-search', 'serenity-cli'],
  },
  {
    name: 'LLM Infrastructure',
    domain: 'LLM_INFRA',
    proficiency: 9,
    tools: ['LiteLLM', 'vLLM', 'LLaMA.cpp', 'OpenWebUI'],
    relatedProjectSlugs: ['azure-pavilion', 'serenity-cli'],
  },
  {
    name: 'Agentic Systems',
    domain: 'AI_ML',
    proficiency: 8,
    tools: ['n8n', 'Tool Orchestration', 'Multi-step Reasoning'],
    relatedProjectSlugs: ['azure-pavilion', 'memoire'],
  },
  {
    name: 'Databases',
    domain: 'BACKEND',
    proficiency: 8,
    tools: ['Vector DBs', 'Graph DBs (Memgraph)', 'PostgreSQL', 'SQLite'],
    relatedProjectSlugs: ['memoire', 'cv-search', 'txt-to-sql'],
  },
  {
    name: 'Frontend Engineering',
    domain: 'FRONTEND',
    proficiency: 7,
    tools: ['Next.js', 'TypeScript', 'React'],
    relatedProjectSlugs: ['memoire'],
  },
  {
    name: 'DevOps & Deployment',
    domain: 'DEVOPS',
    proficiency: 8,
    tools: ['Docker', 'Local & On-Prem Deployment', 'Cloudflare Tunnel'],
    relatedProjectSlugs: ['azure-pavilion', 'memoire', 'serenity-cli'],
  },
  {
    name: 'Security',
    domain: 'DEVOPS',
    proficiency: 7,
    tools: ['Network Security', 'Security Frameworks'],
    relatedProjectSlugs: ['serenity-cli'],
  },
];

const BUILD_LOG = {
  currentProject: 'Azure Pavilion',
  currentStatus: 'Building LLM control plane with vLLM model deployment and API key management',
  lastSignal: new Date().toISOString(),
  openTo: ['Hire', 'Collaborate', 'Freelance'],
  githubActivity: 'Active — shipping AI tools and LLM infra',
};

const CONTACT_DETAIL = {
  title: 'Contact',
  intro: 'Open to full-time roles, collaboration, and freelance in AI/ML engineering. I build production AI systems — from agentic workflows to LLM infrastructure.',
  email: 'phadte4141@gmail.com',
  githubUrl: 'https://github.com/VOID-001',
  linkedinUrl: 'https://linkedin.com/in/mangesh-phadte',
  xUrl: '',
  location: 'Kumbharjua, Goa, India',
  availability: 'Available for remote and on-site roles',
};

// ─── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔐 Logging into Strapi admin...');
  const token = await getAdminToken();
  console.log('✓ Authenticated\n');

  const EXP_UID = 'api::experience.experience';
  const PROJ_UID = 'api::project.project';
  const SKILL_UID = 'api::skill.skill';
  const BUILD_UID = 'api::build-log.build-log';
  const CONTACT_UID = 'api::contact-detail.contact-detail';

  // ── 1. Delete all existing data ──
  console.log('🗑  Clearing existing data...');
  await deleteAllEntries(token, PROJ_UID);
  await deleteAllEntries(token, EXP_UID);
  await deleteAllEntries(token, SKILL_UID);
  console.log('');

  // ── 2. Seed Experiences ──
  console.log('📋 Seeding experiences...');
  for (const exp of EXPERIENCES) {
    await createAndPublish(token, EXP_UID, exp, exp.role);
  }
  console.log('');

  // ── 3. Seed Projects ──
  console.log('🚀 Seeding projects...');
  for (const proj of PROJECTS) {
    await createAndPublish(token, PROJ_UID, proj, proj.title);
  }
  console.log('');

  // ── 4. Seed Skills ──
  console.log('⚡ Seeding skills...');
  for (const skill of SKILLS) {
    await createAndPublish(token, SKILL_UID, skill, skill.name);
  }
  console.log('');

  // ── 5. Seed Build Log (single type) ──
  console.log('📡 Seeding build log...');
  await cmPutSingle(token, BUILD_UID, BUILD_LOG);
  console.log('');

  // ── 6. Seed Contact Detail (single type) ──
  console.log('📧 Seeding contact detail...');
  await cmPutSingle(token, CONTACT_UID, CONTACT_DETAIL);
  console.log('');

  console.log('═══════════════════════════════════════');
  console.log('✅ All CMS data seeded successfully!');
  console.log('═══════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
