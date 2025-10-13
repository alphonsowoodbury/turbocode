"use client";

import { useEffect } from "react";
import { useTerminalPanel } from "./use-terminal-panel";

/**
 * Hook to handle keyboard shortcuts for terminal operations
 */
export function useTerminalShortcuts() {
  const { toggle, createSession } = useTerminalPanel();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea (don't intercept)
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Don't intercept if user is typing in a form field
      // Exception: Allow Ctrl+` even in terminal itself
      if (isInputField && event.key !== "`") {
        return;
      }

      // Ctrl+` or Ctrl+J - Toggle terminal
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        (event.key === "`" || event.key === "j")
      ) {
        event.preventDefault();
        toggle();
      }

      // Ctrl+Shift+` - Create new terminal session
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "`"
      ) {
        event.preventDefault();
        createSession().catch((error) => {
          console.error("Failed to create terminal session:", error);
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggle, createSession]);
}