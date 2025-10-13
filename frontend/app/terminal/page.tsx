"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import axios from "axios";

// Import Terminal dynamically to avoid SSR issues with xterm.js
const Terminal = dynamic(
  () => import("@/components/terminal/terminal").then((mod) => mod.Terminal),
  { ssr: false }
);

interface TerminalTab {
  id: string;
  sessionId: string;
  title: string;
}

export default function TerminalPage() {
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createNewSession = async () => {
    setIsCreating(true);
    try {
      const response = await axios.post("http://localhost:8000/api/v1/terminal/sessions", {
        user_id: "default-user", // TODO: Get from auth context
        shell: "/bin/bash",
        working_directory: "~/",
      });

      const sessionId = response.data.session_id;
      const newTab: TerminalTab = {
        id: sessionId,
        sessionId: sessionId,
        title: `Terminal ${tabs.length + 1}`,
      };

      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    } catch (error) {
      console.error("Failed to create terminal session:", error);
      alert("Failed to create terminal session");
    } finally {
      setIsCreating(false);
    }
  };

  const closeTab = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      try {
        await axios.delete(`http://localhost:8000/api/v1/terminal/sessions/${tab.sessionId}`);
      } catch (error) {
        console.error("Failed to close session:", error);
      }
    }

    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[0].id : null);
    }
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Tab Bar */}
      <div className="flex items-center gap-2 p-2 bg-muted border-b">
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                activeTabId === tab.id
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span>{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={createNewSession}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Terminal
        </Button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab ? (
          <Terminal
            key={activeTab.sessionId}
            sessionId={activeTab.sessionId}
            onClose={() => closeTab(activeTab.id)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg mb-4">No active terminal</p>
            <Button onClick={createNewSession} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Terminal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
