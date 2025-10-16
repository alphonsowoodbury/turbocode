"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { useLiterature } from "@/hooks/use-literature";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Filter, X, BookOpen, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Literature } from "@/lib/types";

const typeColors = {
  article: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  book: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  paper: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  video: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  podcast: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  course: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
};

export default function LiteraturePage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedReadStatus, setSelectedReadStatus] = useState<string>("all");
  const [selectedFavoriteStatus, setSelectedFavoriteStatus] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<string>("none");
  const [sortBy, setSortBy] = useState<string>("updated");
  const { data: literature, isLoading, error } = useLiterature();

  // Apply filters
  const filteredLiterature = useMemo(() => {
    if (!literature) return [];

    let filtered = literature;

    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    if (selectedReadStatus === "read") {
      filtered = filtered.filter((item) => item.is_read);
    } else if (selectedReadStatus === "unread") {
      filtered = filtered.filter((item) => !item.is_read);
    }

    if (selectedFavoriteStatus === "favorite") {
      filtered = filtered.filter((item) => item.is_favorite);
    } else if (selectedFavoriteStatus === "not_favorite") {
      filtered = filtered.filter((item) => !item.is_favorite);
    }

    return filtered;
  }, [literature, selectedType, selectedReadStatus, selectedFavoriteStatus]);

  // Sort literature
  const sortedLiterature = useMemo(() => {
    const sorted = [...filteredLiterature];

    switch (sortBy) {
      case "updated":
        return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      case "created":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "type":
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
      default:
        return sorted;
    }
  }, [filteredLiterature, sortBy]);

  // Group literature
  const groupedLiterature = useMemo(() => {
    if (groupBy === "none") {
      return { "All Items": sortedLiterature };
    }

    const groups: Record<string, Literature[]> = {};

    sortedLiterature.forEach((item) => {
      let key = "";

      if (groupBy === "type") {
        key = item.type;
      } else if (groupBy === "source") {
        key = item.source || "Unknown Source";
      } else if (groupBy === "read_status") {
        key = item.is_read ? "Read" : "Unread";
      } else if (groupBy === "author") {
        key = item.author || "Unknown Author";
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return groups;
  }, [sortedLiterature, groupBy]);

  const hasActiveFilters = selectedType !== "all" || selectedReadStatus !== "all" || selectedFavoriteStatus !== "all";

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedReadStatus("all");
    setSelectedFavoriteStatus("all");
  };

  return (
    <PageLayout title="Literature" isLoading={isLoading} error={error}>
      <div className="p-6">
        {/* Controls Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Literature
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                  {[selectedType !== "all", selectedReadStatus !== "all", selectedFavoriteStatus !== "all"].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Group:</span>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="read_status">Read Status</SelectItem>
                <SelectItem value="author">Author</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="paper">Paper</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Read Status</label>
                  <Select value={selectedReadStatus} onValueChange={setSelectedReadStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Favorite</label>
                  <Select value={selectedFavoriteStatus} onValueChange={setSelectedFavoriteStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="favorite">Favorites</SelectItem>
                      <SelectItem value="not_favorite">Not Favorite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredLiterature.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedLiterature).map(([groupName, groupItems]) => (
              <div key={groupName}>
                {groupBy !== "none" && (
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground capitalize">
                    {groupName} ({groupItems.length})
                  </h3>
                )}
                <div className="space-y-3">
                  {groupItems.map((item) => (
                    <Link key={item.id} href={`/literature/${item.id}`}>
                      <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{item.title}</h3>
                                {item.is_favorite && (
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                )}
                                {item.is_read && (
                                  <BookOpen className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              {item.author && (
                                <p className="text-sm text-muted-foreground">by {item.author}</p>
                              )}
                              {item.url && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <ExternalLink className="h-3 w-3" />
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary truncate"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {item.url}
                                  </a>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  Updated {formatDistanceToNow(new Date(item.updated_at))} ago
                                </span>
                                {item.source && (
                                  <>
                                    <span>•</span>
                                    <span>{item.source}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs capitalize",
                                  typeColors[item.type as keyof typeof typeColors]
                                )}
                              >
                                {item.type}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {literature && literature.length > 0
                  ? "No items match the current filters."
                  : "No literature found. Add some to get started!"}
              </p>
              {hasActiveFilters && literature && literature.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}