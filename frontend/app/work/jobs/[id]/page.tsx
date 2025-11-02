"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Calendar, MapPin, DollarSign, Award, TrendingUp, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  fact_text: string;
  metric_type: string;
  metric_value: number;
  metric_unit: string;
  dimensions: string[];
  leadership_principles: string[];
  skills_used: string[];
  context: string;
  impact: string;
  display_order: number;
}

interface WorkExperience {
  id: string;
  company_id: string;
  role_title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  location: string;
  employment_type: string;
  department: string;
  team_context: Record<string, any>;
  technologies: string[];
  achievements: Achievement[];
}

interface JobApplication {
  id: string;
  company_id: string;
  job_title: string;
  job_description: string;
  job_url: string | null;
  location: string;
  remote_policy: string;
  status: string;
  application_date: string;
  last_contact_date: string | null;
  next_followup_date: string | null;
  salary_min: number;
  salary_max: number;
  source: string;
  resume_version: string | null;
  interview_notes: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface JobWithExperience extends JobApplication {
  work_experience?: WorkExperience;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<JobWithExperience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      // Fetch job application
      const jobResponse = await fetch(`http://localhost:8001/api/v1/job-applications/${jobId}`);
      const jobData = await jobResponse.json();

      // Fetch work experience for this company
      const experiencesResponse = await fetch("http://localhost:8001/api/v1/work-experiences/");
      const experiencesData = await experiencesResponse.json();

      const experience = experiencesData.find((exp: WorkExperience) =>
        exp.company_id === jobData.company_id
      );

      setJob({
        ...jobData,
        work_experience: experience
      });
    } catch (error) {
      console.error("Failed to fetch job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const getMetricTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cost_savings: "bg-green-500/10 text-green-500",
      time_reduction: "bg-blue-500/10 text-blue-500",
      performance_improvement: "bg-purple-500/10 text-purple-500",
      scale: "bg-orange-500/10 text-orange-500",
      team_impact: "bg-pink-500/10 text-pink-500",
      business_impact: "bg-yellow-500/10 text-yellow-500",
      capacity_increase: "bg-indigo-500/10 text-indigo-500",
      technical_achievement: "bg-cyan-500/10 text-cyan-500",
    };
    return colors[type] || "bg-gray-500/10 text-gray-500";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      accepted: "bg-green-500",
      offer: "bg-blue-500",
      negotiating: "bg-purple-500",
      onsite: "bg-orange-500",
      technical_interview: "bg-yellow-500",
      phone_screen: "bg-cyan-500",
      screening: "bg-indigo-500",
      applied: "bg-gray-500",
      interested: "bg-slate-500",
      researching: "bg-zinc-500",
      rejected: "bg-red-500",
      withdrawn: "bg-red-400",
      ghosted: "bg-red-300"
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <PageLayout title="Job Details">
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Loading job details...</p>
        </div>
      </PageLayout>
    );
  }

  if (!job) {
    return (
      <PageLayout title="Job Details">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Job not found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/work/jobs")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const achievementCount = job.work_experience?.achievements?.length || 0;
  const technologies = job.work_experience?.technologies || [];

  return (
    <PageLayout title={job.job_title}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/work/jobs")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.job_title}</h1>
              <p className="text-blue-100 text-lg mb-4">{job.job_description}</p>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className={`${getStatusColor(job.status)} text-white`}>
                  {job.status.replace(/_/g, " ").toUpperCase()}
                </Badge>
                {job.work_experience && (
                  <>
                    <span className="text-blue-100">•</span>
                    <span className="text-blue-100">{formatDate(job.work_experience.start_date)} - {formatDate(job.work_experience.end_date)}</span>
                  </>
                )}
              </div>
            </div>
            {achievementCount > 0 && (
              <div className="text-right">
                <div className="text-6xl font-bold">{achievementCount}</div>
                <div className="text-blue-100">Achievements</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Applied</p>
                  <p className="text-sm font-semibold">{formatDate(job.application_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold">{job.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {job.salary_min && job.salary_max && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Salary</p>
                    <p className="text-sm font-semibold">{formatSalary(job.salary_min, job.salary_max)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Work Model</p>
                  <p className="text-sm font-semibold">{job.remote_policy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{job.job_title}</CardTitle>
                <Badge className={getStatusColor(job.status)}>
                  {job.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Applied</p>
                  <p className="text-sm font-medium">{formatDate(job.application_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{job.location}</p>
                </div>
              </div>
              {job.salary_min && job.salary_max && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Salary Range</p>
                    <p className="text-sm font-medium">{formatSalary(job.salary_min, job.salary_max)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Remote Policy</p>
                  <p className="text-sm font-medium">{job.remote_policy}</p>
                </div>
              </div>
            </div>

            {job.job_description && (
              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{job.job_description}</p>
              </div>
            )}

            {job.source && (
              <div>
                <p className="text-xs text-muted-foreground">Source: {job.source}</p>
              </div>
            )}

            {job.notes && (
              <div>
                <p className="text-sm font-medium mb-2">Notes</p>
                <p className="text-sm text-muted-foreground">{job.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technologies */}
        {job.work_experience && job.work_experience.technologies && job.work_experience.technologies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Technologies Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.work_experience.technologies.map((tech, idx) => (
                  <Badge key={idx} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Context */}
        {job.work_experience && job.work_experience.team_context && Object.keys(job.work_experience.team_context).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Team Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {job.work_experience.team_context.team_size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Team Size:</span>
                    <span className="font-medium">{job.work_experience.team_context.team_size}</span>
                  </div>
                )}
                {job.work_experience.team_context.reporting_to && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reporting To:</span>
                    <span className="font-medium">{job.work_experience.team_context.reporting_to}</span>
                  </div>
                )}
                {job.work_experience.team_context.cross_functional_teams && (
                  <div>
                    <p className="text-muted-foreground mb-1">Cross-functional Teams:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.work_experience.team_context.cross_functional_teams.map((team: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs capitalize">
                          {team}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        {job.work_experience && job.work_experience.achievements && job.work_experience.achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Career Achievements ({job.work_experience.achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {job.work_experience.achievements
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((achievement) => (
                    <div
                      key={achievement.id}
                      className="border-l-2 border-primary pl-4 py-2 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm leading-relaxed font-medium">
                          {achievement.fact_text}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`shrink-0 ${getMetricTypeColor(achievement.metric_type)}`}
                        >
                          {achievement.metric_value} {achievement.metric_unit}
                        </Badge>
                      </div>

                      {achievement.context && (
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Context:</p>
                          <p className="text-sm">{achievement.context}</p>
                        </div>
                      )}

                      {achievement.impact && (
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Impact:</p>
                            <p className="text-sm">{achievement.impact}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {achievement.dimensions && achievement.dimensions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {achievement.dimensions.map((dim, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {dim.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {achievement.leadership_principles && achievement.leadership_principles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {achievement.leadership_principles.map((principle, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs capitalize bg-blue-500/10 text-blue-500"
                              >
                                {principle.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {achievement.skills_used && achievement.skills_used.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Skills Used:</p>
                          <div className="flex flex-wrap gap-1">
                            {achievement.skills_used.map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
