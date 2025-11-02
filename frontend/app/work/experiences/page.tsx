"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Briefcase, Building2, Calendar, MapPin, TrendingUp, Target, Award } from "lucide-react";
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
  team_context: Record<string, any>;
  technologies: string[];
  achievements: Achievement[];
  created_at: string;
  updated_at: string;
}

interface WorkExperienceWithCompany extends WorkExperience {
  company_name?: string;
}

export default function ExperiencesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("start_date");
  const [groupBy, setGroupBy] = useState<string>("none");
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/v1/work-experiences/");
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error("Failed to fetch work experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Present";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
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

  return (
    <PageLayout title="Work Experiences">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Work Experience</h2>
            <p className="text-sm text-muted-foreground">
              Track your career history with quantifiable achievements
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading experiences...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No experiences yet. Add one to track your career journey!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.map((exp) => (
              <Card key={exp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{exp.role_title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{exp.department}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{exp.location}</span>
                        </div>
                      </div>
                    </div>
                    {exp.is_current && (
                      <Badge variant="default" className="bg-green-500">
                        Current
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Technologies:</p>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Key Achievements ({exp.achievements.length})
                      </p>
                      <div className="space-y-3">
                        {exp.achievements
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((achievement) => (
                            <div
                              key={achievement.id}
                              className="border-l-2 border-primary pl-4 py-2 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-sm leading-relaxed">
                                  {achievement.fact_text}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className={`shrink-0 ${getMetricTypeColor(achievement.metric_type)}`}
                                >
                                  {achievement.metric_value} {achievement.metric_unit}
                                </Badge>
                              </div>
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
                              {achievement.impact && (
                                <p className="text-xs text-muted-foreground flex items-start gap-1">
                                  <TrendingUp className="h-3 w-3 mt-0.5 shrink-0" />
                                  <span>{achievement.impact}</span>
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
