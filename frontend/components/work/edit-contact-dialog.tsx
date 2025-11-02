"use client";

import { useState, useEffect } from "react";
import { useContacts, NetworkContact } from "@/hooks/use-contacts";
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

interface EditContactDialogProps {
  contact: NetworkContact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContactDialog({
  contact,
  open,
  onOpenChange,
}: EditContactDialogProps) {
  const { updateContact } = useContacts();
  const { companies } = useCompanies();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(contact.first_name);
  const [lastName, setLastName] = useState(contact.last_name);
  const [email, setEmail] = useState(contact.email || "");
  const [phone, setPhone] = useState(contact.phone || "");
  const [linkedinUrl, setLinkedinUrl] = useState(contact.linkedin_url || "");
  const [currentTitle, setCurrentTitle] = useState(contact.current_title || "");
  const [currentCompany, setCurrentCompany] = useState(contact.current_company || "");
  const [companyId, setCompanyId] = useState(contact.company_id || "");
  const [contactType, setContactType] = useState(contact.contact_type || "");
  const [relationshipStrength, setRelationshipStrength] = useState(contact.relationship_strength);
  const [lastContactDate, setLastContactDate] = useState(
    contact.last_contact_date ? new Date(contact.last_contact_date).toISOString().split("T")[0] : ""
  );
  const [nextFollowupDate, setNextFollowupDate] = useState(
    contact.next_followup_date ? new Date(contact.next_followup_date).toISOString().split("T")[0] : ""
  );
  const [howWeMet, setHowWeMet] = useState(contact.how_we_met || "");
  const [referralStatus, setReferralStatus] = useState(contact.referral_status || "none");
  const [notes, setNotes] = useState(contact.notes || "");

  useEffect(() => {
    if (open) {
      setFirstName(contact.first_name);
      setLastName(contact.last_name);
      setEmail(contact.email || "");
      setPhone(contact.phone || "");
      setLinkedinUrl(contact.linkedin_url || "");
      setCurrentTitle(contact.current_title || "");
      setCurrentCompany(contact.current_company || "");
      setCompanyId(contact.company_id || "");
      setContactType(contact.contact_type || "");
      setRelationshipStrength(contact.relationship_strength);
      setLastContactDate(
        contact.last_contact_date ? new Date(contact.last_contact_date).toISOString().split("T")[0] : ""
      );
      setNextFollowupDate(
        contact.next_followup_date ? new Date(contact.next_followup_date).toISOString().split("T")[0] : ""
      );
      setHowWeMet(contact.how_we_met || "");
      setReferralStatus(contact.referral_status || "none");
      setNotes(contact.notes || "");
    }
  }, [open, contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    const updateData: any = {};

    if (firstName !== contact.first_name) updateData.first_name = firstName;
    if (lastName !== contact.last_name) updateData.last_name = lastName;
    if (email !== (contact.email || "")) updateData.email = email || null;
    if (phone !== (contact.phone || "")) updateData.phone = phone || null;
    if (linkedinUrl !== (contact.linkedin_url || "")) updateData.linkedin_url = linkedinUrl || null;
    if (currentTitle !== (contact.current_title || "")) updateData.current_title = currentTitle || null;
    if (currentCompany !== (contact.current_company || "")) updateData.current_company = currentCompany || null;
    if (companyId !== (contact.company_id || "")) updateData.company_id = companyId || null;
    if (contactType !== (contact.contact_type || "")) updateData.contact_type = contactType || null;
    if (relationshipStrength !== contact.relationship_strength) updateData.relationship_strength = relationshipStrength;
    if (lastContactDate !== (contact.last_contact_date ? new Date(contact.last_contact_date).toISOString().split("T")[0] : "")) {
      updateData.last_contact_date = lastContactDate || null;
    }
    if (nextFollowupDate !== (contact.next_followup_date ? new Date(contact.next_followup_date).toISOString().split("T")[0] : "")) {
      updateData.next_followup_date = nextFollowupDate || null;
    }
    if (howWeMet !== (contact.how_we_met || "")) updateData.how_we_met = howWeMet || null;
    if (referralStatus !== (contact.referral_status || "none")) updateData.referral_status = referralStatus;
    if (notes !== (contact.notes || "")) updateData.notes = notes || null;

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save");
      onOpenChange(false);
      return;
    }

    setLoading(true);

    try {
      await updateContact(contact.id, updateData);
      toast.success("Contact updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update contact");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Professional Contact</DialogTitle>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_company">Current Company</Label>
              <Input
                id="current_company"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
              />
            </div>
          </div>

          {/* Link to tracked company */}
          {companies.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="company_id">Link to Tracked Company</Label>
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
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
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
            />
          </div>

          {/* How We Met */}
          <div className="space-y-2">
            <Label htmlFor="how_we_met">How We Met</Label>
            <Textarea
              id="how_we_met"
              value={howWeMet}
              onChange={(e) => setHowWeMet(e.target.value)}
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
