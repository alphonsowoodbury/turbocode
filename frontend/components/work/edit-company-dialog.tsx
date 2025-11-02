"use client";

import { useState, useEffect } from "react";
import { useCompanies, Company } from "@/hooks/use-companies";
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

interface EditCompanyDialogProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCompanyDialog({
  company,
  open,
  onOpenChange,
}: EditCompanyDialogProps) {
  const { updateCompany } = useCompanies();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(company.name);
  const [website, setWebsite] = useState(company.website || "");
  const [industry, setIndustry] = useState(company.industry || "");
  const [size, setSize] = useState(company.size || "");
  const [location, setLocation] = useState(company.location || "");
  const [remotePolicy, setRemotePolicy] = useState(company.remote_policy || "");
  const [targetStatus, setTargetStatus] = useState(company.target_status);
  const [researchNotes, setResearchNotes] = useState(company.research_notes || "");
  const [cultureNotes, setCultureNotes] = useState(company.culture_notes || "");
  const [linkedinUrl, setLinkedinUrl] = useState(company.linkedin_url || "");
  const [careersPageUrl, setCareersPageUrl] = useState(company.careers_page_url || "");
  const [glassdoorRating, setGlassdoorRating] = useState(
    company.glassdoor_rating ? company.glassdoor_rating.toString() : ""
  );

  useEffect(() => {
    if (open) {
      setName(company.name);
      setWebsite(company.website || "");
      setIndustry(company.industry || "");
      setSize(company.size || "");
      setLocation(company.location || "");
      setRemotePolicy(company.remote_policy || "");
      setTargetStatus(company.target_status);
      setResearchNotes(company.research_notes || "");
      setCultureNotes(company.culture_notes || "");
      setLinkedinUrl(company.linkedin_url || "");
      setCareersPageUrl(company.careers_page_url || "");
      setGlassdoorRating(company.glassdoor_rating ? company.glassdoor_rating.toString() : "");
    }
  }, [open, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Company name is required");
      return;
    }

    const updateData: any = {};

    if (name !== company.name) updateData.name = name;
    if (website !== (company.website || "")) updateData.website = website || null;
    if (industry !== (company.industry || "")) updateData.industry = industry || null;
    if (size !== (company.size || "")) updateData.size = size || null;
    if (location !== (company.location || "")) updateData.location = location || null;
    if (remotePolicy !== (company.remote_policy || "")) updateData.remote_policy = remotePolicy || null;
    if (targetStatus !== company.target_status) updateData.target_status = targetStatus;
    if (researchNotes !== (company.research_notes || "")) updateData.research_notes = researchNotes || null;
    if (cultureNotes !== (company.culture_notes || "")) updateData.culture_notes = cultureNotes || null;
    if (linkedinUrl !== (company.linkedin_url || "")) updateData.linkedin_url = linkedinUrl || null;
    if (careersPageUrl !== (company.careers_page_url || "")) updateData.careers_page_url = careersPageUrl || null;

    const newRating = glassdoorRating ? parseFloat(glassdoorRating) : null;
    const oldRating = company.glassdoor_rating || null;
    if (newRating !== oldRating) updateData.glassdoor_rating = newRating;

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save");
      onOpenChange(false);
      return;
    }

    setLoading(true);

    try {
      await updateCompany(company.id, updateData);
      toast.success("Company updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update company");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="glassdoor_rating">Glassdoor Rating</Label>
              <Input
                id="glassdoor_rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={glassdoorRating}
                onChange={(e) => setGlassdoorRating(e.target.value)}
                placeholder="e.g., 4.2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="careers_page_url">Careers Page URL</Label>
              <Input
                id="careers_page_url"
                type="url"
                value={careersPageUrl}
                onChange={(e) => setCareersPageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="research_notes">Research Notes</Label>
            <Textarea
              id="research_notes"
              value={researchNotes}
              onChange={(e) => setResearchNotes(e.target.value)}
              placeholder="Add notes about the company, products, recent news, etc..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="culture_notes">Culture Notes</Label>
            <Textarea
              id="culture_notes"
              value={cultureNotes}
              onChange={(e) => setCultureNotes(e.target.value)}
              placeholder="Add notes about company culture, values, work environment, etc..."
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
