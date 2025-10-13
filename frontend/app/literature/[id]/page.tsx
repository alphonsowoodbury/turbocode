"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  useLiteratureItem,
  useDeleteLiterature,
  useUpdateLiterature,
  useToggleLiteratureFavorite,
  useMarkLiteratureRead,
} from "@/hooks/use-literature";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Pencil,
  Star,
  BookOpen,
  ExternalLink,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const typeColors = {
  article: "bg-blue-500/10 text-blue-500",
  book: "bg-purple-500/10 text-purple-500",
  paper: "bg-green-500/10 text-green-500",
  video: "bg-red-500/10 text-red-500",
  podcast: "bg-orange-500/10 text-orange-500",
  course: "bg-cyan-500/10 text-cyan-500",
};

export default function LiteratureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const literatureId = params.id as string;

  const { data: item, isLoading, error } = useLiteratureItem(literatureId);
  const deleteLiterature = useDeleteLiterature();
  const updateLiterature = useUpdateLiterature();
  const toggleFavorite = useToggleLiteratureFavorite();
  const markRead = useMarkLiteratureRead();

  const handleToggleFavorite = () => {
    toggleFavorite.mutate(literatureId, {
      onSuccess: () => {
        toast.success(item?.is_favorite ? "Removed from favorites" : "Added to favorites");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to toggle favorite");
      },
    });
  };

  const handleMarkRead = () => {
    markRead.mutate(literatureId, {
      onSuccess: () => {
        toast.success(item?.is_read ? "Marked as unread" : "Marked as read");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to mark as read");
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteLiterature.mutate(literatureId, {
        onSuccess: () => {
          toast.success("Literature item deleted");
          router.push("/literature");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to delete item");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Item Not Found" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Literature item not found or failed to load</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/literature")}>
              Back to Literature
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tags = item.tags?.split(",").map((t) => t.trim()).filter(Boolean) || [];

  return (
    <div className="flex h-full flex-col">
      <Header title={item.title} />

      <div className="flex-1 space-y-4 p-6">
        {/* Item Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={toggleFavorite.isPending}
            className="h-4 w-4 p-0 hover:bg-muted"
          >
            <Star className={cn("h-2.5 w-2.5", item.is_favorite && "fill-yellow-400 text-yellow-400")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkRead}
            disabled={markRead.isPending}
            className="h-4 w-4 p-0 hover:bg-muted"
          >
            <BookOpen className={cn("h-2.5 w-2.5", item.is_read && "text-green-500")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteLiterature.isPending}
            className="h-4 w-4 p-0 hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
          <span className="text-xs text-muted-foreground">•</span>
          <Badge variant="secondary" className={cn("h-4 text-[10px] leading-none capitalize px-1.5 py-0", typeColors[item.type as keyof typeof typeColors])}>
            {item.type}
          </Badge>
          {item.is_read && (
            <Badge variant="outline" className="h-4 text-[10px] leading-none px-1.5 py-0 text-green-500">
              Read
            </Badge>
          )}
          {item.author && (
            <Badge variant="outline" className="h-4 text-[10px] leading-none px-1.5 py-0">
              {item.author}
            </Badge>
          )}
          {item.source && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{item.source}</span>
            </>
          )}
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(item.created_at))} ago
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(item.updated_at))} ago
          </span>
        </div>

        <Separator />

        {/* URL */}
        {item.url && (
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {item.url}
            </a>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* Content */}
        {item.content && (
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={item.content} />
            </CardContent>
          </Card>
        )}

        {!item.content && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                No content available for this item.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        {item.progress !== undefined && item.progress !== null && (
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{item.progress}%</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}