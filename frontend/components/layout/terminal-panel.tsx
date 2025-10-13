"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalPanelProps {
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function TerminalPanel({
  children,
  onClose,
  className,
}: TerminalPanelProps) {
  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* Resize Handle */}
      <div
        className="group h-1 cursor-ns-resize border-t bg-border transition-colors hover:bg-accent"
        title="Drag to resize"
      >
        <div className="mx-auto h-full w-12 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-2 border-b bg-muted/50 px-2 py-1">
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {/* Placeholder tab - will be replaced with real tabs in Phase 2 */}
          <div className="flex items-center gap-2 rounded-md bg-background px-3 py-1.5 text-sm">
            <span>Terminal 1</span>
            <button
              onClick={onClose}
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 px-2"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="text-xs">New</span>
        </Button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden p-2">
        {children || (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Terminal content will appear here
          </div>
        )}
      </div>
    </div>
  );
}
