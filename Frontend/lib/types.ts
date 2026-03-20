export type Domain = 'AI_ML' | 'LLM_INFRA' | 'BACKEND' | 'FRONTEND' | 'DEVOPS' | 'RESEARCH';
export type OrbitTier = 'A' | 'B' | 'C';
export type ProjectStatus = 'LIVE' | 'WIP' | 'ARCHIVED';
export type ExperienceType = 'FULLTIME' | 'INTERNSHIP' | 'RESEARCH';

export interface GraphEdge {
  slug: string;
  relation: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  fullCaseStudy: string;
  stack: string[];
  domain: Domain;
  orbitTier: OrbitTier;
  complexity: number;
  recency: number;
  thumbnailUrl: string;
  videoLoopUrl?: string;
  githubUrl: string;
  projectUrl?: string;
  status: ProjectStatus;
  planetColor?: string;
  graphEdges: GraphEdge[];
}

export interface Skill {
  id: number;
  name: string;
  domain: Domain;
  proficiency: number;
  tools: string[];
  relatedProjectSlugs: string[];
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  highlights: string[];
  type: ExperienceType;
}

export interface BuildLog {
  currentProject: string;
  currentStatus: string;
  lastSignal: string;
  openTo: string[];
  githubActivity: string;
}

export interface ContactDetail {
  title: string;
  intro: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  xUrl: string;
  location: string;
  availability: string;
}

export interface StrapiData<T> {
  id: number;
  attributes: T;
}

export interface StrapiResponse<T> {
  data: StrapiData<T>[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: StrapiData<T>;
  meta: Record<string, unknown>;
}

export interface OrbitConfig {
  xRadius: number;
  yRadius: number;
  rotX: number;
  speed: number;
}

export type InteractionState = 'idle' | 'hovering' | 'selected';

