"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Search, Plus, Command } from "lucide-react";

interface HeaderProps {
  title: string;
  onCreateClick?: () => void;
  createLabel?: string;
  children?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function Header({ title, onCreateClick, createLabel, children, breadcrumbs }: HeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <>
            <Breadcrumb items={breadcrumbs} />
            <span className="text-muted-foreground">/</span>
          </>
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {!children && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 pl-9 pr-4"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>

            {/* Create button */}
            {onCreateClick && (
              <Button onClick={onCreateClick} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {createLabel || "Create"}
              </Button>
            )}
          </>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Custom children */}
        {children}
      </div>
    </div>
  );
}