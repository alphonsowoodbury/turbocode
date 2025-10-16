"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { useSkills } from "@/hooks/use-skills";
import { CreateSkillDialog } from "@/components/skills/create-skill-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Filter, X, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const proficiencyColors = {
  beginner: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  intermediate: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  advanced: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  expert: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
};

const categoryColors = {
  technical: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  soft_skills: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  tools: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  languages: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  certifications: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  other: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
};

export default function SkillsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProficiency, setSelectedProficiency] = useState<string>("all");
  const [showEndorsedOnly, setShowEndorsedOnly] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<string>("none");
  const [sortBy, setSortBy] = useState<string>("updated");
  const { data: skills, isLoading, error } = useSkills();

  // Apply filters
  const filteredSkills = useMemo(() => {
    if (!skills) return [];

    let filtered = skills;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    if (selectedProficiency !== "all") {
      filtered = filtered.filter((s) => s.proficiency_level === selectedProficiency);
    }

    if (showEndorsedOnly === "endorsed") {
      filtered = filtered.filter((s) => s.is_endorsed);
    }

    return filtered;
  }, [skills, selectedCategory, selectedProficiency, showEndorsedOnly]);

  // Sort skills
  const sortedSkills = useMemo(() => {
    const sorted = [...filteredSkills];

    switch (sortBy) {
      case "updated":
        return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      case "created":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "proficiency":
        const proficiencyOrder = { expert: 0, advanced: 1, intermediate: 2, beginner: 3 };
        return sorted.sort((a, b) => proficiencyOrder[a.proficiency_level] - proficiencyOrder[b.proficiency_level]);
      default:
        return sorted;
    }
  }, [filteredSkills, sortBy]);

  // Group skills
  const groupedSkills = useMemo(() => {
    if (groupBy === "none") {
      return { "All Skills": sortedSkills };
    }

    const groups: Record<string, typeof sortedSkills> = {};

    sortedSkills.forEach((skill) => {
      let key = "";

      if (groupBy === "category") {
        key = skill.category.replace("_", " ");
      } else if (groupBy === "proficiency") {
        key = skill.proficiency_level;
      } else if (groupBy === "endorsed") {
        key = skill.is_endorsed ? "Endorsed" : "Not Endorsed";
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(skill);
    });

    return groups;
  }, [sortedSkills, groupBy]);

  const hasActiveFilters = selectedCategory !== "all" || selectedProficiency !== "all" || showEndorsedOnly !== "all";

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedProficiency("all");
    setShowEndorsedOnly("all");
  };

  return (
    <PageLayout title="Skills" isLoading={isLoading} error={error}>
      <div className="p-6">
        {/* Controls Bar */}
        <div className="mb-4 flex items-center justify-between">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                  {[selectedCategory !== "all", selectedProficiency !== "all", showEndorsedOnly !== "all"].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="proficiency">Proficiency</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Group:</span>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="proficiency">Proficiency</SelectItem>
                <SelectItem value="endorsed">Endorsed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="soft_skills">Soft Skills</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="languages">Languages</SelectItem>
                      <SelectItem value="certifications">Certifications</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Proficiency Level</label>
                  <Select value={selectedProficiency} onValueChange={setSelectedProficiency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Endorsed</label>
                  <Select value={showEndorsedOnly} onValueChange={setShowEndorsedOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="endorsed">Endorsed Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredSkills.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([groupName, groupSkills]) => (
              <div key={groupName}>
                {groupBy !== "none" && (
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground capitalize">
                    {groupName} ({groupSkills.length})
                  </h3>
                )}
                <div className="space-y-3">
                  {groupSkills.map((skill) => (
                    <Link key={skill.id} href={`/work/skills/${skill.id}`}>
                      <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{skill.name}</h3>
                                {skill.is_endorsed && (
                                  <Award className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              {skill.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {skill.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  Updated {formatDistanceToNow(new Date(skill.updated_at))}{" "}
                                  ago
                                </span>
                                {skill.years_of_experience && (
                                  <>
                                    <span>•</span>
                                    <span>{skill.years_of_experience} years</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs capitalize",
                                  categoryColors[skill.category]
                                )}
                              >
                                {skill.category.replace("_", " ")}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs capitalize",
                                  proficiencyColors[skill.proficiency_level]
                                )}
                              >
                                {skill.proficiency_level}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {skills && skills.length > 0
                  ? "No skills match the current filters."
                  : "No skills found. Add one to get started!"}
              </p>
              {hasActiveFilters && skills && skills.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateSkillDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </PageLayout>
  );
}
