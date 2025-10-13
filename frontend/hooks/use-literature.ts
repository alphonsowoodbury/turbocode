import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { literatureApi } from "@/lib/api/literature";
import type { LiteratureCreate, LiteratureUpdate } from "@/lib/types";

export function useLiterature(params?: {
  skip?: number;
  limit?: number;
  type?: string;
  is_read?: boolean;
  is_favorite?: boolean;
  is_archived?: boolean;
  source?: string;
}) {
  return useQuery({
    queryKey: ["literature", params],
    queryFn: () => literatureApi.list(params),
  });
}

export function useLiteratureItem(id: string | null) {
  return useQuery({
    queryKey: ["literature", id],
    queryFn: () => literatureApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateLiterature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: LiteratureCreate) => literatureApi.create(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}

export function useUpdateLiterature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LiteratureUpdate }) =>
      literatureApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}

export function useDeleteLiterature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => literatureApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}

export function useToggleLiteratureFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => literatureApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}

export function useMarkLiteratureRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => literatureApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}

export function useFetchArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => literatureApi.fetchArticle(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}

export function useFetchRssFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedUrl: string) => literatureApi.fetchRssFeed(feedUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}