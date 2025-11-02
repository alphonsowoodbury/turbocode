"use client";

import { useState, useEffect } from "react";
import { useJobApplications, JobApplication } from "@/hooks/use-job-applications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditApplicationDialogProps {
  application: JobApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditApplicationDialog({
  application,
  open,
  onOpenChange,
}: EditApplicationDialogProps) {
  const { updateApplication } = useJobApplications();
  const [loading, setLoading] = useState(false);

  // Form state
  const [positionTitle, setPositionTitle] = useState(application.position_title);
  const [companyName, setCompanyName] = useState(application.company_name);
  const [jobUrl, setJobUrl] = useState(application.job_url || "");
  const [jobDescription, setJobDescription] = useState(application.job_description || "");
  const [status, setStatus] = useState(application.status);
  const [location, setLocation] = useState(application.location || "");
  const [workMode, setWorkMode] = useState(application.work_mode || "");
  const [salaryRange, setSalaryRange] = useState(application.salary_range || "");
  const [applicationDate, setApplicationDate] = useState(
    application.application_date
      ? new Date(application.application_date).toISOString().split("T")[0]
      : ""
  );
  const [deadline, setDeadline] = useState(
    application.deadline
      ? new Date(application.deadline).toISOString().split("T")[0]
      : ""
  );
  const [notes, setNotes] = useState(application.notes || "");

  // Reset form when dialog opens with new application
  useEffect(() => {
    if (open) {
      setPositionTitle(application.position_title);
      setCompanyName(application.company_name);
      setJobUrl(application.job_url || "");
      setJobDescription(application.job_description || "");
      setStatus(application.status);
      setLocation(application.location || "");
      setWorkMode(application.work_mode || "");
      setSalaryRange(application.salary_range || "");
      setApplicationDate(
        application.application_date
          ? new Date(application.application_date).toISOString().split("T")[0]
          : ""
      );
      setDeadline(
        application.deadline
          ? new Date(application.deadline).toISOString().split("T")[0]
          : ""
      );
      setNotes(application.notes || "");
    }
  }, [open, application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!positionTitle.trim()) {
      toast.error("Position title is required");
      return;
    }

    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    // Build update data (only changed fields)
    const updateData: any = {};

    if (positionTitle !== application.position_title) {
      updateData.position_title = positionTitle;
    }
    if (companyName !== application.company_name) {
      updateData.company_name = companyName;
    }
    if (jobUrl !== (application.job_url || "")) {
      updateData.job_url = jobUrl || null;
    }
    if (jobDescription !== (application.job_description || "")) {
      updateData.job_description = jobDescription || null;
    }
    if (status !== application.status) {
      updateData.status = status;
    }
    if (location !== (application.location || "")) {
      updateData.location = location || null;
    }
    if (workMode !== (application.work_mode || "")) {
      updateData.work_mode = workMode || null;
    }
    if (salaryRange !== (application.salary_range || "")) {
      updateData.salary_range = salaryRange || null;
    }
    if (applicationDate !== (application.application_date ? new Date(application.application_date).toISOString().split("T")[0] : "")) {
      updateData.application_date = applicationDate || null;
    }
    if (deadline !== (application.deadline ? new Date(application.deadline).toISOString().split("T")[0] : "")) {
      updateData.deadline = deadline || null;
    }
    if (notes !== (application.notes || "")) {
      updateData.notes = notes || null;
    }

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save");
      onOpenChange(false);
      return;
    }

    setLoading(true);

    try {
      await updateApplication(application.id, updateData);
      toast.success("Application updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update application");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Application</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position_title">
                Position Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position_title"
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Apple Inc."
                required
              />
            </div>
          </div>

          {/* Status and URL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="job_url">Job URL</Label>
              <Input
                id="job_url"
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Location and Work Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_mode">Work Mode</Label>
              <Select value={workMode} onValueChange={setWorkMode}>
                <SelectTrigger id="work_mode">
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-2">
            <Label htmlFor="salary_range">Salary Range</Label>
            <Input
              id="salary_range"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="e.g., $120,000 - $180,000"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="application_date">Application Date</Label>
              <Input
                id="application_date"
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea
              id="job_description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={6}
              className="font-mono text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this application..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
