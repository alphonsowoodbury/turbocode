"use client";

import { ReactNode } from "react";
import { WorkspaceLayout } from "./workspace-layout";
import { StatusBar } from "./status-bar";
import { TerminalPanel } from "./terminal-panel";
import { Sidebar } from "./sidebar";
import { useTerminalPanel } from "@/hooks/use-terminal-panel";
import { useTerminalShortcuts } from "@/hooks/use-terminal-shortcuts";

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isOpen, height, sessions, toggle } = useTerminalPanel();

  // Enable terminal keyboard shortcuts
  useTerminalShortcuts();

  return (
    <WorkspaceLayout
      sidebar={<Sidebar />}
      statusBar={
        <StatusBar
          terminalCount={sessions.length}
          terminalOpen={isOpen}
          onTerminalToggle={toggle}
          gitBranch="main"
          projectName="Turbo Code"
          issuesCount={5}
          isLive={true}
        />
      }
      terminalPanel={<TerminalPanel />}
      terminalOpen={isOpen}
      terminalHeight={height}
    >
      {children}
    </WorkspaceLayout>
  );
}
