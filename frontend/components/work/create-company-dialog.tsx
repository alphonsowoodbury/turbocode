"use client";

import { useState } from "react";
import { useCompanies } from "@/hooks/use-companies";
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

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
}: CreateCompanyDialogProps) {
  const { createCompany } = useCompanies();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [location, setLocation] = useState("");
  const [remotePolicy, setRemotePolicy] = useState("");
  const [targetStatus, setTargetStatus] = useState("researching");
  const [researchNotes, setResearchNotes] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [careersPageUrl, setCareersPageUrl] = useState("");
  const [glassdoorRating, setGlassdoorRating] = useState("");

  const resetForm = () => {
    setName("");
    setWebsite("");
    setIndustry("");
    setSize("");
    setLocation("");
    setRemotePolicy("");
    setTargetStatus("researching");
    setResearchNotes("");
    setLinkedinUrl("");
    setCareersPageUrl("");
    setGlassdoorRating("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Company name is required");
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        name,
        target_status: targetStatus,
      };

      if (website) data.website = website;
      if (industry) data.industry = industry;
      if (size) data.size = size;
      if (location) data.location = location;
      if (remotePolicy) data.remote_policy = remotePolicy;
      if (researchNotes) data.research_notes = researchNotes;
      if (linkedinUrl) data.linkedin_url = linkedinUrl;
      if (careersPageUrl) data.careers_page_url = careersPageUrl;
      if (glassdoorRating) data.glassdoor_rating = parseFloat(glassdoorRating);

      await createCompany(data);
      toast.success("Company created successfully");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create company");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Company</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Apple Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger id="size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Startup (< 50)">Startup (&lt; 50)</SelectItem>
                  <SelectItem value="Small (50-200)">Small (50-200)</SelectItem>
                  <SelectItem value="Medium (200-1000)">Medium (200-1000)</SelectItem>
                  <SelectItem value="Large (1000-10000)">Large (1000-10000)</SelectItem>
                  <SelectItem value="Enterprise (10000+)">Enterprise (10000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <Label htmlFor="remote_policy">Remote Policy</Label>
              <Select value={remotePolicy} onValueChange={setRemotePolicy}>
                <SelectTrigger id="remote_policy">
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="In-Office">In-Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_status">Status</Label>
            <Select value={targetStatus} onValueChange={setTargetStatus}>
              <SelectTrigger id="target_status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="researching">Researching</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="research_notes">Research Notes</Label>
            <Textarea
              id="research_notes"
              value={researchNotes}
              onChange={(e) => setResearchNotes(e.target.value)}
              placeholder="Add notes about the company, culture, tech stack, etc..."
              rows={4}
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
              Create Company
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
