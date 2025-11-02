"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompaniesTab } from "@/components/work/companies-tab";
import { ContactsTab } from "@/components/work/contacts-tab";
import { Building2, Users2 } from "lucide-react";

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState("companies");

  return (
    <PageLayout title="Professional Network">
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-4">
            <CompaniesTab />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <ContactsTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
