"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Briefcase, Building2, Calendar, MapPin, DollarSign, Award, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  technologies: string[];
  achievements: Achievement[];
}

interface JobApplication {
  id: string;
  company_id: string;
  job_title: string;
  job_description: string;
  location: string;
  remote_policy: string;
  status: string;
  application_date: string;
  salary_min: number;
  salary_max: number;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface JobWithExperience extends JobApplication {
  work_experience?: WorkExperience;
}

export default function JobsPage() {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("application_date");
  const [groupBy, setGroupBy] = useState<string>("none");
  const [jobs, setJobs] = useState<JobWithExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Fetch all job applications
      const jobsResponse = await fetch("http://localhost:8001/api/v1/job-applications/");
      const jobsData = await jobsResponse.json();

      // Fetch all work experiences
      const experiencesResponse = await fetch("http://localhost:8001/api/v1/work-experiences/");
      const experiencesData = await experiencesResponse.json();

      // Match jobs with work experiences by company_id
      const jobsWithExperience = jobsData.map((job: JobApplication) => {
        const experience = experiencesData.find((exp: WorkExperience) =>
          exp.company_id === job.company_id
        );
        return {
          ...job,
          work_experience: experience
        };
      });

      setJobs(jobsWithExperience);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}k`;
      }
      return `$${num}`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
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

  return (
    <PageLayout title="Employment History">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Employment History</h2>
            <p className="text-sm text-muted-foreground">
              Track your job applications and career achievements
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading employment history...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No jobs recorded yet. Add one to track your employment history!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/work/jobs/${job.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{job.job_title}</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(job.application_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary_min && job.salary_max && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                          </div>
                        )}
                        {job.work_experience && job.work_experience.achievements && (
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            <span>{job.work_experience.achievements.length} achievements</span>
                          </div>
                        )}
                      </div>
                      {job.job_description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {job.job_description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
