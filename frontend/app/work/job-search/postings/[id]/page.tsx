"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Star,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { MatchScoreGauge } from "@/components/job-search/match-score-gauge";
import { type JobPosting } from "@/hooks/use-job-postings";

export default function JobPostingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [posting, setPosting] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestLevel, setInterestLevel] = useState<number>(0);
  const [interestNotes, setInterestNotes] = useState("");

  useEffect(() => {
    const fetchPosting = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/job-search/postings/${id}`);
        if (!response.ok) throw new Error("Failed to fetch job posting");
        const data = await response.json();
        setPosting(data);
        setInterestLevel(data.interest_level || 0);
        setInterestNotes(data.interest_notes || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPosting();
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!posting) return;
    try {
      const response = await fetch(`/api/v1/job-search/postings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      const updated = await response.json();
      setPosting(updated);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const saveInterest = async () => {
    if (!posting) return;
    try {
      const response = await fetch(`/api/v1/job-search/postings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interest_level: interestLevel || null,
          interest_notes: interestNotes || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to save interest");
      const updated = await response.json();
      setPosting(updated);
    } catch (err) {
      console.error("Error saving interest:", err);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    const formatNum = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
    if (min) return `${formatNum(min)}+`;
    return formatNum(max!);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500",
      interested: "bg-purple-500",
      not_interested: "bg-gray-500",
      applied: "bg-green-500",
      expired: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <PageLayout title="Job Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading job posting...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !posting) {
    return (
      <PageLayout title="Job Details">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || "Job not found"}</p>
          <Button onClick={() => router.push("/work/job-search")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Search
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={posting.job_title}>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/work/job-search")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Search
          </Button>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{posting.job_title}</h1>
              <div className="flex items-center gap-3 text-lg text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {posting.company_name}
                </div>
                {posting.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {posting.location}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(posting.status)} text-white`}>
                  {posting.status.replace(/_/g, " ")}
                </Badge>
                {posting.remote_policy && (
                  <Badge variant="outline">{posting.remote_policy}</Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Posted {formatDate(posting.posted_date)}
                </Badge>
              </div>
            </div>

            {/* Match Score */}
            {posting.match_score !== undefined && (
              <div className="ml-4">
                <MatchScoreGauge score={posting.match_score} size="lg" />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => updateStatus("interested")}
              disabled={posting.status === "interested"}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Mark as Interested
            </Button>
            <Button
              variant="outline"
              onClick={() => updateStatus("not_interested")}
              disabled={posting.status === "not_interested"}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Not Interested
            </Button>
            {posting.application_url && (
              <Button onClick={() => window.open(posting.application_url!, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Apply Direct
              </Button>
            )}
            <Button variant="outline" onClick={() => window.open(posting.source_url, "_blank")}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View on {posting.source}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                {posting.job_description ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {posting.job_description}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No description available</p>
                )}
              </CardContent>
            </Card>

            {/* Match Analysis */}
            {posting.match_reasons && (
              <Card>
                <CardHeader>
                  <CardTitle>Match Analysis</CardTitle>
                  <CardDescription>Why this job matched your search criteria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {posting.match_reasons.title_match && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Title Match</div>
                        <div className="text-sm text-muted-foreground">
                          Matched: "{posting.match_reasons.title_match}"
                        </div>
                      </div>
                    </div>
                  )}

                  {posting.match_reasons.matched_keywords &&
                    posting.match_reasons.matched_keywords.length > 0 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Keyword Matches</div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {posting.match_reasons.matched_keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="secondary">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {posting.match_reasons.remote_match && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Remote Policy Match</div>
                        <div className="text-sm text-muted-foreground">
                          Matches your remote work preferences
                        </div>
                      </div>
                    </div>
                  )}

                  {posting.match_reasons.salary_meets_minimum && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Salary Requirement Met</div>
                        <div className="text-sm text-muted-foreground">
                          Meets or exceeds your minimum salary requirement
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {(posting.required_skills?.length || posting.preferred_skills?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {posting.required_skills && posting.required_skills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {posting.required_skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="border-red-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {posting.preferred_skills && posting.preferred_skills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Preferred Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {posting.preferred_skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="border-blue-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar (1 column) */}
          <div className="space-y-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Salary</div>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4" />
                    {formatSalary(posting.salary_min, posting.salary_max)}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1">Posted Date</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(posting.posted_date)}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1">Discovered</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(posting.discovered_date)}
                  </div>
                </div>

                {posting.expires_date && (
                  <div>
                    <div className="text-muted-foreground mb-1">Expires</div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(posting.expires_date)}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-muted-foreground mb-1">Source</div>
                  <Badge variant="outline">{posting.source}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Interest Rating */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Your Interest</CardTitle>
                <CardDescription>Track how interested you are in this position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Interest Level (1-5)</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setInterestLevel(level)}
                        className="p-2 hover:bg-accent rounded"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            level <= interestLevel
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="interest-notes" className="mb-2 block">
                    Notes
                  </Label>
                  <Textarea
                    id="interest-notes"
                    placeholder="Add notes about your interest..."
                    value={interestNotes}
                    onChange={(e) => setInterestNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={saveInterest} className="w-full">
                  Save Interest Rating
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
