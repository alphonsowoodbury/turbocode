"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useInitiative, useInitiativeIssues, useUpdateInitiative } from "@/hooks/use-initiatives";
import { useProject } from "@/hooks/use-projects";
import { EditInitiativeDialog } from "@/components/initiatives/edit-initiative-dialog";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Pencil, Target, CheckCircle2, FileText, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

const initiativeStatusColors = {
  planning: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  on_hold: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  critical: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export default function InitiativeDetailPage() {
  const params = useParams();
  const initiativeId = params.id as string;
  const [editOpen, setEditOpen] = useState(false);

  const { data: initiative, isLoading, error } = useInitiative(initiativeId);
  const { data: project } = useProject(initiative?.project_id || null);
  const { data: initiativeIssues } = useInitiativeIssues(initiativeId);
  const updateInitiative = useUpdateInitiative();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Initiative Not Found" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Initiative not found or failed to load
          </p>
        </div>
      </div>
    );
  }

  const issues = initiativeIssues || [];

  return (
    <div className="flex h-full flex-col">
      <Header
        title={initiative.name}
        breadcrumbs={project ? [{ label: project.name, href: `/projects/${project.id}` }] : undefined}
      />

      <div className="flex-1 space-y-4 p-6">
        {/* Initiative Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="h-4 w-4 p-0 hover:bg-muted"
          >
            <Pencil className="h-2.5 w-2.5" />
          </Button>
          <span className="text-xs text-muted-foreground">•</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge
                variant="secondary"
                className={cn("h-4 text-[10px] leading-none capitalize px-1.5 py-0 cursor-pointer", initiativeStatusColors[initiative.status])}
              >
                {initiative.status.replace('_', ' ')}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={initiative.status}
                onValueChange={(value) => {
                  updateInitiative.mutate(
                    { id: initiative.id, data: { status: value } },
                    {
                      onSuccess: () => {
                        toast.success("Status updated successfully");
                      },
                      onError: (error) => {
                        toast.error(error instanceof Error ? error.message : "Failed to update status");
                      },
                    }
                  );
                }}
              >
                <DropdownMenuRadioItem value="planning">Planning</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="in_progress">In Progress</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="on_hold">On Hold</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {initiative.target_date && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <Target className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Target {format(new Date(initiative.target_date), "MMM d, yyyy")}
              </span>
            </>
          )}
          {initiative.start_date && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                Started {format(new Date(initiative.start_date), "MMM d, yyyy")}
              </span>
            </>
          )}
          <span className="text-xs text-muted-foreground">•</span>
          <CheckCircle2 className="h-2.5 w-2.5 text-muted-foreground" />
          <Badge variant="outline" className="h-4 text-[10px] leading-none px-1.5 py-0">
            {initiative.issue_count} {initiative.issue_count === 1 ? "issue" : "issues"}
          </Badge>
          <FileText className="h-2.5 w-2.5 text-muted-foreground" />
          <Badge variant="outline" className="h-4 text-[10px] leading-none px-1.5 py-0">
            {initiative.document_count} {initiative.document_count === 1 ? "doc" : "docs"}
          </Badge>
          <Tag className="h-2.5 w-2.5 text-muted-foreground" />
          <Badge variant="outline" className="h-4 text-[10px] leading-none px-1.5 py-0">
            {initiative.tag_count} {initiative.tag_count === 1 ? "tag" : "tags"}
          </Badge>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(initiative.created_at))} ago
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(initiative.updated_at))} ago
          </span>
        </div>

        <Separator />

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={initiative.description} />
          </CardContent>
        </Card>

        <Separator />

        {/* Associated Issues */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Associated Issues ({issues.length})</h2>
          {issues.length > 0 ? (
            <div className="space-y-2">
              {issues.map((issue) => (
                <Link key={issue.id} href={`/issues/${issue.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{issue.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {issue.description}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
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
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No issues associated with this initiative yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Edit the initiative to add issues.
              </p>
            </div>
          )}
        </div>
      </div>

      <EditInitiativeDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initiative={initiative}
        projectId={initiative.project_id}
      />
    </div>
  );
}
