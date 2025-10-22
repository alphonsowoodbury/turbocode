"use client";

import { ReactNode } from "react";
import { WorkspaceLayout } from "./workspace-layout";
import { StatusBar } from "./status-bar";
import { TerminalPanel } from "./terminal-panel";
import { ChatSidebar } from "./chat-sidebar";
import { Sidebar } from "./sidebar";
import { useTerminalPanel } from "@/hooks/use-terminal-panel";
import { useChatSidebar } from "@/hooks/use-chat-sidebar";
import { useTerminalShortcuts } from "@/hooks/use-terminal-shortcuts";
import { useChatShortcuts } from "@/hooks/use-chat-shortcuts";

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isOpen, height, sessions, toggle } = useTerminalPanel();
  const { isOpen: chatOpen, width: chatWidth, toggle: toggleChat } = useChatSidebar();

  // Enable keyboard shortcuts
  useTerminalShortcuts();
  useChatShortcuts();

  return (
    <WorkspaceLayout
      sidebar={<Sidebar />}
      statusBar={
        <StatusBar
          terminalCount={sessions.length}
          terminalOpen={isOpen}
          onTerminalToggle={toggle}
          chatOpen={chatOpen}
          onChatToggle={toggleChat}
          gitBranch="main"
          projectName="Turbo Code"
          issuesCount={5}
          isLive={true}
        />
      }
      terminalPanel={<TerminalPanel />}
      terminalOpen={isOpen}
      terminalHeight={height}
      chatSidebar={<ChatSidebar />}
      chatOpen={chatOpen}
      chatWidth={chatWidth}
    >
      {children}
    </WorkspaceLayout>
  );
}
