"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useProject } from "@/hooks/use-projects";
import { useIssues } from "@/hooks/use-issues";
import { useMilestones } from "@/hooks/use-milestones";
import { CreateIssueDialog } from "@/components/issues/create-issue-dialog";
import { CreateMilestoneDialog } from "@/components/milestones/create-milestone-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2, Plus, Filter, ExternalLink, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { IssueFiltersComponent, type IssueFilters as IssueFiltersType } from "@/components/projects/issue-filters";
import { ActivityFeed } from "@/components/projects/activity-feed";
import { useSavedFilters, useCreateSavedFilter, useDeleteSavedFilter } from "@/hooks/use-saved-filters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  critical: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const statusColors = {
  active: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  on_hold: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  completed: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  archived: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
};

const milestoneStatusColors = {
  planned: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [createMilestoneOpen, setCreateMilestoneOpen] = useState(false);
  const [filters, setFilters] = useState<IssueFiltersType>({});
  const [saveFilterOpen, setSaveFilterOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");

  const { data: project, isLoading, error } = useProject(projectId);
  const { data: issues } = useIssues({ project_id: projectId });
  const { data: milestones } = useMilestones({ project_id: projectId });
  const { data: savedFilters } = useSavedFilters(projectId);
  const createFilter = useCreateSavedFilter();
  const deleteFilter = useDeleteSavedFilter();

  // Filter issues based on active filters
  const filteredIssues = useMemo(() => {
    if (!issues) return [];

    return issues.filter((issue) => {
      if (filters.search && !issue.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !issue.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.status && issue.status !== filters.status) {
        return false;
      }
      if (filters.priority && issue.priority !== filters.priority) {
        return false;
      }
      if (filters.type && issue.issue_type !== filters.type) {
        return false;
      }
      return true;
    });
  }, [issues, filters]);

  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;

    await createFilter.mutateAsync({
      name: filterName,
      description: filterDescription,
      filter_config: JSON.stringify(filters),
      project_id: projectId,
    });

    setFilterName("");
    setFilterDescription("");
    setSaveFilterOpen(false);
  };

  const handleLoadFilter = (filterConfig: string) => {
    try {
      const parsedFilters = JSON.parse(filterConfig);
      setFilters(parsedFilters);
    } catch (e) {
      console.error("Failed to parse filter config:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Project Not Found" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Project not found or failed to load
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title={project.name} />

      <div className="flex-1 space-y-6 p-6">
        {/* Project Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle>{project.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", priorityColors[project.priority])}
                >
                  {project.priority}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs capitalize",
                    statusColors[project.status]
                  )}
                >
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {project.completion_percentage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${project.completion_percentage}%` }}
                />
              </div>
            </div>

            {/* Metadata */}
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Created: </span>
                <span>
                  {formatDistanceToNow(new Date(project.created_at))} ago
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Updated: </span>
                <span>
                  {formatDistanceToNow(new Date(project.updated_at))} ago
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Milestones</CardTitle>
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {milestones?.length || 0}
                </Badge>
                <Link href="/milestones">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <Button
                size="sm"
                onClick={() => setCreateMilestoneOpen(true)}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {milestones && milestones.length > 0 ? (
              <div className="space-y-2">
                {milestones.map((milestone) => (
                  <Link key={milestone.id} href={`/milestones/${milestone.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{milestone.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            Due {format(new Date(milestone.due_date), "MMM d, yyyy")}
                          </p>
                          {milestone.issue_count > 0 && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                {milestone.issue_count} {milestone.issue_count === 1 ? "issue" : "issues"}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs capitalize",
                          milestoneStatusColors[milestone.status]
                        )}
                      >
                        {milestone.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No milestones yet. Create one to track project goals.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Issues and Activity Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Filtered Issues */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Issues</CardTitle>
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    {filteredIssues.length}
                    {filteredIssues.length !== issues?.length && ` / ${issues?.length}`}
                  </Badge>
                  <Link href={`/projects/${projectId}/issues`}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-8"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                  {savedFilters && savedFilters.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          Saved
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {savedFilters.map((filter) => (
                          <DropdownMenuItem
                            key={filter.id}
                            className="flex items-center justify-between"
                            onClick={() => handleLoadFilter(filter.filter_config)}
                          >
                            <span className="truncate flex-1">{filter.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFilter.mutate(filter.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    size="sm"
                    onClick={() => setCreateIssueOpen(true)}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Issue
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showFilters && (
                <div className="mb-4 pb-4 border-b">
                  <IssueFiltersComponent
                    filters={filters}
                    onFiltersChange={setFilters}
                    onSaveClick={() => setSaveFilterOpen(true)}
                  />
                </div>
              )}

              {filteredIssues.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {filteredIssues.slice(0, 10).map((issue) => (
                      <Link key={issue.id} href={`/issues/${issue.id}`}>
                        <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="flex-1">
                            <p className="font-medium">{issue.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {issue.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {issue.status.replace("_", " ")}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                priorityColors[issue.priority]
                              )}
                            >
                              {issue.priority}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {filteredIssues.length > 10 && (
                    <div className="flex justify-center mt-4">
                      <Link href={`/projects/${projectId}/issues`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {issues && issues.length > 0
                    ? "No issues match the current filters."
                    : "No issues yet. Create one to get started."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed projectId={projectId} />
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateIssueDialog
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
        projectId={projectId}
      />

      <CreateMilestoneDialog
        open={createMilestoneOpen}
        onOpenChange={setCreateMilestoneOpen}
        projectId={projectId}
      />

      <Dialog open={saveFilterOpen} onOpenChange={setSaveFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
            <DialogDescription>
              Save your current filters for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name</Label>
              <Input
                id="filter-name"
                placeholder="e.g., High Priority Bugs"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-description">Description (optional)</Label>
              <Textarea
                id="filter-description"
                placeholder="What does this filter show?"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveFilterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
