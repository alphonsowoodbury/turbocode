"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { usePodcastShows, useSubscribeToFeed } from "@/hooks/use-podcasts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Podcast, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function PodcastsPage() {
  const [feedUrl, setFeedUrl] = useState("");
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const { data: shows, isLoading, error } = usePodcastShows({ is_subscribed: true });
  const subscribeToFeed = useSubscribeToFeed();

  const handleSubscribe = async () => {
    if (!feedUrl.trim()) {
      toast.error("Please enter a feed URL");
      return;
    }

    subscribeToFeed.mutate(feedUrl, {
      onSuccess: (show) => {
        toast.success(`Subscribed to ${show.title}`);
        setFeedUrl("");
        setShowSubscribeForm(false);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to subscribe");
      },
    });
  };

  return (
    <PageLayout title="Podcasts" isLoading={isLoading} error={error}>
      <div className="p-6">
        {/* Controls Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!showSubscribeForm ? (
              <Button onClick={() => setShowSubscribeForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Subscribe to Podcast
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter RSS feed URL..."
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubscribe();
                    }
                  }}
                  className="w-96"
                />
                <Button onClick={handleSubscribe} disabled={subscribeToFeed.isPending}>
                  {subscribeToFeed.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Subscribe"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowSubscribeForm(false);
                    setFeedUrl("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {shows?.length || 0} {shows?.length === 1 ? "show" : "shows"}
          </div>
        </div>

        {shows && shows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shows.map((show) => (
              <Link key={show.id} href={`/podcasts/${show.id}`}>
                <Card className="hover:border-primary/50 cursor-pointer transition-colors h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {show.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={show.image_url}
                            alt={show.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold line-clamp-2">{show.title}</h3>
                          {show.is_favorite && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          )}
                        </div>
                        {show.author && (
                          <p className="text-xs text-muted-foreground mb-2">by {show.author}</p>
                        )}
                        {show.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {show.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            <Podcast className="h-3 w-3 mr-1" />
                            {show.total_episodes} episodes
                          </Badge>
                          {show.listened_episodes > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {show.listened_episodes} played
                            </Badge>
                          )}
                          {show.explicit && (
                            <Badge variant="destructive" className="text-xs">
                              Explicit
                            </Badge>
                          )}
                        </div>
                        {show.last_fetched_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Updated {formatDistanceToNow(new Date(show.last_fetched_at))} ago
                          </p>
                        )}
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
              <Podcast className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No podcasts yet. Subscribe to a podcast to get started!
              </p>
              {!showSubscribeForm && (
                <Button className="mt-4" onClick={() => setShowSubscribeForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Subscribe to Podcast
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}