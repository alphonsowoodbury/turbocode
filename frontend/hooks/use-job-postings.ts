"use client";

import { useState, useEffect } from "react";

export interface JobPosting {
  id: string;
  source: string;
  source_url: string;
  application_url?: string | null;
  external_id: string;
  company_id?: string | null;
  company_name: string;
  job_title: string;
  job_description?: string;
  location?: string;
  remote_policy: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency: string;
  required_skills?: string[] | null;
  preferred_skills?: string[] | null;
  required_keywords?: string[] | null;
  status: string;
  match_score?: number | null;
  match_reasons?: {
    title_match?: boolean | string;
    salary_match?: boolean;
    keyword_matches?: string[];
    matched_keywords?: string[];
    remote_match?: boolean;
    salary_meets_minimum?: boolean;
    [key: string]: any;
  };
  posted_date?: string | null;
  expires_date?: string | null;
  discovered_date: string;
  interest_level?: number | null;
  interest_notes?: string | null;
  raw_data?: any;
  created_at: string;
  updated_at: string;
}

interface UseJobPostingsOptions {
  status?: string;
  source?: string;
  min_score?: number;
  limit?: number;
  offset?: number;
}

export function useJobPostings(options: UseJobPostingsOptions = {}) {
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.append("status", options.status);
      if (options.source) params.append("source", options.source);
      if (options.min_score) params.append("min_score", options.min_score.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.offset) params.append("offset", options.offset.toString());

      const response = await fetch(`/api/v1/job-search/postings?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch job postings: ${response.statusText}`);
      }

      const data = await response.json();
      setPostings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching job postings:", err);
    } finally {
      setLoading(false);
    }
  };

  const updatePosting = async (jobId: string, updates: Partial<JobPosting>) => {
    try {
      const response = await fetch(`/api/v1/job-search/postings/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update job posting: ${response.statusText}`);
      }

      const updated = await response.json();

      // Update local state
      setPostings((prev) =>
        prev.map((p) => (p.id === jobId ? updated : p))
      );

      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update posting");
      console.error("Error updating job posting:", err);
      throw err;
    }
  };

  const updateStatus = async (jobId: string, status: string) => {
    return updatePosting(jobId, { status });
  };

  const updateInterest = async (jobId: string, level: number, notes?: string) => {
    return updatePosting(jobId, {
      interest_level: level,
      interest_notes: notes
    });
  };

  useEffect(() => {
    fetchPostings();
  }, [
    options.status,
    options.source,
    options.min_score,
    options.limit,
    options.offset,
  ]);

  return {
    postings,
    loading,
    error,
    refetch: fetchPostings,
    updatePosting,
    updateStatus,
    updateInterest,
  };
}
