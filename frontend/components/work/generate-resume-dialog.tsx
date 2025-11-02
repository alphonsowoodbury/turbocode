"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Check } from "lucide-react";
import { toast } from "sonner";
import { useResumes } from "@/hooks/use-resumes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface GenerateResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobApplicationId?: string;
}

interface GenerationResult {
  resume_id: string;
  file_path: string;
  match_score: number;
  suggestions: string[];
  title: string;
  format: string;
}

export function GenerateResumeDialog({
  open,
  onOpenChange,
  jobApplicationId,
}: GenerateResumeDialogProps) {
  const { resumes } = useResumes();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Form state
  const [baseResumeId, setBaseResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [outputFormat, setOutputFormat] = useState("pdf");

  const resetForm = () => {
    setBaseResumeId("");
    setJobDescription("");
    setJobTitle("");
    setCompanyName("");
    setOutputFormat("pdf");
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!baseResumeId) {
      toast.error("Please select a base resume");
      return;
    }

    if (!jobDescription.trim() && !jobApplicationId) {
      toast.error("Job description is required");
      return;
    }

    setLoading(true);

    try {
      const endpoint = jobApplicationId
        ? `${API_BASE_URL}/api/v1/resumes/generate/from-application/${jobApplicationId}`
        : `${API_BASE_URL}/api/v1/resumes/generate`;

      const requestBody = jobApplicationId
        ? {
            base_resume_id: baseResumeId,
            output_format: outputFormat,
          }
        : {
            base_resume_id: baseResumeId,
            job_description: jobDescription,
            job_title: jobTitle || null,
            company_name: companyName || null,
            output_format: outputFormat,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to generate resume");
      }

      const data: GenerationResult = await response.json();
      setResult(data);
      toast.success(`Resume generated with ${data.match_score}% match!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate resume"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Get primary resume as default
  const primaryResume = resumes.find((r) => r.is_primary);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Tailored Resume</DialogTitle>
          <DialogDescription>
            Generate a customized resume tailored to a specific job opportunity.
            The system will analyze the job description and optimize your resume
            for maximum impact.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Base Resume Selection */}
            <div className="space-y-2">
              <Label htmlFor="base_resume">
                Base Resume <span className="text-red-500">*</span>
              </Label>
              <Select
                value={baseResumeId}
                onValueChange={setBaseResumeId}
                defaultValue={primaryResume?.id}
              >
                <SelectTrigger id="base_resume">
                  <SelectValue placeholder="Select a resume to customize" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.title}
                      {resume.is_primary && " (Primary)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {resumes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No resumes available. Please upload a resume first.
                </p>
              )}
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <Label htmlFor="output_format">Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger id="output_format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Only show these fields if not generating from application */}
            {!jobApplicationId && (
              <>
                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Apple Inc."
                  />
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="job_description">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="job_description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={10}
                    className="font-mono text-xs"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Include qualifications, responsibilities, and requirements for
                    best results.
                  </p>
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || resumes.length === 0}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Resume
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Success State */}
            <div className="flex items-center justify-center py-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Resume Generated!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your tailored resume has been created successfully
                  </p>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Match Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {result.match_score}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Format</p>
                  <p className="text-lg font-medium">{result.format.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resume Title</Label>
                <p className="text-sm font-medium">{result.title}</p>
              </div>

              <div className="space-y-2">
                <Label>File Location</Label>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {result.file_path}
                </p>
              </div>

              {result.suggestions.length > 0 && (
                <div className="space-y-2">
                  <Label>AI Suggestions</Label>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.open(`/work/resumes/${result.resume_id}`, "_blank");
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Resume
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
