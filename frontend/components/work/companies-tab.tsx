"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Building2, ExternalLink, Trash2, Edit, MapPin, Users, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCompanies, Company } from "@/hooks/use-companies";
import { toast } from "sonner";
import { CreateCompanyDialog } from "@/components/work/create-company-dialog";
import { EditCompanyDialog } from "@/components/work/edit-company-dialog";

const STATUS_COLORS = {
  researching: "bg-gray-500",
  interested: "bg-blue-500",
  applied: "bg-purple-500",
  interviewing: "bg-amber-500",
  offer: "bg-green-500",
  accepted: "bg-emerald-600",
  rejected: "bg-red-500",
  not_interested: "bg-slate-400",
};

const STATUS_LABELS = {
  researching: "Researching",
  interested: "Interested",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  not_interested: "Not Interested",
};

export function CompaniesTab() {
  const { companies, loading, error, deleteCompany } = useCompanies();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) {
      return;
    }

    try {
      await deleteCompany(id);
      toast.success("Company deleted successfully");
    } catch (err) {
      toast.error("Failed to delete company");
    }
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setEditDialogOpen(true);
  };

  // Filter and sort companies
  const filteredCompanies = companies
    .filter((company) => statusFilter === "all" || company.target_status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "status") {
        return a.target_status.localeCompare(b.target_status);
      }
      return 0;
    });

  return (
    <>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
          {!loading && (
            <span className="text-sm text-muted-foreground">
              {filteredCompanies.length} compan{filteredCompanies.length !== 1 ? "ies" : "y"}
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
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
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
                <span className="text-sm font-medium">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading companies...</p>
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
      {!loading && !error && filteredCompanies.length === 0 && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              {statusFilter === "all"
                ? "No companies yet. Add one to track your job search!"
                : `No ${statusFilter} companies found.`}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        </div>
      )}

      {/* Companies Grid */}
      {!loading && !error && filteredCompanies.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-1 truncate flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                      {company.name}
                    </CardTitle>
                    {company.industry && (
                      <CardDescription>{company.industry}</CardDescription>
                    )}
                  </div>
                  <Badge className={`${STATUS_COLORS[company.target_status]} text-white ml-2`}>
                    {STATUS_LABELS[company.target_status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Company Details */}
                <div className="space-y-2 text-sm">
                  {company.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{company.location}</span>
                      {company.remote_policy && (
                        <span className="ml-auto text-xs">{company.remote_policy}</span>
                      )}
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{company.size}</span>
                    </div>
                  )}
                  {company.glassdoor_rating && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-yellow-500">⭐</span>
                      <span>{company.glassdoor_rating.toFixed(1)} Glassdoor</span>
                    </div>
                  )}
                  {company.application_count > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {company.application_count} application{company.application_count !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Research Notes Preview */}
                {company.research_notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t">
                    {company.research_notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t gap-2">
                  <div className="flex items-center gap-1">
                    {company.website && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(company.website, "_blank")}
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Website
                      </Button>
                    )}
                    {company.careers_page_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(company.careers_page_url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Careers
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(company)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(company.id)}
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
      <CreateCompanyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      {selectedCompany && (
        <EditCompanyDialog
          company={selectedCompany}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  );
}
