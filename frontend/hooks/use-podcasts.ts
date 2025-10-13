import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { podcastsApi } from "@/lib/api/podcasts";
import type {
  PodcastShowCreate,
  PodcastShowUpdate,
  PodcastEpisodeCreate,
  PodcastEpisodeUpdate,
} from "@/lib/types";

// Show hooks
export function usePodcastShows(params?: {
  is_subscribed?: boolean;
  is_favorite?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["podcast-shows", params],
    queryFn: () => podcastsApi.listShows(params),
  });
}

export function usePodcastShow(id: string | null) {
  return useQuery({
    queryKey: ["podcast-shows", id],
    queryFn: () => podcastsApi.getShow(id!),
    enabled: !!id,
  });
}

export function usePodcastShowWithEpisodes(
  id: string | null,
  params?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: ["podcast-shows", id, "with-episodes", params],
    queryFn: () => podcastsApi.getShowWithEpisodes(id!, params),
    enabled: !!id,
  });
}

export function useCreatePodcastShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (show: PodcastShowCreate) => podcastsApi.createShow(show),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useUpdatePodcastShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PodcastShowUpdate }) =>
      podcastsApi.updateShow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useDeletePodcastShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => podcastsApi.deleteShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useToggleShowFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => podcastsApi.toggleShowFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useToggleShowSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => podcastsApi.toggleShowSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

// Feed hooks
export function useSubscribeToFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedUrl: string) => podcastsApi.subscribeToFeed(feedUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useFetchEpisodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ showId, limit }: { showId: string; limit?: number }) =>
      podcastsApi.fetchEpisodes(showId, limit),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows", variables.showId] });
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
    },
  });
}

// Episode hooks
export function usePodcastEpisodes(params?: {
  show_id?: string;
  is_played?: boolean;
  is_favorite?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["podcast-episodes", params],
    queryFn: () => podcastsApi.listEpisodes(params),
    enabled: !!(params?.show_id || params?.is_played !== undefined || params?.is_favorite),
  });
}

export function useShowEpisodes(
  showId: string | null,
  params?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: ["podcast-shows", showId, "episodes", params],
    queryFn: () => podcastsApi.getShowEpisodes(showId!, params),
    enabled: !!showId,
  });
}

export function usePodcastEpisode(id: string | null) {
  return useQuery({
    queryKey: ["podcast-episodes", id],
    queryFn: () => podcastsApi.getEpisode(id!),
    enabled: !!id,
  });
}

export function useCreatePodcastEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (episode: PodcastEpisodeCreate) => podcastsApi.createEpisode(episode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useUpdatePodcastEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PodcastEpisodeUpdate }) =>
      podcastsApi.updateEpisode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useDeletePodcastEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => podcastsApi.deleteEpisode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useMarkEpisodePlayed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => podcastsApi.markEpisodePlayed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useToggleEpisodeFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => podcastsApi.toggleEpisodeFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
    },
  });
}

export function useUpdateEpisodeProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      playPosition,
      completed,
    }: {
      id: string;
      playPosition: number;
      completed?: boolean;
    }) => podcastsApi.updateEpisodeProgress(id, playPosition, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

// Transcription hooks
export function useTranscribeEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      options,
    }: {
      id: string;
      options?: {
        language?: string;
        beamSize?: number;
        force?: boolean;
        modelSize?: "tiny" | "base" | "small" | "medium" | "large";
      };
    }) => podcastsApi.transcribeEpisode(id, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useTranscribeBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      episodeIds,
      options,
    }: {
      episodeIds: string[];
      options?: {
        language?: string;
        beamSize?: number;
        force?: boolean;
        modelSize?: "tiny" | "base" | "small" | "medium" | "large";
      };
    }) => podcastsApi.transcribeBatch(episodeIds, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
    },
  });
}

export function useTranscriptionStats() {
  return useQuery({
    queryKey: ["transcription-stats"],
    queryFn: () => podcastsApi.getTranscriptionStats(),
  });
}