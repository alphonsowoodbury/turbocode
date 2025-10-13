"use client";

import { Header } from "@/components/layout/header";

export default function CareerProfilePage() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Profile" />

      <div className="flex-1 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No profile data yet. Start building your professional profile!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
