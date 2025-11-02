"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, TrendingUp, Clock, CheckCircle2, Target, PlayCircle, AlertCircle } from "lucide-react";
import { useJobPostings } from "@/hooks/use-job-postings";
import { useSearchCriteria, useSearchHistory } from "@/hooks/use-search-criteria";
import { JobPostingCard } from "@/components/job-search/job-posting-card";

export default function JobSearchPage() {
  const { postings, loading: postingsLoading, updateStatus } = useJobPostings({ limit: 50 });
  const { criteria, loading: criteriaLoading, executeSearch } = useSearchCriteria({ is_active: true });
  const { history, loading: historyLoading } = useSearchHistory();

  // Calculate stats
  const stats = useMemo(() => {
    const newJobs = postings.filter(p => p.status === "new").length;
    const interestedJobs = postings.filter(p => p.status === "interested").length;
    const highMatches = postings.filter(p => (p.match_score || 0) >= 80).length;

    // Get jobs discovered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayJobs = postings.filter(p => {
      const discovered = new Date(p.discovered_date);
      return discovered >= today;
    }).length;

    return {
      total: postings.length,
      newJobs,
      interestedJobs,
      highMatches,
      todayJobs,
    };
  }, [postings]);

  // Get recent search executions
  const recentSearches = useMemo(() => {
    return history
      .filter(h => h.status === "completed")
      .sort((a, b) => new Date(b.completed_at || b.started_at).getTime() - new Date(a.completed_at || a.started_at).getTime())
      .slice(0, 5);
  }, [history]);

  const handleStatusChange = async (jobId: string, status: string) => {
    try {
      await updateStatus(jobId, status);
    } catch (err) {
      console.error("Failed to update job status:", err);
    }
  };

  const handleExecuteSearch = async (criteriaId: string) => {
    try {
      await executeSearch(criteriaId);
    } catch (err) {
      console.error("Failed to execute search:", err);
    }
  };

  const loading = postingsLoading || criteriaLoading || historyLoading;

  return (
    <PageLayout title="Job Search">
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs Discovered</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayJobs} discovered today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Matches</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.newJobs}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Matches</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.highMatches}</div>
              <p className="text-xs text-muted-foreground">
                Score ≥ 80%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interested</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.interestedJobs}</div>
              <p className="text-xs text-muted-foreground">
                Marked for follow-up
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Criteria Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Search Criteria</CardTitle>
              <CardDescription>Automated searches running on your behalf</CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Search
            </Button>
          </CardHeader>
          <CardContent>
            {criteriaLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : criteria.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No active search criteria
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Create search criteria to start discovering jobs automatically
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {criteria.map((c) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{c.name}</CardTitle>
                        {c.auto_search_enabled && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Auto
                          </Badge>
                        )}
                      </div>
                      {c.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {c.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs text-muted-foreground space-y-1">
                        {c.job_titles && c.job_titles.length > 0 && (
                          <div>Titles: {c.job_titles.slice(0, 2).join(", ")}</div>
                        )}
                        {c.locations && c.locations.length > 0 && (
                          <div>Locations: {c.locations.slice(0, 2).join(", ")}</div>
                        )}
                        {c.salary_minimum && (
                          <div>Min Salary: ${(c.salary_minimum / 1000).toFixed(0)}k</div>
                        )}
                        {c.last_search_at && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Last run: {new Date(c.last_search_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleExecuteSearch(c.id)}
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Run Search
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Discovered Jobs Feed (2 columns) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Link href="/work/job-search/postings" className="hover:underline">
                  <CardTitle>Discovered Jobs</CardTitle>
                </Link>
                <CardDescription>
                  Latest matches from your search criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postingsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
                ) : postings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No jobs discovered yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Run a search to start discovering matching jobs
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {postings.slice(0, 10).map((job) => (
                      <JobPostingCard
                        key={job.id}
                        job={job}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                    {postings.length > 10 && (
                      <div className="text-center pt-4">
                        <Link href="/work/job-search/postings">
                          <Button variant="outline">View All {postings.length} Jobs</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search History (1 column) */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
                <CardDescription>
                  Search execution history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
                ) : recentSearches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No searches yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSearches.map((search) => (
                      <div key={search.id} className="border-b pb-3 last:border-0">
                        <div className="flex items-start justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {search.source}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(search.completed_at || search.started_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                          <div>
                            <div className="text-muted-foreground">Found</div>
                            <div className="font-semibold">{search.jobs_found}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Matched</div>
                            <div className="font-semibold">{search.jobs_matched}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">New</div>
                            <div className="font-semibold text-green-600">{search.jobs_new}</div>
                          </div>
                        </div>
                        {search.error_message && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            {search.error_message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
