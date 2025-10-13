import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/lib/api/comments";
import type { CommentCreate, CommentUpdate } from "@/lib/types";

export function useComments(issueId: string | null) {
  return useQuery({
    queryKey: ["comments", issueId],
    queryFn: () => commentsApi.listByIssue(issueId!),
    enabled: !!issueId,
  });
}

export function useComment(id: string | null) {
  return useQuery({
    queryKey: ["comments", id],
    queryFn: () => commentsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: CommentCreate) => commentsApi.create(comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["comments", data.issue_id] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommentUpdate }) =>
      commentsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["comments", data.issue_id] });
      queryClient.invalidateQueries({ queryKey: ["comments", data.id] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, issueId }: { id: string; issueId: string }) =>
      commentsApi.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.issueId] });
    },
  });
}
