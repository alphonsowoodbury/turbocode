"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTerminalPanel } from "@/hooks/use-terminal-panel";
import { ResizableHandle } from "./resizable-handle";

// Dynamically import Terminal with no SSR to avoid "self is not defined" errors
const Terminal = dynamic(
  () => import("@/components/terminal/terminal").then((mod) => mod.Terminal),
  { ssr: false }
);

interface TerminalPanelProps {
  className?: string;
}

const MIN_HEIGHT = 200;
const MAX_HEIGHT_VH = 80;

export function TerminalPanel({ className }: TerminalPanelProps) {
  const { sessions, activeSessionId, height, setActiveSession, closeSession, createSession, setHeight } = useTerminalPanel();
  const [isCreating, setIsCreating] = useState(false);

  const handleResize = (delta: number) => {
    // Only calculate maxHeight on client side
    if (typeof window !== 'undefined') {
      const maxHeight = (window.innerHeight * MAX_HEIGHT_VH) / 100;
      const newHeight = Math.max(MIN_HEIGHT, Math.min(height + delta, maxHeight));
      setHeight(newHeight);
    }
  };

  const handleNewTerminal = async () => {
    setIsCreating(true);
    try {
      await createSession();
    } catch (error) {
      console.error("Failed to create terminal:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseTab = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeSession(sessionId);
  };

  const activeSession = sessions.find((s) => s.sessionId === activeSessionId);

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* Resize Handle */}
      <ResizableHandle
        onResize={handleResize}
        minHeight={MIN_HEIGHT}
        maxHeight={typeof window !== 'undefined' ? (window.innerHeight * MAX_HEIGHT_VH) / 100 : 800}
      />

      {/* Tab Bar */}
      <div className="flex items-center gap-2 border-b bg-muted/50 px-2 py-1">
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {sessions.length === 0 ? (
            <div className="text-xs text-muted-foreground px-2">
              No active sessions
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => setActiveSession(session.sessionId)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  session.sessionId === activeSessionId
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                )}
              >
                <span className="max-w-[150px] truncate">{session.title}</span>
                <button
                  onClick={(e) => handleCloseTab(session.sessionId, e)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            ))
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 px-2"
          onClick={handleNewTerminal}
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">New</span>
        </Button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden">
        {activeSession ? (
          <Terminal
            key={activeSession.sessionId}
            sessionId={activeSession.sessionId}
          />
        ) : sessions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
            <p>No terminal sessions active</p>
            <Button
              size="sm"
              onClick={handleNewTerminal}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Terminal
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a terminal session
          </div>
        )}
      </div>
    </div>
  );
}
