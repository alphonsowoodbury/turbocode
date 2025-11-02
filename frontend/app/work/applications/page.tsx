"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, FileText, ExternalLink, Trash2, Edit, Building2, MapPin, DollarSign, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useJobApplications, JobApplication } from "@/hooks/use-job-applications";
import { toast } from "sonner";
import { CreateApplicationDialog } from "@/components/work/create-application-dialog";
import { EditApplicationDialog } from "@/components/work/edit-application-dialog";
import { GenerateResumeDialog } from "@/components/work/generate-resume-dialog";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS = {
  saved: "bg-slate-500",
  applied: "bg-blue-500",
  screening: "bg-purple-500",
  interviewing: "bg-amber-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
  accepted: "bg-emerald-600",
  declined: "bg-orange-500",
};

const STATUS_LABELS = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  accepted: "Accepted",
  declined: "Declined",
};

const WORK_MODE_ICONS = {
  remote: "🏠",
  hybrid: "🏢/🏠",
  onsite: "🏢",
};

export default function ApplicationsPage() {
  const { applications, loading, error, fetchApplications, deleteApplication } = useJobApplications();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [generateResumeDialogOpen, setGenerateResumeDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      await deleteApplication(id);
      toast.success("Application deleted successfully");
    } catch (err) {
      toast.error("Failed to delete application");
    }
  };

  const handleEdit = (application: JobApplication) => {
    setSelectedApplication(application);
    setEditDialogOpen(true);
  };

  const handleGenerateResume = (application: JobApplication) => {
    setSelectedApplication(application);
    setGenerateResumeDialogOpen(true);
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter((app) => statusFilter === "all" || app.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "company") {
        return a.company_name.localeCompare(b.company_name);
      } else if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  // Group applications by status if needed
  const groupedApplications: Record<string, JobApplication[]> = {};
  filteredApplications.forEach((app) => {
    const key = app.status;
    if (!groupedApplications[key]) {
      groupedApplications[key] = [];
    }
    groupedApplications[key].push(app);
  });

  return (
    <PageLayout title="Job Applications">
      <div className="p-6">
        {/* Header Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
            {!loading && (
              <span className="text-sm text-muted-foreground">
                {filteredApplications.length} application{filteredApplications.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="saved">Saved</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="interviewing">Interviewing</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading applications...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredApplications.length === 0 && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                {statusFilter === "all"
                  ? "No applications yet. Add one to track your job search!"
                  : `No ${statusFilter} applications found.`}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            </div>
          </div>
        )}

        {/* Applications Grid */}
        {!loading && !error && filteredApplications.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1 truncate">
                        {application.position_title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {application.company_name}
                      </CardDescription>
                    </div>
                    <Badge className={`${STATUS_COLORS[application.status]} text-white ml-2`}>
                      {STATUS_LABELS[application.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Application Details */}
                  <div className="space-y-2 text-sm">
                    {application.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{application.location}</span>
                        {application.work_mode && (
                          <span className="ml-auto text-xs">
                            {WORK_MODE_ICONS[application.work_mode]}
                          </span>
                        )}
                      </div>
                    )}
                    {application.salary_range && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>{application.salary_range}</span>
                      </div>
                    )}
                    {application.application_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Applied{" "}
                          {formatDistanceToNow(new Date(application.application_date), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    )}
                    {application.deadline && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Deadline:{" "}
                          {new Date(application.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes Preview */}
                  {application.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t">
                      {application.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t gap-2">
                    <div className="flex items-center gap-1">
                      {application.job_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(application.job_url, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      {application.job_description && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateResume(application)}
                          className="text-primary"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(application)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(application.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateApplicationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      {selectedApplication && (
        <>
          <EditApplicationDialog
            application={selectedApplication}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <GenerateResumeDialog
            open={generateResumeDialogOpen}
            onOpenChange={setGenerateResumeDialogOpen}
            jobApplicationId={selectedApplication.id}
          />
        </>
      )}
    </PageLayout>
  );
}
