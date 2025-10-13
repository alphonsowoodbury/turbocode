"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Bot, MoreVertical, Pencil, Trash2, User } from "lucide-react";
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from "@/hooks/use-comments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Comment } from "@/lib/types";

interface CommentListProps {
  issueId: string;
}

export function CommentList({ issueId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(issueId);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createComment.mutate(
      {
        issue_id: issueId,
        content: newComment.trim(),
        author_name: "Current User", // TODO: Get from auth
        author_type: "user",
      },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment added");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to add comment");
        },
      }
    );
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdate = (commentId: string) => {
    if (!editContent.trim()) return;

    updateComment.mutate(
      {
        id: commentId,
        data: { content: editContent.trim() },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditContent("");
          toast.success("Comment updated");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to update comment");
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    deleteComment.mutate(
      { id: commentId, issueId },
      {
        onSuccess: () => {
          toast.success("Comment deleted");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to delete comment");
        },
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Comment List */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={cn(
                        comment.author_type === "ai"
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {comment.author_type === "ai" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        getInitials(comment.author_name)
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.author_name}</span>
                        {comment.author_type === "ai" && (
                          <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-500">
                            AI
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at))} ago
                        </span>
                      </div>

                      {comment.author_type === "user" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(comment)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(comment.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdate(comment.id)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditContent("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <MarkdownRenderer content={comment.content} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {/* New Comment Form */}
      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!newComment.trim() || createComment.isPending}>
                {createComment.isPending ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
