"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  Star,
  Trash2,
  Download,
  Settings,
  Eye,
  Edit3,
} from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResume, useResumeSections } from "@/hooks/use-resumes";
import { formatDistanceToNow } from "date-fns";

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { resume, isLoading, error, setPrimary, deleteResume, updateResume } =
    useResume(id);
  const { sections } = useResumeSections(id);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  const handleSetPrimary = async () => {
    setIsSettingPrimary(true);
    try {
      await setPrimary();
    } catch (error) {
      console.error("Failed to set as primary:", error);
    } finally {
      setIsSettingPrimary(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteResume();
      router.push("/work/resumes");
    } catch (error) {
      console.error("Failed to delete resume:", error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Loading..."
        breadcrumbs={[
          { label: "Work", href: "/work" },
          { label: "Resumes", href: "/work/resumes" },
          { label: "..." },
        ]}
      >
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading resume...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !resume) {
    return (
      <PageLayout
        title="Error"
        breadcrumbs={[
          { label: "Work", href: "/work" },
          { label: "Resumes", href: "/work/resumes" },
          { label: "Error" },
        ]}
      >
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-500">Failed to load resume</p>
            <p className="text-xs text-muted-foreground mt-1">
              {error?.message || "Resume not found"}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={resume.title}
      breadcrumbs={[
        { label: "Work", href: "/work" },
        { label: "Resumes", href: "/work/resumes" },
        { label: resume.title },
      ]}
      headerAction={
        <div className="flex items-center space-x-2">
          {!resume.is_primary && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetPrimary}
              disabled={isSettingPrimary}
            >
              <Star className="h-4 w-4 mr-2" />
              Set as Primary
            </Button>
          )}
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      }
    >
      <div className="flex h-full flex-col">
        {/* Metadata Bar */}
        <div className="border-b px-6 py-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <Badge
                variant={resume.file_type === "pdf" ? "default" : "secondary"}
              >
                {resume.file_type.toUpperCase()}
              </Badge>
              {resume.is_primary && (
                <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                  Primary
                </Badge>
              )}
              <span className="text-muted-foreground">
                {sections.length} sections
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}
            </div>
          </div>

          {(resume.target_role || resume.target_company) && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {resume.target_role && (
                <div className="flex items-center bg-background border rounded px-2 py-1">
                  <span className="text-muted-foreground mr-1">Role:</span>
                  <span className="font-medium">{resume.target_role}</span>
                </div>
              )}
              {resume.target_company && (
                <div className="flex items-center bg-background border rounded px-2 py-1">
                  <span className="text-muted-foreground mr-1">Company:</span>
                  <span className="font-medium">{resume.target_company}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="preview" className="flex-1 flex flex-col">
          <TabsList className="px-6 py-2 justify-start border-b rounded-none bg-transparent">
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center">
              <Edit3 className="h-4 w-4 mr-2" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Extracted Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {sections
                .filter((s) => s.is_active)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-1">
                      {section.title}
                    </h3>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                      {section.content}
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="sections" className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-4xl space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">All Sections</h3>
                <Button size="sm" disabled>
                  Add Section
                </Button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No sections found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <div
                        key={section.id}
                        className="rounded-lg border bg-card p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{section.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {section.section_type}
                              </Badge>
                              {!section.is_active && (
                                <Badge variant="secondary" className="text-xs">
                                  Hidden
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {section.content.substring(0, 150)}...
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            <Button variant="ghost" size="sm" disabled>
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" disabled>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="data" className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-4xl">
              <h3 className="text-lg font-semibold mb-4">
                AI-Extracted Data
              </h3>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                {JSON.stringify(resume.parsed_data, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
