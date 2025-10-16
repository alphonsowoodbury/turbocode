"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import {
  usePodcastShowWithEpisodes,
  useToggleShowFavorite,
  useToggleShowSubscription,
  useFetchEpisodes,
} from "@/hooks/use-podcasts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function PodcastShowPage() {
  const params = useParams();
  const router = useRouter();
  const showId = params.id as string;

  const { data: showData, isLoading, error } = usePodcastShowWithEpisodes(showId);
  const toggleFavorite = useToggleShowFavorite();
  const toggleSubscription = useToggleShowSubscription();
  const fetchEpisodes = useFetchEpisodes();

  const handleToggleFavorite = () => {
    toggleFavorite.mutate(showId, {
      onSuccess: () => {
        toast.success(showData?.is_favorite ? "Removed from favorites" : "Added to favorites");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to toggle favorite");
      },
    });
  };

  const handleFetchEpisodes = () => {
    fetchEpisodes.mutate(
      { showId, limit: 20 },
      {
        onSuccess: (episodes) => {
          toast.success(`Fetched ${episodes.length} new episodes`);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to fetch episodes");
        },
      }
    );
  };

  return (
    <PageLayout
      title={showData?.title || "Show Not Found"}
      isLoading={isLoading}
      error={error || (!showData ? new Error("Show not found or failed to load") : null)}
    >
      <div className="p-6">
        {/* Show Header */}
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-6">
                {showData.image_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={showData.image_url}
                      alt={showData.title}
                      className="w-48 h-48 rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{showData.title}</h1>
                      {showData.author && (
                        <p className="text-sm text-muted-foreground mb-2">by {showData.author}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleFavorite}
                        disabled={toggleFavorite.isPending}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            showData.is_favorite && "fill-yellow-400 text-yellow-400"
                          )}
                        />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFetchEpisodes}
                        disabled={fetchEpisodes.isPending}
                      >
                        {fetchEpisodes.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Fetch New Episodes
                      </Button>
                      {showData.website_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={showData.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  {showData.description && (
                    <p className="text-sm text-muted-foreground mb-4">{showData.description}</p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary">
                      {showData.total_episodes} episodes
                    </Badge>
                    {showData.listened_episodes > 0 && (
                      <Badge variant="secondary">
                        {showData.listened_episodes} played
                      </Badge>
                    )}
                    {showData.explicit && (
                      <Badge variant="destructive">Explicit</Badge>
                    )}
                    {showData.language && (
                      <Badge variant="outline">{showData.language}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Episodes List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Episodes ({showData.episodes.length})
          </h2>
          {showData.episodes.length > 0 ? (
            <div className="space-y-3">
              {showData.episodes.map((episode) => (
                <Link key={episode.id} href={`/podcasts/${showId}/episodes/${episode.id}`}>
                  <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {episode.image_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={episode.image_url}
                              alt={episode.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold line-clamp-2">{episode.title}</h3>
                            <div className="flex gap-2 flex-shrink-0">
                              {episode.is_played && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {episode.is_favorite && (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                          </div>
                          {(episode.season_number || episode.episode_number) && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {episode.season_number && `S${episode.season_number}`}
                              {episode.episode_number && `E${episode.episode_number}`}
                            </p>
                          )}
                          {episode.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {episode.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {episode.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(episode.duration)}
                              </div>
                            )}
                            {episode.published_at && (
                              <span>
                                {formatDistanceToNow(new Date(episode.published_at))} ago
                              </span>
                            )}
                            {episode.transcript_generated && (
                              <Badge variant="secondary" className="text-xs">
                                Transcript
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  No episodes yet. Fetch episodes from the feed.
                </p>
                <Button onClick={handleFetchEpisodes} disabled={fetchEpisodes.isPending}>
                  {fetchEpisodes.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Fetch Episodes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}