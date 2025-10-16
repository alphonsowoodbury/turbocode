"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useResumes } from "@/hooks/use-resumes";
import { cn } from "@/lib/utils";

export default function ResumeUploadPage() {
  const router = useRouter();
  const { uploadResume } = useResumes();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [useAiExtraction, setUseAiExtraction] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "text/markdown",
      "text/plain",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setUploadStatus({
        type: "error",
        message: "Invalid file type. Please upload a PDF or Markdown file.",
      });
      return false;
    }

    if (file.size > maxSize) {
      setUploadStatus({
        type: "error",
        message: "File size exceeds 10MB limit.",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      // Auto-populate title from filename
      if (!title) {
        const name = selectedFile.name.replace(/\.(pdf|md|markdown)$/i, "");
        setTitle(name);
      }
      setUploadStatus({ type: null, message: "" });
    }
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

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setUploadStatus({
        type: "error",
        message: "Please select a file and provide a title.",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const result = await uploadResume(
        file,
        title,
        targetRole || undefined,
        targetCompany || undefined,
        useAiExtraction
      );

      setUploadStatus({
        type: "success",
        message: result.message,
      });

      // Redirect after short delay
      setTimeout(() => {
        router.push(`/work/resumes/${result.resume_id}`);
      }, 1500);
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadStatus({ type: null, message: "" });
  };

  return (
    <PageLayout
      title="Upload Resume"
      breadcrumbs={[
        { label: "Work", href: "/work" },
        { label: "Resumes", href: "/work/resumes" },
        { label: "Upload" },
      ]}
    >
      <div className="flex h-full flex-col p-6">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          {/* File Upload Area */}
          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 bg-muted/5",
              file && "border-primary/50 bg-primary/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Drag and drop your resume here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse (PDF or Markdown, max 10MB)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  Select File
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.md,.markdown"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Resume Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineer Resume"
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="target-role">Target Role (Optional)</Label>
              <Input
                id="target-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="target-company">Target Company (Optional)</Label>
              <Input
                id="target-company"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g., Anthropic"
                disabled={isUploading}
              />
            </div>

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
          </div>

          {/* Status Messages */}
          {uploadStatus.type && (
            <div
              className={cn(
                "flex items-center space-x-2 rounded-lg border p-3",
                uploadStatus.type === "success"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700"
              )}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <p className="text-sm">{uploadStatus.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push("/work/resumes")}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || !title || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload & Parse"}
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
