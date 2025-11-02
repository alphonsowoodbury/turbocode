"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { useJobPostings } from "@/hooks/use-job-postings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, X, ExternalLink, Building2, MapPin, DollarSign, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors = {
  new: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  viewed: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  applied: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  interview: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  offer: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
};

const interestColors = {
  0: "bg-gray-500/10 text-gray-500",
  1: "bg-red-500/10 text-red-500",
  2: "bg-orange-500/10 text-orange-500",
  3: "bg-yellow-500/10 text-yellow-500",
  4: "bg-blue-500/10 text-blue-500",
  5: "bg-green-500/10 text-green-500",
};

const remotePolicyLabels = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  unknown: "Not specified",
};

export default function JobPostingsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedInterest, setSelectedInterest] = useState<string>("all");
  const [selectedRemotePolicy, setSelectedRemotePolicy] = useState<string>("all");
  const [minScore, setMinScore] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<string>("none");
  const [sortBy, setSortBy] = useState<string>("discovered");

  const { postings, loading: isLoading, error } = useJobPostings();

  // Get unique sources from postings
  const sources = useMemo(() => {
    if (!postings) return [];
    const uniqueSources = [...new Set(postings.map((p) => p.source))];
    return uniqueSources.sort();
  }, [postings]);

  // Apply filters
  const filteredPostings = useMemo(() => {
    if (!postings) return [];

    let filtered = postings;

    if (selectedSource !== "all") {
      filtered = filtered.filter((p) => p.source === selectedSource);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    if (selectedInterest !== "all") {
      filtered = filtered.filter((p) => {
        const interest = p.interest_level ?? 0;
        return interest.toString() === selectedInterest;
      });
    }

    if (selectedRemotePolicy !== "all") {
      filtered = filtered.filter((p) => p.remote_policy === selectedRemotePolicy);
    }

    if (minScore !== "all") {
      const scoreThreshold = parseInt(minScore);
      filtered = filtered.filter((p) => (p.match_score ?? 0) >= scoreThreshold);
    }

    return filtered;
  }, [postings, selectedSource, selectedStatus, selectedInterest, selectedRemotePolicy, minScore]);

  // Sort postings
  const sortedPostings = useMemo(() => {
    const sorted = [...filteredPostings];

    switch (sortBy) {
      case "discovered":
        return sorted.sort((a, b) => new Date(b.discovered_date).getTime() - new Date(a.discovered_date).getTime());
      case "posted":
        return sorted.sort((a, b) => {
          if (!a.posted_date) return 1;
          if (!b.posted_date) return -1;
          return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
        });
      case "score":
        return sorted.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
      case "company":
        return sorted.sort((a, b) => a.company_name.localeCompare(b.company_name));
      case "title":
        return sorted.sort((a, b) => a.job_title.localeCompare(b.job_title));
      case "salary":
        return sorted.sort((a, b) => (b.salary_max ?? 0) - (a.salary_max ?? 0));
      default:
        return sorted;
    }
  }, [filteredPostings, sortBy]);

  // Group postings
  const groupedPostings = useMemo(() => {
    if (groupBy === "none") {
      return { "All Jobs": sortedPostings };
    }

    const groups: Record<string, typeof sortedPostings> = {};

    sortedPostings.forEach((posting) => {
      let key = "";

      if (groupBy === "source") {
        key = posting.source.charAt(0).toUpperCase() + posting.source.slice(1);
      } else if (groupBy === "status") {
        key = posting.status.charAt(0).toUpperCase() + posting.status.slice(1);
      } else if (groupBy === "remote") {
        key = remotePolicyLabels[posting.remote_policy as keyof typeof remotePolicyLabels] || "Unknown";
      } else if (groupBy === "company") {
        key = posting.company_name;
      } else if (groupBy === "score") {
        const score = posting.match_score ?? 0;
        if (score >= 90) key = "Excellent Match (90+)";
        else if (score >= 75) key = "Good Match (75-89)";
        else if (score >= 60) key = "Moderate Match (60-74)";
        else key = "Low Match (<60)";
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(posting);
    });

    return groups;
  }, [sortedPostings, groupBy]);

  const hasActiveFilters =
    selectedSource !== "all" ||
    selectedStatus !== "all" ||
    selectedInterest !== "all" ||
    selectedRemotePolicy !== "all" ||
    minScore !== "all";

  const clearFilters = () => {
    setSelectedSource("all");
    setSelectedStatus("all");
    setSelectedInterest("all");
    setSelectedRemotePolicy("all");
    setMinScore("all");
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return null;

    const format = (val: number) => {
      if (val >= 1000) {
        return `${Math.round(val / 1000)}k`;
      }
      return val.toString();
    };

    if (min && max) {
      return `${currency} ${format(min)} - ${format(max)}`;
    } else if (min) {
      return `${currency} ${format(min)}+`;
    } else {
      return `${currency} up to ${format(max!)}`;
    }
  };

  return (
    <PageLayout
      title="Discovered Jobs"
      description={`${sortedPostings.length} job${sortedPostings.length !== 1 ? 's' : ''} found`}
      isLoading={isLoading}
      error={error}
    >
      <div className="p-6">
        {/* Controls Bar */}
        <div className="mb-4 flex items-center justify-between">
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
                  {[
                    selectedSource !== "all",
                    selectedStatus !== "all",
                    selectedInterest !== "all",
                    selectedRemotePolicy !== "all",
                    minScore !== "all",
                  ].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discovered">Discovered</SelectItem>
                <SelectItem value="posted">Posted Date</SelectItem>
                <SelectItem value="score">Match Score</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Group:</span>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="remote">Remote Policy</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="score">Match Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source</label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {sources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source.charAt(0).toUpperCase() + source.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="viewed">Viewed</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Interest Level</label>
                  <Select value={selectedInterest} onValueChange={setSelectedInterest}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ Very High</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ High</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ Medium</SelectItem>
                      <SelectItem value="2">⭐⭐ Low</SelectItem>
                      <SelectItem value="1">⭐ Very Low</SelectItem>
                      <SelectItem value="0">Not Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Remote Policy</label>
                  <Select value={selectedRemotePolicy} onValueChange={setSelectedRemotePolicy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Policies</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="unknown">Not specified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Match Score</label>
                  <Select value={minScore} onValueChange={setMinScore}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="90">90+ (Excellent)</SelectItem>
                      <SelectItem value="75">75+ (Good)</SelectItem>
                      <SelectItem value="60">60+ (Moderate)</SelectItem>
                      <SelectItem value="50">50+ (Fair)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Postings */}
        <div className="space-y-6">
          {Object.entries(groupedPostings).map(([groupName, groupPostings]) => (
            <div key={groupName}>
              {groupBy !== "none" && (
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {groupName}
                  <Badge variant="secondary">{groupPostings.length}</Badge>
                </h2>
              )}

              <div className="space-y-3">
                {groupPostings.map((posting) => {
                  const salary = formatSalary(posting.salary_min, posting.salary_max, posting.salary_currency);
                  const interestLevel = posting.interest_level ?? 0;

                  return (
                    <Link href={`/work/job-search/postings/${posting.id}`} key={posting.id}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Job Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base mb-1 truncate">
                                  {posting.job_title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">{posting.company_name}</span>
                                  {posting.location && (
                                    <>
                                      <span>•</span>
                                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                      <span className="truncate">{posting.location}</span>
                                    </>
                                  )}
                                  {salary && (
                                    <>
                                      <span>•</span>
                                      <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
                                      <span>{salary}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Skills/Tags */}
                            {posting.required_skills && posting.required_skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {posting.required_skills.slice(0, 5).map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {posting.required_skills.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{posting.required_skills.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Meta Info */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {posting.source.charAt(0).toUpperCase() + posting.source.slice(1)}
                              </Badge>
                              <span>•</span>
                              <Calendar className="h-3 w-3" />
                              <span>Discovered {formatDistanceToNow(new Date(posting.discovered_date), { addSuffix: true })}</span>
                              {posting.posted_date && (
                                <>
                                  <span>•</span>
                                  <span>Posted {formatDistanceToNow(new Date(posting.posted_date), { addSuffix: true })}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Right: Status & Actions */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn("text-xs", statusColors[posting.status as keyof typeof statusColors])}
                              >
                                {posting.status.charAt(0).toUpperCase() + posting.status.slice(1)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn("text-xs font-medium", remotePolicyLabels[posting.remote_policy as keyof typeof remotePolicyLabels] ? "" : "opacity-50")}
                              >
                                {remotePolicyLabels[posting.remote_policy as keyof typeof remotePolicyLabels] || posting.remote_policy}
                              </Badge>
                            </div>

                            {/* Match Score */}
                            {posting.match_score !== null && (
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                  {Math.round(posting.match_score)}% match
                                </span>
                              </div>
                            )}

                            {/* Interest Level */}
                            {interestLevel > 0 && (
                              <div className={cn(
                                "px-2 py-0.5 rounded text-xs font-medium",
                                interestColors[interestLevel as keyof typeof interestColors]
                              )}>
                                {"⭐".repeat(interestLevel)}
                              </div>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(posting.source_url, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedPostings.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more results"
                  : "Run a job search to discover opportunities matching your criteria"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
