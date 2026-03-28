import type {
  BuildLog,
  ContactDetail,
  Experience,
  Project,
  Skill,
} from './types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '';

async function strapiFetch<T>(endpoint: string): Promise<T | null> {
  console.log(`[Strapi] Fetching ${endpoint} ...`);
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (STRAPI_TOKEN) {
      headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
    }

    const res = await fetch(`${STRAPI_URL}/api${endpoint}`, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[Strapi] Fetch failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    console.log(`[Strapi] Fetch success: ${endpoint}`);
    return data as T;
  } catch (err) {
    console.error(`[Strapi] Fetch error: ${endpoint}`, err);
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
    currentProject: (attrs.currentProject as string) ?? '',
    currentStatus: (attrs.currentStatus as string) ?? '',
    lastSignal: (attrs.lastSignal as string) ?? new Date().toISOString(),
    openTo: asStringArray(attrs.openTo),
    githubActivity: (attrs.githubActivity as string) ?? '',
  };
}

function mapContactDetail(raw: unknown): ContactDetail {
  const attrs = unwrapEntity<Record<string, unknown>>(raw);

  return {
    title: (attrs.title as string) ?? '',
    intro: (attrs.intro as string) ?? '',
    email: (attrs.email as string) ?? '',
    githubUrl: (attrs.githubUrl as string) ?? '',
    linkedinUrl: (attrs.linkedinUrl as string) ?? '',
    xUrl: (attrs.xUrl as string) ?? '',
    location: (attrs.location as string) ?? '',
    availability: (attrs.availability as string) ?? '',
  };
}

export async function getProjects(): Promise<Project[]> {
  const response = await strapiFetch<{ data?: unknown[] }>(
    '/projects?sort=recency:desc&populate=*'
  );

  if (Array.isArray(response?.data) && response.data.length > 0) {
    return response.data.map(mapStrapiProject);
  }

  return [];
}

export async function getSkills(): Promise<Skill[]> {
  const response = await strapiFetch<{ data?: unknown[] }>('/skills?sort=proficiency:desc&populate=*');

  if (Array.isArray(response?.data) && response.data.length > 0) {
    return response.data.map(mapStrapiSkill);
  }

  return [];
}

export async function getExperiences(): Promise<Experience[]> {
  const response = await strapiFetch<{ data?: unknown[] }>('/experiences?sort=startDate:desc&populate=*');

  if (Array.isArray(response?.data) && response.data.length > 0) {
    return response.data.map(mapStrapiExperience);
  }

  return [];
}

export async function getBuildLog(): Promise<BuildLog> {
  const response = await strapiFetch<{ data?: unknown }>('/build-log?populate=*');

  if (response?.data) {
    return mapBuildLog(response.data);
  }

  return {
    currentProject: '',
    currentStatus: '',
    lastSignal: new Date().toISOString(),
    openTo: [],
    githubActivity: '',
  };
}

export async function getContactDetail(): Promise<ContactDetail> {
  const response = await strapiFetch<{ data?: unknown }>('/contact-detail?populate=*');

  if (response?.data) {
    return mapContactDetail(response.data);
  }

  return {
    title: '',
    intro: '',
    email: '',
    githubUrl: '',
    linkedinUrl: '',
    xUrl: '',
    location: '',
    availability: '',
  };
}
