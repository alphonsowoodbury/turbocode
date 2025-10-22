"use client";

import { Button } from "@/components/ui/button";
import { Terminal, GitBranch, Circle, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  terminalCount?: number;
  terminalOpen?: boolean;
  onTerminalToggle?: () => void;
  chatOpen?: boolean;
  onChatToggle?: () => void;
  gitBranch?: string;
  projectName?: string;
  issuesCount?: number;
  isLive?: boolean;
}

export function StatusBar({
  terminalCount = 0,
  terminalOpen = false,
  onTerminalToggle,
  chatOpen = false,
  onChatToggle,
  gitBranch = "main",
  projectName = "Turbo Code",
  issuesCount = 0,
  isLive = true,
}: StatusBarProps) {
  return (
    <div className="flex h-7 items-center justify-between px-3 text-xs text-muted-foreground">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Terminal Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 gap-1.5 px-2 text-xs",
            terminalOpen && "bg-accent text-accent-foreground"
          )}
          onClick={onTerminalToggle}
          title={`Toggle terminal (${terminalCount} active sessions)`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Terminal</span>
          {terminalCount > 0 && (
            <span className="text-muted-foreground">({terminalCount})</span>
          )}
        </Button>

        {/* Chat Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 gap-1.5 px-2 text-xs",
            chatOpen && "bg-accent text-accent-foreground"
          )}
          onClick={onChatToggle}
          title="Toggle mentor chat (⌘M)"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Chat</span>
        </Button>

        {/* Git Branch */}
        <div className="flex items-center gap-1.5" title={`Current branch: ${gitBranch}`}>
          <GitBranch className="h-3.5 w-3.5" />
          <span>{gitBranch}</span>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-4">
        {/* Project Name */}
        <span className="font-medium">{projectName}</span>

        {/* Issues Count */}
        {issuesCount > 0 && (
          <span>Issues: {issuesCount} open</span>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          <Circle
            className={cn(
              "h-2 w-2 fill-current",
              isLive ? "text-green-500" : "text-red-500"
            )}
          />
          <span>{isLive ? "Live" : "Offline"}</span>
        </div>

        {/* User Avatar */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          title="User menu"
        >
          <User className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
