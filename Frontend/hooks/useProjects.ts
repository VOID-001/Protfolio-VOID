'use client';

import useSWR from 'swr';
import type { Project } from '@/lib/types';

const fetcher = async (url: string): Promise<Project[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
};

export function useProjects(initialData?: Project[]) {
  const { data, error, isLoading } = useSWR<Project[]>(
    '/api/projects',
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    projects: data ?? initialData ?? [],
    isLoading,
    isError: !!error,
  };
}
