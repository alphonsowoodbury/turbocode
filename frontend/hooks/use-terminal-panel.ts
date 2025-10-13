import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createTerminalSession, endTerminalSession } from "@/lib/api/terminal";

export interface TerminalSession {
  id: string; // Frontend ID
  sessionId: string; // Backend session ID
  title: string;
  shell: string;
  isConnected: boolean;
  createdAt: Date;
  projectId?: string;
  issueId?: string;
}

interface TerminalPanelState {
  // Panel state
  isOpen: boolean;
  height: number; // 200-80vh

  // Terminal sessions
  sessions: TerminalSession[];
  activeSessionId: string | null;

  // Actions
  toggle: () => void;
  open: () => void;
  close: () => void;
  setHeight: (height: number) => void;

  // Session management
  createSession: (options?: SessionOptions) => Promise<string>;
  closeSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;

  // Context injection
  createSessionWithContext: (
    projectId?: string,
    issueId?: string
  ) => Promise<string>;
}

export interface SessionOptions {
  shell?: string;
  workingDirectory?: string;
  environmentVars?: Record<string, string>;
  projectId?: string;
  issueId?: string;
  title?: string;
}

const DEFAULT_HEIGHT = 300;
const MIN_HEIGHT = 200;
const MAX_HEIGHT_VH = 80;

export const useTerminalPanel = create<TerminalPanelState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOpen: false,
      height: DEFAULT_HEIGHT,
      sessions: [],
      activeSessionId: null,

      // Toggle panel open/closed
      toggle: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      // Open panel
      open: () => {
        set({ isOpen: true });
      },

      // Close panel
      close: () => {
        set({ isOpen: false });
      },

      // Set panel height with constraints
      setHeight: (height: number) => {
        const maxHeight = (window.innerHeight * MAX_HEIGHT_VH) / 100;
        const constrainedHeight = Math.max(
          MIN_HEIGHT,
          Math.min(height, maxHeight)
        );
        set({ height: constrainedHeight });
      },

      // Create a new terminal session
      createSession: async (options?: SessionOptions) => {
        try {
          // Call API to create session
          const response = await createTerminalSession({
            user_id: "default-user", // TODO: Get from auth context
            shell: options?.shell || "/bin/bash",
            working_directory: options?.workingDirectory || "~",
            environment_vars: options?.environmentVars,
            project_id: options?.projectId,
            issue_id: options?.issueId,
          });

          // Create session object
          const session: TerminalSession = {
            id: response.id,
            sessionId: response.session_id,
            title: options?.title || `Terminal ${get().sessions.length + 1}`,
            shell: response.shell,
            isConnected: true,
            createdAt: new Date(response.created_at),
            projectId: response.project_id,
            issueId: response.issue_id,
          };

          // Add to sessions
          set((state) => ({
            sessions: [...state.sessions, session],
            activeSessionId: session.sessionId,
            isOpen: true, // Auto-open panel when creating session
          }));

          return session.sessionId;
        } catch (error) {
          console.error("Failed to create terminal session:", error);
          throw error;
        }
      },

      // Close a terminal session
      closeSession: (sessionId: string) => {
        const { sessions, activeSessionId } = get();
        const session = sessions.find((s) => s.sessionId === sessionId);

        if (session) {
          // Call API to end session
          endTerminalSession(sessionId).catch((error) => {
            console.error("Failed to end terminal session:", error);
          });

          // Remove from sessions
          const newSessions = sessions.filter((s) => s.sessionId !== sessionId);

          // Update active session if needed
          let newActiveSessionId = activeSessionId;
          if (activeSessionId === sessionId) {
            newActiveSessionId = newSessions.length > 0
              ? newSessions[newSessions.length - 1].sessionId
              : null;
          }

          // Close panel if no sessions left
          const shouldClose = newSessions.length === 0;

          set({
            sessions: newSessions,
            activeSessionId: newActiveSessionId,
            isOpen: !shouldClose,
          });
        }
      },

      // Set active session
      setActiveSession: (sessionId: string) => {
        const { sessions } = get();
        const session = sessions.find((s) => s.sessionId === sessionId);
        if (session) {
          set({ activeSessionId: sessionId });
        }
      },

      // Create session with project/issue context
      createSessionWithContext: async (projectId?: string, issueId?: string) => {
        let title = "Terminal";
        if (projectId) {
          title += ` (Project)`;
        }
        if (issueId) {
          title += ` (Issue)`;
        }

        return get().createSession({
          projectId,
          issueId,
          title,
        });
      },
    }),
    {
      name: "terminal-panel-storage",
      // Only persist these fields
      partialize: (state) => ({
        isOpen: state.isOpen,
        height: state.height,
        // Don't persist sessions - they need to be restored from API
      }),
    }
  )
);