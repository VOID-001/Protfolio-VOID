import VoidCanvas from '@/components/VoidCanvas';
import { getBuildLog, getProjects } from '@/lib/strapi';

export default async function HomePage() {
  const [projects, buildLog] = await Promise.all([getProjects(), getBuildLog()]);

  return <VoidCanvas projects={projects} buildLog={buildLog} />;
}
