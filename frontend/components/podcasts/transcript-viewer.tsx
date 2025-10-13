"use client";

import { useEffect, useRef, useState } from "react";
import { TranscriptData, TranscriptSegment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptViewerProps {
  transcriptData: TranscriptData;
  currentTime: number;
  onSeek: (time: number) => void;
  autoScroll?: boolean;
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function getSpeakerColor(speakerId: string): string {
  // Generate consistent colors for speakers
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-300",
    "bg-green-100 text-green-800 border-green-300",
    "bg-purple-100 text-purple-800 border-purple-300",
    "bg-orange-100 text-orange-800 border-orange-300",
    "bg-pink-100 text-pink-800 border-pink-300",
    "bg-teal-100 text-teal-800 border-teal-300",
  ];

  // Simple hash to get consistent color for each speaker
  let hash = 0;
  for (let i = 0; i < speakerId.length; i++) {
    hash = speakerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function TranscriptViewer({
  transcriptData,
  currentTime,
  onSeek,
  autoScroll = true,
}: TranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Find current active segment based on audio time
  useEffect(() => {
    const activeIndex = transcriptData.segments.findIndex(
      (segment) => currentTime >= segment.start && currentTime < segment.end
    );
    setActiveSegmentIndex(activeIndex >= 0 ? activeIndex : null);
  }, [currentTime, transcriptData.segments]);

  // Auto-scroll to active segment
  useEffect(() => {
    if (autoScroll && activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSegmentRef.current;

      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Check if element is outside visible area
      if (
        elementRect.top < containerRect.top ||
        elementRect.bottom > containerRect.bottom
      ) {
        // Scroll to center the active segment
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeSegmentIndex, autoScroll]);

  // Group consecutive segments by speaker for better readability
  const groupedSegments: Array<{
    speaker: string | null | undefined;
    segments: TranscriptSegment[];
    startTime: number;
    endTime: number;
  }> = [];

  let currentGroup: TranscriptSegment[] = [];
  let currentSpeaker: string | null | undefined = null;

  transcriptData.segments.forEach((segment, index) => {
    if (segment.speaker !== currentSpeaker && currentGroup.length > 0) {
      // Start new group
      groupedSegments.push({
        speaker: currentSpeaker,
        segments: currentGroup,
        startTime: currentGroup[0].start,
        endTime: currentGroup[currentGroup.length - 1].end,
      });
      currentGroup = [segment];
      currentSpeaker = segment.speaker;
    } else {
      // Add to current group
      currentGroup.push(segment);
      currentSpeaker = segment.speaker;
    }
  });

  // Add final group
  if (currentGroup.length > 0) {
    groupedSegments.push({
      speaker: currentSpeaker,
      segments: currentGroup,
      startTime: currentGroup[0].start,
      endTime: currentGroup[currentGroup.length - 1].end,
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Interactive Transcript</CardTitle>
          <div className="flex gap-2 text-xs text-muted-foreground">
            {Object.keys(transcriptData.speakers).length > 0 && (
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                {Object.keys(transcriptData.speakers).length} speakers
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatTimestamp(transcriptData.duration)}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Click any segment to jump to that part of the audio
        </p>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="space-y-4 max-h-[600px] overflow-y-auto pr-4"
        >
          {groupedSegments.map((group, groupIndex) => {
            const isActive = group.segments.some((_, segIndex) => {
              const globalIndex = transcriptData.segments.findIndex(
                (s) => s === group.segments[segIndex]
              );
              return globalIndex === activeSegmentIndex;
            });

            const speakerLabel = group.speaker
              ? transcriptData.speakers[group.speaker] || "Unknown Speaker"
              : null;

            const speakerColor = group.speaker
              ? getSpeakerColor(group.speaker)
              : "bg-gray-100 text-gray-800 border-gray-300";

            return (
              <div
                key={groupIndex}
                ref={isActive ? activeSegmentRef : null}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50",
                  isActive
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:bg-accent/50"
                )}
                onClick={() => onSeek(group.startTime)}
              >
                <div className="flex items-start gap-3">
                  {speakerLabel && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex-shrink-0 font-medium border-2",
                        speakerColor
                      )}
                    >
                      {speakerLabel}
                    </Badge>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSeek(group.startTime);
                        }}
                        className="text-xs text-muted-foreground hover:text-primary font-mono"
                      >
                        {formatTimestamp(group.startTime)}
                      </button>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTimestamp(group.endTime)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        isActive && "font-medium"
                      )}
                    >
                      {group.segments.map((seg) => seg.text).join(" ")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
