"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Package,
  TrendingUp,
  Calendar,
  DollarSign,
  FileCheck,
  Users,
  Briefcase,
  Target,
  ArrowRight,
  MessageSquare,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function WorkDashboardPage() {
  return (
    <PageLayout title="Work">
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employment</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                W2 jobs (active + past)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Freelance</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">
                Combined total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Career Coach Highlight */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">Career Coach</CardTitle>
                  <CardDescription className="text-base">
                    Get personalized career advice, resume reviews, interview prep, and job search strategy from your AI career coach.
                  </CardDescription>
                  <div className="mt-4 flex gap-2">
                    <Link href="/mentors/e187f910-2c51-4656-aa02-30a181b3251a">
                      <Button className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Chat with Career Coach
                      </Button>
                    </Link>
                    <Link href="/work/applications">
                      <Button variant="outline">
                        View Applications
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <Link href="/work/applications">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Applications</CardTitle>
                      <CardDescription>Track job applications</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <Link href="/work/resumes">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Resumes</CardTitle>
                      <CardDescription>Manage & generate</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <Link href="/work/network">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Network</CardTitle>
                      <CardDescription>Companies & contacts</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest work-related activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No recent activity to display
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Activity from jobs and contracts will appear here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Actions</CardTitle>
              <CardDescription>
                Tasks and deadlines across all work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming actions
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Application deadlines and invoice due dates will appear here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Job Applications</CardTitle>
                <CardDescription>Current job search pipeline</CardDescription>
              </div>
              <Link href="/work/job-search">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No active applications
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Contracts</CardTitle>
                <CardDescription>Current freelance work</CardDescription>
              </div>
              <Link href="/work/contracts">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileCheck className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No active contracts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Income Overview</CardTitle>
            <CardDescription>
              Combined earnings from employment and freelance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">W2 Employment</span>
                </div>
                <span className="text-sm font-bold">$0</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Freelance Contracts</span>
                </div>
                <span className="text-sm font-bold">$0</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-semibold">Total Monthly Income</span>
                <span className="text-base font-bold">$0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
