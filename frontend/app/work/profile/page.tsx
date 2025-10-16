"use client";

import { PageLayout } from "@/components/layout/page-layout";

export default function CareerProfilePage() {
  return (
    <PageLayout title="Profile">
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No profile data yet. Start building your professional profile!
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
