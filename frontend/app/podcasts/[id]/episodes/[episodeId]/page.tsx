"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { TranscriptViewer } from "@/components/podcasts/transcript-viewer";
import {
  usePodcastEpisode,
  usePodcastShow,
  useMarkEpisodePlayed,
  useToggleEpisodeFavorite,
  useUpdateEpisodeProgress,
  useTranscribeEpisode,
} from "@/hooks/use-podcasts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
  Star,
  CheckCircle,
  Circle,
  Play,
  Pause,
  ChevronLeft,
  Clock,
  FileText,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export default function PodcastEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const showId = params.id as string;
  const episodeId = params.episodeId as string;

  const { data: episode, isLoading: episodeLoading, error: episodeError } = usePodcastEpisode(episodeId);
  const { data: show } = usePodcastShow(showId);
  const markPlayed = useMarkEpisodePlayed();
  const toggleFavorite = useToggleEpisodeFavorite();
  const updateProgress = useUpdateEpisodeProgress();
  const transcribeEpisode = useTranscribeEpisode();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  // Initialize audio position from episode data
  useEffect(() => {
    if (episode && audioRef.current && episode.play_position > 0) {
      audioRef.current.currentTime = episode.play_position;
      setCurrentTime(episode.play_position);
    }
  }, [episode]);

  // Save progress every 10 seconds
  useEffect(() => {
    if (!isPlaying || !episode) return;

    const interval = setInterval(() => {
      if (audioRef.current) {
        const position = Math.floor(audioRef.current.currentTime);
        const completed = audioRef.current.ended || (duration > 0 && position >= duration - 5);

        updateProgress.mutate({
          id: episodeId,
          playPosition: position,
          completed,
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, episodeId, duration, episode, updateProgress]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleSeekToTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      // Resume playing if paused
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite.mutate(episodeId, {
      onSuccess: () => {
        toast.success(episode?.is_favorite ? "Removed from favorites" : "Added to favorites");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to toggle favorite");
      },
    });
  };

  const handleMarkPlayed = () => {
    markPlayed.mutate(episodeId, {
      onSuccess: () => {
        toast.success(episode?.is_played ? "Marked as unplayed" : "Marked as played");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to mark as played");
      },
    });
  };

  const handleTranscribe = () => {
    toast.info("Transcription started. This may take a few minutes...");
    transcribeEpisode.mutate(
      { id: episodeId, options: { modelSize: "base" } },
      {
        onSuccess: () => {
          toast.success("Episode transcribed successfully!");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Transcription failed");
        },
      }
    );
  };

  if (episodeLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (episodeError || !episode) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Episode Not Found" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Episode not found or failed to load</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push(`/podcasts/${showId}`)}>
              Back to Show
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title={episode.title} />

      <div className="flex-1 overflow-auto p-6">
        {/* Back to Show */}
        <div className="mb-4">
          <Link href={`/podcasts/${showId}`}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to {show?.title || "Show"}
            </Button>
          </Link>
        </div>

        {/* Episode Header */}
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-6">
                {episode.image_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={episode.image_url}
                      alt={episode.title}
                      className="w-48 h-48 rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-2">{episode.title}</h1>
                      {(episode.season_number || episode.episode_number) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {episode.season_number && `Season ${episode.season_number}`}
                          {episode.season_number && episode.episode_number && " • "}
                          {episode.episode_number && `Episode ${episode.episode_number}`}
                        </p>
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
                            episode.is_favorite && "fill-yellow-400 text-yellow-400"
                          )}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleMarkPlayed}
                        disabled={markPlayed.isPending}
                      >
                        {episode.is_played ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap mb-4">
                    {episode.published_at && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(episode.published_at), "MMM d, yyyy")}
                        <span className="text-xs">
                          ({formatDistanceToNow(new Date(episode.published_at))} ago)
                        </span>
                      </div>
                    )}
                    {episode.duration && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDuration(episode.duration)}
                      </div>
                    )}
                    {episode.explicit && (
                      <Badge variant="destructive">Explicit</Badge>
                    )}
                    {episode.transcript_generated && (
                      <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowTranscript(!showTranscript)}>
                        <FileText className="h-3 w-3 mr-1" />
                        Transcript Available
                      </Badge>
                    )}
                  </div>
                  {episode.description && (
                    <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                      {episode.description}
                    </p>
                  )}
                  {episode.website_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={episode.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Episode Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audio Player */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audio Player</CardTitle>
            </CardHeader>
            <CardContent>
              <audio
                ref={audioRef}
                src={episode.audio_url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                  setIsPlaying(false);
                  handleMarkPlayed();
                }}
              />
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatDuration(Math.floor(currentTime))}</span>
                    <span>{formatDuration(Math.floor(duration))}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handlePlayPause}
                    className="w-24"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress Info */}
                {episode.play_position > 0 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Last played: {formatDuration(episode.play_position)} / {formatDuration(episode.duration || 0)}
                    {episode.last_played_at && (
                      <span className="ml-2">
                        ({formatDistanceToNow(new Date(episode.last_played_at))} ago)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Description */}
        {episode.description && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Episode Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{episode.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transcription Actions */}
        {!episode.transcript_generated && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Transcript</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Use on-device Whisper AI to transcribe this episode. This runs locally on your machine.
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleTranscribe}
                  disabled={transcribeEpisode.isPending}
                  className="w-full"
                >
                  {transcribeEpisode.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Transcript (Local AI)
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Using base model. This may take several minutes depending on episode length.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interactive Transcript with Audio Sync */}
        {episode.transcript_generated && episode.transcript_data && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                {episode.transcript_generated_at && (
                  <p className="text-xs text-muted-foreground">
                    Generated {formatDistanceToNow(new Date(episode.transcript_generated_at))} ago
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTranscribe}
                  disabled={transcribeEpisode.isPending}
                >
                  {transcribeEpisode.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate Transcript"
                  )}
                </Button>
              </div>
            </div>
            <TranscriptViewer
              transcriptData={episode.transcript_data}
              currentTime={currentTime}
              onSeek={handleSeekToTime}
              autoScroll={true}
            />
          </div>
        )}

        {/* Fallback: Plain Text Transcript (for old transcripts without structured data) */}
        {episode.transcript_generated && episode.transcript && !episode.transcript_data && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Transcript</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTranscribe}
                      disabled={transcribeEpisode.isPending}
                    >
                      {transcribeEpisode.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Regenerate with Speaker Detection"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTranscript(!showTranscript)}
                    >
                      {showTranscript ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
                {episode.transcript_generated_at && (
                  <p className="text-xs text-muted-foreground">
                    Generated {formatDistanceToNow(new Date(episode.transcript_generated_at))} ago
                  </p>
                )}
              </CardHeader>
              {showTranscript && (
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap font-mono text-sm">{episode.transcript}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Metadata */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Episode Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">GUID</p>
                  <p className="font-mono text-xs break-all">{episode.guid}</p>
                </div>
                {episode.author && (
                  <div>
                    <p className="text-muted-foreground mb-1">Author</p>
                    <p>{episode.author}</p>
                  </div>
                )}
                {episode.categories && episode.categories.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground mb-1">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {episode.categories.map((category, index) => (
                        <Badge key={index} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground mb-1">Created</p>
                  <p>{format(new Date(episode.created_at), "PPpp")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Updated</p>
                  <p>{format(new Date(episode.updated_at), "PPpp")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}