import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { skillsApi } from "@/lib/api/skills";
import type { SkillCreate, SkillUpdate } from "@/lib/types";

export function useSkills(params?: {
  category?: string;
  proficiency_level?: string;
  is_endorsed?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["skills", params],
    queryFn: () => skillsApi.list(params),
  });
}

export function useSkill(id: string | null) {
  return useQuery({
    queryKey: ["skills", id],
    queryFn: () => skillsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skill: SkillCreate) => skillsApi.create(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SkillUpdate }) =>
      skillsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => skillsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}

export function useRecentSkills(params?: { limit?: number }) {
  return useQuery({
    queryKey: ["skills", "recent", params],
    queryFn: () => skillsApi.getRecent(params),
  });
}

export function useSearchSkills(query: string) {
  return useQuery({
    queryKey: ["skills", "search", query],
    queryFn: () => skillsApi.search(query),
    enabled: query.length > 0,
  });
}
