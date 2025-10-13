"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Receipt } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InvoicesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("date");
  const [groupBy, setGroupBy] = useState<string>("none");

  return (
    <div className="flex h-full flex-col">
      <Header title="Invoices" />

      <div className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
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
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Group:</span>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                Filters will appear here when backend is implemented
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No invoices yet. Create one to track your billing!
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
