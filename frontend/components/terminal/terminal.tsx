"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { getTerminalWebSocketUrl } from "@/lib/api/terminal";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  sessionId: string;
  onClose?: () => void;
}

// Dark theme colors
const darkTheme = {
  background: "#1e1e1e",
  foreground: "#d4d4d4",
  cursor: "#d4d4d4",
  cursorAccent: "#1e1e1e",
  selectionBackground: "#264f78",
  black: "#000000",
  red: "#cd3131",
  green: "#0dbc79",
  yellow: "#e5e510",
  blue: "#2472c8",
  magenta: "#bc3fbc",
  cyan: "#11a8cd",
  white: "#e5e5e5",
  brightBlack: "#666666",
  brightRed: "#f14c4c",
  brightGreen: "#23d18b",
  brightYellow: "#f5f543",
  brightBlue: "#3b8eea",
  brightMagenta: "#d670d6",
  brightCyan: "#29b8db",
  brightWhite: "#ffffff",
};

// Light theme colors
const lightTheme = {
  background: "#ffffff",
  foreground: "#383a42",
  cursor: "#383a42",
  cursorAccent: "#ffffff",
  selectionBackground: "#d7d7d7",
  black: "#383a42",
  red: "#e45649",
  green: "#50a14f",
  yellow: "#c18401",
  blue: "#0184bc",
  magenta: "#a626a4",
  cyan: "#0997b3",
  white: "#fafafa",
  brightBlack: "#4f525e",
  brightRed: "#e06c75",
  brightGreen: "#98c379",
  brightYellow: "#e5c07b",
  brightBlue: "#61afef",
  brightMagenta: "#c678dd",
  brightCyan: "#56b6c2",
  brightWhite: "#ffffff",
};

export function Terminal({ sessionId, onClose }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    if (!terminalRef.current) return;

    // Determine current theme
    const currentTheme = theme === "system" ? systemTheme : theme;
    const terminalTheme = currentTheme === "dark" ? darkTheme : lightTheme;

    // Create terminal instance
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: terminalTheme,
      rows: 24,
      cols: 80,
      scrollback: 1000,
      convertEol: true,
    });

    // Add addons
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect WebSocket
    const wsUrl = getTerminalWebSocketUrl(sessionId);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      term.writeln("Connected to terminal session...\r");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "output" && data.data) {
          term.write(data.data);
        }
      } catch {
        // If not JSON, write as is
        term.write(event.data);
      }
    };

    ws.onerror = (error) => {
      term.writeln(`\r\nWebSocket error: ${error}\r`);
      setIsConnected(false);
    };

    ws.onclose = () => {
      term.writeln("\r\nConnection closed.\r");
      setIsConnected(false);
    };

    wsRef.current = ws;

    // Handle terminal input
    term.onData((data) => {
      console.log("Terminal onData fired with:", data, "WebSocket state:", ws.readyState);
      if (ws.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({
          type: "input",
          data: data,
        });
        console.log("Sending to WebSocket:", message);
        ws.send(message);
      } else {
        console.log("WebSocket not open, state:", ws.readyState);
      }
    });

    // Focus the terminal to enable input
    term.focus();

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "resize",
            rows: term.rows,
            cols: term.cols,
          })
        );
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      ws.close();
      term.dispose();
    };
  }, [sessionId, theme, systemTheme]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-muted border-b">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          <span className="text-xs text-muted-foreground">
            Session: {sessionId.substring(0, 8)}...
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        )}
      </div>
      <div ref={terminalRef} className="flex-1 p-2" />
    </div>
  );
}
