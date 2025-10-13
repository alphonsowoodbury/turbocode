"use client";

import { ReactNode, useState } from "react";
import { WorkspaceLayout } from "./workspace-layout";
import { StatusBar } from "./status-bar";
import { TerminalPanel } from "./terminal-panel";
import { Sidebar } from "./sidebar";

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(300);

  const handleTerminalToggle = () => {
    setTerminalOpen(!terminalOpen);
  };

  const handleTerminalClose = () => {
    setTerminalOpen(false);
  };

  return (
    <WorkspaceLayout
      sidebar={<Sidebar />}
      statusBar={
        <StatusBar
          terminalCount={0}
          terminalOpen={terminalOpen}
          onTerminalToggle={handleTerminalToggle}
          gitBranch="main"
          projectName="Turbo Code"
          issuesCount={5}
          isLive={true}
        />
      }
      terminalPanel={
        <TerminalPanel onClose={handleTerminalClose}>
          <div className="p-4 font-mono text-sm">
            <p className="text-muted-foreground">
              Terminal panel will be fully integrated in Phase 2.
            </p>
            <p className="mt-2 text-muted-foreground">
              Press Ctrl+` to toggle, or click the Terminal button in the status bar.
            </p>
          </div>
        </TerminalPanel>
      }
      terminalOpen={terminalOpen}
      terminalHeight={terminalHeight}
    >
      {children}
    </WorkspaceLayout>
  );
}
