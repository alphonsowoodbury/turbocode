"use client";

import { useState } from "react";
import { useJobApplications } from "@/hooks/use-job-applications";
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

interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateApplicationDialog({
  open,
  onOpenChange,
}: CreateApplicationDialogProps) {
  const { createApplication } = useJobApplications();
  const [loading, setLoading] = useState(false);

  // Form state
  const [positionTitle, setPositionTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState("saved");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setPositionTitle("");
    setCompanyName("");
    setJobUrl("");
    setJobDescription("");
    setStatus("saved");
    setLocation("");
    setWorkMode("");
    setSalaryRange("");
    setApplicationDate("");
    setDeadline("");
    setNotes("");
  };

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

    setLoading(true);

    try {
      const data: any = {
        position_title: positionTitle,
        company_name: companyName,
        status,
      };

      if (jobUrl) data.job_url = jobUrl;
      if (jobDescription) data.job_description = jobDescription;
      if (location) data.location = location;
      if (workMode) data.work_mode = workMode;
      if (salaryRange) data.salary_range = salaryRange;
      if (applicationDate) data.application_date = applicationDate;
      if (deadline) data.deadline = deadline;
      if (notes) data.notes = notes;

      await createApplication(data);
      toast.success("Application created successfully");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create application");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Application</DialogTitle>
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
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
