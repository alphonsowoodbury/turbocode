"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  FileText,
  Tags,
  FileCode2,
  Star,
  Compass,
  ChevronDown,
  Flag,
  Target,
  PanelLeftClose,
  PanelLeftOpen,
  BookMarked,
  Radio,
  Calendar,
  StickyNote,
  Briefcase,
  User,
  Search,
  Users,
  Handshake,
  Package,
  DollarSign,
  FileCheck,
  Award,
  Sparkles,
} from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useIssues } from "@/hooks/use-issues";
import { useSidebar } from "@/hooks/use-sidebar";
import { WidgetContainer, type Widget } from "@/components/widgets/widget-container";
import { CalendarWidget } from "@/components/widgets/calendar-widget";
import { NotesWidget } from "@/components/widgets/notes-widget";

const navigation = [
  { name: "Discovery", href: "/discoveries", icon: Compass },
  { name: "Tags", href: "/tags", icon: Tags },
];

const widgets: Widget[] = [
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    component: CalendarWidget,
  },
  {
    id: "notes",
    label: "Quick Notes",
    icon: StickyNote,
    component: NotesWidget,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [workExpanded, setWorkExpanded] = useState(true);
  const [literatureExpanded, setLiteratureExpanded] = useState(true);
  const { data: favorites = [] } = useFavorites();
  const { data: allIssues = [] } = useIssues();
  const { isCollapsed, toggle } = useSidebar();

  const favoriteIssues = favorites
    .filter((f) => f.item_type === "issue")
    .map((f) => allIssues.find((i) => i.id === f.item_id))
    .filter(Boolean)
    .slice(0, 5);

  const isProjectsActive = pathname.startsWith("/projects") ||
                           pathname.startsWith("/issues") ||
                           pathname.startsWith("/milestones") ||
                           pathname.startsWith("/initiatives") ||
                           pathname.startsWith("/blueprints") ||
                           pathname.startsWith("/documents");

  const isWorkActive = pathname.startsWith("/work");

  const isLiteratureActive = pathname.startsWith("/literature") ||
                             pathname.startsWith("/podcasts");

  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            T
          </div>
          {!isCollapsed && <span>Turbo</span>}
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8 absolute left-2"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator className="my-0" />

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Favorites */}
        {!isCollapsed && favoriteIssues.length > 0 && (
          <div className="p-2 space-y-1">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Favorites</div>
            {favoriteIssues.map((issue) => (
              <Link key={issue.id} href={`/issues/${issue.id}`}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 h-7 px-2 text-xs",
                    pathname === `/issues/${issue.id}` && "bg-secondary"
                  )}
                >
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <span className="truncate">{issue.title}</span>
                </Button>
              </Link>
            ))}
          </div>
        )}

        {!isCollapsed && favoriteIssues.length > 0 && <Separator className="my-0" />}

        {/* Navigation */}
        <nav className="space-y-1 p-2">
        {/* Dashboard */}
        <Link href="/">
          <Button
            variant={pathname === "/" ? "secondary" : "ghost"}
            className={cn(
              "w-full gap-3",
              isCollapsed ? "justify-center px-2" : "justify-start",
              pathname === "/" && "bg-secondary"
            )}
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && "Dashboard"}
          </Button>
        </Link>

        {/* Calendar */}
        <Link href="/calendar">
          <Button
            variant={pathname === "/calendar" ? "secondary" : "ghost"}
            className={cn(
              "w-full gap-3",
              isCollapsed ? "justify-center px-2" : "justify-start",
              pathname === "/calendar" && "bg-secondary"
            )}
          >
            <Calendar className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && "Calendar"}
          </Button>
        </Link>

        {/* Projects Section with Submenu */}
        {!isCollapsed ? (
          <div>
            <div
              className={cn(
                "flex items-center w-full rounded-md",
                isProjectsActive && "bg-secondary"
              )}
            >
              <Link href="/projects" className="flex-1">
                <Button
                  variant={isProjectsActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 rounded-r-none",
                    isProjectsActive && "bg-secondary hover:bg-secondary"
                  )}
                >
                  <FolderKanban className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">Projects</span>
                </Button>
              </Link>
              <Button
                variant={isProjectsActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "px-2 rounded-l-none border-l",
                  isProjectsActive && "bg-secondary hover:bg-secondary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectsExpanded(!projectsExpanded);
                }}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    projectsExpanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              </Button>
            </div>

            {/* Projects Submenu */}
            {projectsExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
                <Link href="/issues">
                  <Button
                    variant={pathname.startsWith("/issues") ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname.startsWith("/issues") && "bg-secondary"
                    )}
                  >
                    <ListTodo className="h-4 w-4" />
                    Issues
                  </Button>
                </Link>

                <Link href="/milestones">
                  <Button
                    variant={pathname.startsWith("/milestones") ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname.startsWith("/milestones") && "bg-secondary"
                    )}
                  >
                    <Flag className="h-4 w-4" />
                    Milestones
                  </Button>
                </Link>

                <Link href="/initiatives">
                  <Button
                    variant={pathname.startsWith("/initiatives") ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname.startsWith("/initiatives") && "bg-secondary"
                    )}
                  >
                    <Target className="h-4 w-4" />
                    Initiatives
                  </Button>
                </Link>

                <Link href="/documents">
                  <Button
                    variant={pathname.startsWith("/documents") ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname.startsWith("/documents") && "bg-secondary"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Documents
                  </Button>
                </Link>

                <Link href="/blueprints">
                  <Button
                    variant={pathname.startsWith("/blueprints") ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname.startsWith("/blueprints") && "bg-secondary"
                    )}
                  >
                    <FileCode2 className="h-4 w-4" />
                    Blueprints
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Link href="/projects">
            <Button
              variant={isProjectsActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-center px-2",
                isProjectsActive && "bg-secondary"
              )}
            >
              <FolderKanban className="h-4 w-4 flex-shrink-0" />
            </Button>
          </Link>
        )}

        {/* Work Section with Submenu */}
        {!isCollapsed ? (
          <div>
            <div
              className={cn(
                "flex items-center w-full rounded-md",
                isWorkActive && "bg-secondary"
              )}
            >
              <Link href="/work" className="flex-1">
                <Button
                  variant={isWorkActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 rounded-r-none",
                    isWorkActive && "bg-secondary hover:bg-secondary"
                  )}
                >
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">Work</span>
                </Button>
              </Link>
              <Button
                variant={isWorkActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "px-2 rounded-l-none border-l",
                  isWorkActive && "bg-secondary hover:bg-secondary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setWorkExpanded(!workExpanded);
                }}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    workExpanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              </Button>
            </div>

            {/* Work Submenu */}
            {workExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
                <Link href="/work/job-search">
                  <Button
                    variant={pathname === "/work/job-search" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/job-search" && "bg-secondary"
                    )}
                  >
                    <Search className="h-4 w-4" />
                    Job Search
                  </Button>
                </Link>

                <Link href="/work/applications">
                  <Button
                    variant={pathname === "/work/applications" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/applications" && "bg-secondary"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Applications
                  </Button>
                </Link>

                <Link href="/work/jobs">
                  <Button
                    variant={pathname === "/work/jobs" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/jobs" && "bg-secondary"
                    )}
                  >
                    <Briefcase className="h-4 w-4" />
                    Jobs
                  </Button>
                </Link>

                <Link href="/work/contracts">
                  <Button
                    variant={pathname === "/work/contracts" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/contracts" && "bg-secondary"
                    )}
                  >
                    <Package className="h-4 w-4" />
                    Contracts
                  </Button>
                </Link>

                <Link href="/work/clients">
                  <Button
                    variant={pathname === "/work/clients" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/clients" && "bg-secondary"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Clients
                  </Button>
                </Link>

                <Link href="/work/invoices">
                  <Button
                    variant={pathname === "/work/invoices" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/invoices" && "bg-secondary"
                    )}
                  >
                    <DollarSign className="h-4 w-4" />
                    Invoices
                  </Button>
                </Link>

                <Link href="/work/proposals">
                  <Button
                    variant={pathname === "/work/proposals" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/proposals" && "bg-secondary"
                    )}
                  >
                    <FileCheck className="h-4 w-4" />
                    Proposals
                  </Button>
                </Link>

                <Link href="/work/profile">
                  <Button
                    variant={pathname === "/work/profile" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/profile" && "bg-secondary"
                    )}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </Link>

                <Link href="/work/experiences">
                  <Button
                    variant={pathname === "/work/experiences" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/experiences" && "bg-secondary"
                    )}
                  >
                    <Award className="h-4 w-4" />
                    Experiences
                  </Button>
                </Link>

                <Link href="/work/skills">
                  <Button
                    variant={pathname === "/work/skills" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/skills" && "bg-secondary"
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    Skills
                  </Button>
                </Link>

                <Link href="/work/network">
                  <Button
                    variant={pathname === "/work/network" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname === "/work/network" && "bg-secondary"
                    )}
                  >
                    <Handshake className="h-4 w-4" />
                    Network
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Link href="/work">
            <Button
              variant={isWorkActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-center px-2",
                isWorkActive && "bg-secondary"
              )}
            >
              <Briefcase className="h-4 w-4 flex-shrink-0" />
            </Button>
          </Link>
        )}

        {/* Literature Section with Submenu */}
        {!isCollapsed ? (
          <div>
            <div
              className={cn(
                "flex items-center w-full rounded-md",
                isLiteratureActive && "bg-secondary"
              )}
            >
              <Link href="/literature" className="flex-1">
                <Button
                  variant={isLiteratureActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 rounded-r-none",
                    isLiteratureActive && "bg-secondary hover:bg-secondary"
                  )}
                >
                  <BookMarked className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">Literature</span>
                </Button>
              </Link>
              <Button
                variant={isLiteratureActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "px-2 rounded-l-none border-l",
                  isLiteratureActive && "bg-secondary hover:bg-secondary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setLiteratureExpanded(!literatureExpanded);
                }}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    literatureExpanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              </Button>
            </div>

            {/* Literature Submenu */}
            {literatureExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
                <Link href="/podcasts">
                  <Button
                    variant={pathname.startsWith("/podcasts") ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm",
                      pathname.startsWith("/podcasts") && "bg-secondary"
                    )}
                  >
                    <Radio className="h-4 w-4" />
                    Podcasts
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Link href="/literature">
            <Button
              variant={isLiteratureActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-center px-2",
                isLiteratureActive && "bg-secondary"
              )}
            >
              <BookMarked className="h-4 w-4 flex-shrink-0" />
            </Button>
          </Link>
        )}

        {/* Other Navigation Items */}
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full gap-3",
                  isCollapsed ? "justify-center px-2" : "justify-start",
                  isActive && "bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && item.name}
              </Button>
            </Link>
          );
        })}
        </nav>
      </div>

      {/* Widgets - Fixed at bottom */}
      {!isCollapsed && (
        <div className="flex-none p-2">
          <WidgetContainer
            widgets={widgets}
            defaultWidget="calendar"
            defaultMinimized={false}
          />
        </div>
      )}

      <Separator className="flex-none" />

      {/* Settings - Fixed at bottom */}
      <div className="flex-none p-2">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full gap-3",
              isCollapsed ? "justify-center px-2" : "justify-start"
            )}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && "Settings"}
          </Button>
        </Link>
      </div>
    </div>
  );
}