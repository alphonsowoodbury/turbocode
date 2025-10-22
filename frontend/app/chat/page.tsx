"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStaff } from "@/hooks/use-staff";
import { StaffListSidebar } from "@/components/chat/staff-list-sidebar";
import { StaffChat } from "@/components/staff/staff-chat";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const staffIdFromUrl = searchParams.get("id");

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(staffIdFromUrl);
  const { data: allStaff = [], isLoading } = useStaff();

  // Sync URL with selected staff
  useEffect(() => {
    if (staffIdFromUrl && staffIdFromUrl !== selectedStaffId) {
      setSelectedStaffId(staffIdFromUrl);
    }
  }, [staffIdFromUrl, selectedStaffId]);

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    router.push(`/chat?id=${staffId}`, { scroll: false });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-background">
      {/* Left Sidebar - Staff List */}
      <div className="w-80 border-r flex-shrink-0">
        <StaffListSidebar
          staff={allStaff}
          selectedStaffId={selectedStaffId}
          onSelectStaff={handleSelectStaff}
          isLoading={isLoading}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedStaffId ? (
          <StaffChat staffId={selectedStaffId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-12 text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Chat Selected</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Select a staff member from the sidebar to start a conversation
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading chat...</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
