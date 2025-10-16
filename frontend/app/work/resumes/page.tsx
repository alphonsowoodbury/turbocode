"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Upload, Star, Calendar, Briefcase, Building } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useResumes } from "@/hooks/use-resumes";
import { formatDistanceToNow } from "date-fns";

export default function ResumesPage() {
  const router = useRouter();
  const { resumes, isLoading, error } = useResumes();

  if (isLoading) {
    return (
      <PageLayout
        title="Resumes"
        breadcrumbs={[{ label: "Work", href: "/work" }, { label: "Resumes" }]}
        headerChildren={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push("/work/resumes/bulk-upload")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => router.push("/work/resumes/upload")}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        }
      >
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading resumes...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Resumes"
        breadcrumbs={[{ label: "Work", href: "/work" }, { label: "Resumes" }]}
      >
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-500">Failed to load resumes</p>
            <p className="text-xs text-muted-foreground mt-1">
              {error.message}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Resumes"
      breadcrumbs={[{ label: "Work", href: "/work" }, { label: "Resumes" }]}
      headerChildren={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/work/resumes/bulk-upload")}
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => router.push("/work/resumes/upload")}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
        </div>
      }
    >
      <div className="flex h-full flex-col p-6">
        {resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-medium">No resumes yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your first resume to get started
              </p>
            </div>
            <Button onClick={() => router.push("/work/resumes/upload")}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Link
                key={resume.id}
                href={`/work/resumes/${resume.id}`}
                className="block"
              >
                <div className="rounded-lg border bg-card hover:bg-accent/50 transition-colors p-4 h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {resume.is_primary && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    <Badge
                      variant={resume.file_type === "pdf" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {resume.file_type.toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="font-medium text-base mb-2 line-clamp-2">
                    {resume.title}
                  </h3>

                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    {resume.target_role && (
                      <div className="flex items-center">
                        <Briefcase className="h-3 w-3 mr-1.5" />
                        <span className="line-clamp-1">{resume.target_role}</span>
                      </div>
                    )}
                    {resume.target_company && (
                      <div className="flex items-center">
                        <Building className="h-3 w-3 mr-1.5" />
                        <span className="line-clamp-1">{resume.target_company}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {formatDistanceToNow(new Date(resume.updated_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="text-xs">
                      {resume.sections.length} sections
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
