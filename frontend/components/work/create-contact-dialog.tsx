"use client";

import { useState } from "react";
import { useContacts } from "@/hooks/use-contacts";
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

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateContactDialog({
  open,
  onOpenChange,
}: CreateContactDialogProps) {
  const { createContact } = useContacts();
  const { companies } = useCompanies();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [contactType, setContactType] = useState("");
  const [relationshipStrength, setRelationshipStrength] = useState("cold");
  const [lastContactDate, setLastContactDate] = useState("");
  const [nextFollowupDate, setNextFollowupDate] = useState("");
  const [howWeMet, setHowWeMet] = useState("");
  const [referralStatus, setReferralStatus] = useState("none");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setLinkedinUrl("");
    setCurrentTitle("");
    setCurrentCompany("");
    setCompanyId("");
    setContactType("");
    setRelationshipStrength("cold");
    setLastContactDate("");
    setNextFollowupDate("");
    setHowWeMet("");
    setReferralStatus("none");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        first_name: firstName,
        last_name: lastName,
        relationship_strength: relationshipStrength,
      };

      if (email) data.email = email;
      if (phone) data.phone = phone;
      if (linkedinUrl) data.linkedin_url = linkedinUrl;
      if (currentTitle) data.current_title = currentTitle;
      if (currentCompany) data.current_company = currentCompany;
      if (companyId) data.company_id = companyId;
      if (contactType) data.contact_type = contactType;
      if (lastContactDate) data.last_contact_date = lastContactDate;
      if (nextFollowupDate) data.next_followup_date = nextFollowupDate;
      if (howWeMet) data.how_we_met = howWeMet;
      if (referralStatus) data.referral_status = referralStatus;
      if (notes) data.notes = notes;

      await createContact(data);
      toast.success("Contact created successfully");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create contact");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Professional Contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g., John"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g., Smith"
                required
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.smith@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_title">Current Title</Label>
              <Input
                id="current_title"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="e.g., Senior Recruiter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_company">Current Company</Label>
              <Input
                id="current_company"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="e.g., Apple Inc."
              />
            </div>
          </div>

          {/* Link to tracked company */}
          {companies.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="company_id">Link to Tracked Company (Optional)</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger id="company_id">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Contact Type and Relationship */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_type">Contact Type</Label>
              <Select value={contactType} onValueChange={setContactType}>
                <SelectTrigger id="contact_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiter_internal">Internal Recruiter</SelectItem>
                  <SelectItem value="recruiter_external">External Recruiter</SelectItem>
                  <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                  <SelectItem value="peer">Peer</SelectItem>
                  <SelectItem value="referrer">Referrer</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="former_colleague">Former Colleague</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship_strength">Relationship Strength</Label>
              <Select value={relationshipStrength} onValueChange={setRelationshipStrength}>
                <SelectTrigger id="relationship_strength">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">Cold (Never met)</SelectItem>
                  <SelectItem value="warm">Warm (Met once or twice)</SelectItem>
                  <SelectItem value="hot">Hot (Strong relationship)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last_contact_date">Last Contact Date</Label>
              <Input
                id="last_contact_date"
                type="date"
                value={lastContactDate}
                onChange={(e) => setLastContactDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_followup_date">Next Follow-up Date</Label>
              <Input
                id="next_followup_date"
                type="date"
                value={nextFollowupDate}
                onChange={(e) => setNextFollowupDate(e.target.value)}
              />
            </div>
          </div>

          {/* Referral Status */}
          <div className="space-y-2">
            <Label htmlFor="referral_status">Referral Status</Label>
            <Select value={referralStatus} onValueChange={setReferralStatus}>
              <SelectTrigger id="referral_status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Referral</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="agreed">Agreed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          {/* How We Met */}
          <div className="space-y-2">
            <Label htmlFor="how_we_met">How We Met</Label>
            <Textarea
              id="how_we_met"
              value={howWeMet}
              onChange={(e) => setHowWeMet(e.target.value)}
              placeholder="Describe how you met this contact..."
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes about this contact..."
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
              Create Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
