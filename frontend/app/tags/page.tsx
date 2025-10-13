"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tags } from "lucide-react";

export default function TagsPage() {
  return (
    <div className="flex h-full flex-col">
      <Header
        title="Tags"
        createLabel="New Tag"
        onCreateClick={() => {
          console.log("Create tag clicked");
        }}
      />

      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tag management coming soon. This will allow you to categorize and
              organize projects, issues, and documents with colored tags.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
