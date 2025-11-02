"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Users2, Trash2, Edit, Mail, Linkedin, Phone, Calendar, MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useContacts, NetworkContact } from "@/hooks/use-contacts";
import { toast } from "sonner";
import { CreateContactDialog } from "@/components/work/create-contact-dialog";
import { EditContactDialog } from "@/components/work/edit-contact-dialog";
import { formatDistanceToNow } from "date-fns";

const RELATIONSHIP_COLORS = {
  cold: "bg-blue-500",
  warm: "bg-amber-500",
  hot: "bg-red-500",
};

const RELATIONSHIP_LABELS = {
  cold: "Cold",
  warm: "Warm",
  hot: "Hot",
};

const CONTACT_TYPE_LABELS = {
  recruiter_internal: "Internal Recruiter",
  recruiter_external: "External Recruiter",
  hiring_manager: "Hiring Manager",
  peer: "Peer",
  referrer: "Referrer",
  mentor: "Mentor",
  former_colleague: "Former Colleague",
};

const REFERRAL_STATUS_COLORS = {
  none: "bg-gray-500",
  requested: "bg-blue-500",
  agreed: "bg-green-500",
  completed: "bg-emerald-600",
};

export function ContactsTab() {
  const { contacts, loading, error, deleteContact } = useContacts();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<NetworkContact | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [relationshipFilter, setRelationshipFilter] = useState<string>("all");
  const [contactTypeFilter, setContactTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      await deleteContact(id);
      toast.success("Contact deleted successfully");
    } catch (err) {
      toast.error("Failed to delete contact");
    }
  };

  const handleEdit = (contact: NetworkContact) => {
    setSelectedContact(contact);
    setEditDialogOpen(true);
  };

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter((contact) => {
      if (relationshipFilter !== "all" && contact.relationship_strength !== relationshipFilter) {
        return false;
      }
      if (contactTypeFilter !== "all" && contact.contact_type !== contactTypeFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === "name") {
        const nameA = `${a.first_name} ${a.last_name}`;
        const nameB = `${b.first_name} ${b.last_name}`;
        return nameA.localeCompare(nameB);
      } else if (sortBy === "last_contact") {
        const dateA = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0;
        const dateB = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
          {!loading && (
            <span className="text-sm text-muted-foreground">
              {filteredContacts.length} contact{filteredContacts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="last_contact">Last Contact</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Relationship:</span>
                <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Type:</span>
                <Select value={contactTypeFilter} onValueChange={setContactTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading contacts...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredContacts.length === 0 && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Users2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              No contacts found. Build your professional network!
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>
      )}

      {/* Contacts Grid */}
      {!loading && !error && filteredContacts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(contact.first_name, contact.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base mb-1 truncate">
                      {contact.first_name} {contact.last_name}
                    </CardTitle>
                    {contact.current_title && (
                      <CardDescription className="text-xs truncate">
                        {contact.current_title}
                        {contact.current_company && ` @ ${contact.current_company}`}
                      </CardDescription>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${RELATIONSHIP_COLORS[contact.relationship_strength]} text-white text-xs`}>
                        {RELATIONSHIP_LABELS[contact.relationship_strength]}
                      </Badge>
                      {contact.contact_type && (
                        <Badge variant="outline" className="text-xs">
                          {CONTACT_TYPE_LABELS[contact.contact_type as keyof typeof CONTACT_TYPE_LABELS] || contact.contact_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="truncate hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <a
                        href={`tel:${contact.phone}`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.last_contact_date && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Last contact {formatDistanceToNow(new Date(contact.last_contact_date), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  {contact.next_followup_date && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Calendar className="h-3 w-3 text-amber-500" />
                      <span>
                        Follow up {new Date(contact.next_followup_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {contact.interaction_count > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <MessageSquare className="h-3 w-3" />
                      <span>{contact.interaction_count} interactions</span>
                    </div>
                  )}
                  {contact.referral_status && contact.referral_status !== "none" && (
                    <div className="flex items-center gap-2">
                      <Badge className={`${REFERRAL_STATUS_COLORS[contact.referral_status as keyof typeof REFERRAL_STATUS_COLORS]} text-white text-xs`}>
                        Referral: {contact.referral_status}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Notes Preview */}
                {contact.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t">
                    {contact.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t gap-2">
                  <div className="flex items-center gap-1">
                    {contact.linkedin_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(contact.linkedin_url, "_blank")}
                      >
                        <Linkedin className="h-3 w-3 mr-1" />
                        LinkedIn
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateContactDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      {selectedContact && (
        <EditContactDialog
          contact={selectedContact}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  );
}
