"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useResumes } from "@/hooks/use-resumes";
import { cn } from "@/lib/utils";

type FileStatus = "queued" | "uploading" | "processing" | "completed" | "error";

interface FileItem {
  file: File;
  id: string;
  status: FileStatus;
  progress: number;
  error?: string;
  resumeId?: string;
}

export default function BulkResumeUploadPage() {
  const router = useRouter();
  const { uploadResume } = useResumes();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [useAiExtraction, setUseAiExtraction] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "text/markdown",
      "text/plain",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFiles: FileList) => {
    const validFiles: FileItem[] = [];
    const invalidFiles: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (validateFile(file)) {
        validFiles.push({
          file,
          id: `${Date.now()}-${Math.random()}`,
          status: "queued",
          progress: 0,
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      alert(
        `The following files were skipped (invalid type or too large):\n${invalidFiles.join("\n")}`
      );
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setCurrentIndex(0);

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      setCurrentIndex(i);

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "uploading" as FileStatus, progress: 30 }
            : f
        )
      );

      try {
        // Extract title from filename
        const title = fileItem.file.name.replace(/\.(pdf|md|markdown)$/i, "");

        // Upload the file
        const result = await uploadResume(
          fileItem.file,
          title,
          undefined,
          undefined,
          useAiExtraction
        );

        // Update to processing (waiting for AI extraction)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: "processing" as FileStatus,
                  progress: 60,
                  resumeId: result.resume_id,
                }
              : f
          )
        );

        // Wait a bit for webhook processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mark as completed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "completed" as FileStatus, progress: 100 }
              : f
          )
        );
      } catch (error) {
        // Mark as error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: "error" as FileStatus,
                  progress: 0,
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  };

  const completedCount = files.filter((f) => f.status === "completed").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const totalProgress =
    files.length > 0
      ? Math.round(
          files.reduce((sum, f) => sum + f.progress, 0) / files.length
        )
      : 0;

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "uploading":
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: FileStatus) => {
    switch (status) {
      case "queued":
        return "Queued";
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing with AI...";
      case "completed":
        return "Completed";
      case "error":
        return "Failed";
    }
  };

  return (
    <PageLayout
      title="Bulk Upload Resumes"
      breadcrumbs={[
        { label: "Work", href: "/work" },
        { label: "Resumes", href: "/work/resumes" },
        { label: "Bulk Upload" },
      ]}
    >
      <div className="flex h-full flex-col p-6">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          {/* File Upload Area */}
          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 bg-muted/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Drag and drop multiple resumes here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse (PDF or Markdown, max 10MB each)
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById("bulk-file-input")?.click()
                }
                disabled={isUploading}
              >
                Select Files
              </Button>
              <input
                id="bulk-file-input"
                type="file"
                accept=".pdf,.md,.markdown"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>

          {/* AI Extraction Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ai-extraction"
              checked={useAiExtraction}
              onCheckedChange={(checked) =>
                setUseAiExtraction(checked as boolean)
              }
              disabled={isUploading}
            />
            <Label htmlFor="ai-extraction" className="text-sm cursor-pointer">
              Use AI to extract structured data (recommended)
            </Label>
          </div>

          {/* Overall Progress */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  Overall Progress ({completedCount}/{files.length} completed)
                </span>
                <span className="text-muted-foreground">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
              {errorCount > 0 && (
                <p className="text-xs text-red-500">
                  {errorCount} file(s) failed to upload
                </p>
              )}
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                Files ({files.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg">
                {files.map((fileItem, index) => (
                  <div
                    key={fileItem.id}
                    className={cn(
                      "flex items-center justify-between p-3 border-b last:border-b-0",
                      index === currentIndex && isUploading && "bg-accent/50"
                    )}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fileItem.file.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>
                            {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(fileItem.status)}
                            <span>{getStatusText(fileItem.status)}</span>
                          </div>
                        </div>
                        {fileItem.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {fileItem.error}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {fileItem.progress > 0 &&
                        fileItem.status !== "completed" &&
                        fileItem.status !== "error" && (
                          <span className="text-xs text-muted-foreground">
                            {fileItem.progress}%
                          </span>
                        )}
                      {!isUploading && fileItem.status === "queued" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/work/resumes")}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <div className="flex space-x-3">
              {files.length > 0 && !isUploading && (
                <Button
                  variant="outline"
                  onClick={() => setFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              )}
              <Button
                onClick={uploadFiles}
                disabled={files.length === 0 || isUploading}
              >
                {isUploading
                  ? `Uploading (${currentIndex + 1}/${files.length})...`
                  : `Upload ${files.length} Resume${files.length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {!isUploading && completedCount === files.length && files.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-green-500 bg-green-50 p-4">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm font-medium">
                  All {completedCount} resume(s) uploaded successfully!
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/work/resumes")}
              >
                View Resumes
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
