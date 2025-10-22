"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

interface WorkspaceLayoutProps {
  header?: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  statusBar: ReactNode;
  terminalPanel?: ReactNode;
  terminalOpen?: boolean;
  terminalHeight?: number;
  chatSidebar?: ReactNode;
  chatOpen?: boolean;
  chatWidth?: number;
}

export function WorkspaceLayout({
  header,
  sidebar,
  children,
  statusBar,
  terminalPanel,
  terminalOpen = false,
  terminalHeight = 300,
  chatSidebar,
  chatOpen = false,
  chatWidth = 400,
}: WorkspaceLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "workspace-layout h-screen w-screen overflow-hidden",
        "grid transition-all duration-200 ease-out"
      )}
      style={{
        gridTemplateColumns: `${isCollapsed ? "64px" : "256px"} 1fr ${chatOpen ? `${chatWidth}px` : "0px"}`,
        gridTemplateRows: header
          ? `56px 1fr ${terminalOpen ? `${terminalHeight}px` : "0px"} 28px`
          : `1fr ${terminalOpen ? `${terminalHeight}px` : "0px"} 28px`,
        gridTemplateAreas: header
          ? `
            "header header header"
            "sidebar workspace chat"
            "sidebar terminal chat"
            "sidebar status status"
          `
          : `
            "sidebar workspace chat"
            "sidebar terminal chat"
            "sidebar status status"
          `,
      }}
      data-terminal-open={terminalOpen}
      data-sidebar-collapsed={isCollapsed}
      data-chat-open={chatOpen}
    >
      {/* Header */}
      {header && (
        <div
          className="border-b bg-background"
          style={{ gridArea: "header" }}
        >
          {header}
        </div>
      )}

      {/* Sidebar */}
      <div
        className="border-r bg-background"
        style={{ gridArea: "sidebar" }}
      >
        {sidebar}
      </div>

      {/* Workspace */}
      <div
        className="bg-background overflow-y-auto"
        style={{ gridArea: "workspace" }}
      >
        {children}
      </div>

      {/* Terminal Panel */}
      {terminalPanel && (
        <div
          className={cn(
            "border-t bg-background overflow-hidden transition-all duration-200 ease-out",
            !terminalOpen && "hidden"
          )}
          style={{ gridArea: "terminal" }}
        >
          {terminalPanel}
        </div>
      )}

      {/* Status Bar */}
      <div
        className="border-t bg-muted/50"
        style={{ gridArea: "status" }}
      >
        {statusBar}
      </div>

      {/* Chat Sidebar */}
      {chatSidebar && (
        <div
          className={cn(
            "bg-background overflow-hidden transition-all duration-200 ease-out",
            !chatOpen && "hidden"
          )}
          style={{ gridArea: "chat" }}
        >
          {chatSidebar}
        </div>
      )}
    </div>
  );
}
