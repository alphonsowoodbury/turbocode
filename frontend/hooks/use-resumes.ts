"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";

const API_BASE = "http://localhost:8001/api/v1";

// Types
export interface Resume {
  id: string;
  title: string;
  file_path: string | null;
  file_type: string;
  is_primary: boolean;
  target_role: string | null;
  target_company: string | null;
  parsed_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  sections: ResumeSection[];
}

export interface ResumeSection {
  id: string;
  resume_id: string;
  section_type: string;
  title: string;
  content: string;
  order: number;
  is_active: boolean;
  section_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ResumeUploadResponse {
  resume_id: string;
  file_path: string;
  message: string;
}

// Fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook
export function useResumes() {
  const { data, error, isLoading } = useSWR<{ resumes: Resume[]; total: number }>(
    `${API_BASE}/resumes`,
    fetcher
  );

  const uploadResume = async (
    file: File,
    title: string,
    targetRole?: string,
    targetCompany?: string,
    useAiExtraction: boolean = true
  ): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    if (targetRole) formData.append("target_role", targetRole);
    if (targetCompany) formData.append("target_company", targetCompany);
    formData.append("use_ai_extraction", String(useAiExtraction));

    const response = await fetch(`${API_BASE}/resumes/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to upload resume");
    }

    const result = await response.json();

    // Revalidate list
    mutate(`${API_BASE}/resumes`);

    return result;
  };

  return {
    resumes: data?.resumes || [],
    total: data?.total || 0,
    isLoading,
    error,
    uploadResume,
  };
}

export function useResume(id: string | null) {
  const { data, error, isLoading } = useSWR<Resume>(
    id ? `${API_BASE}/resumes/${id}` : null,
    fetcher
  );

  const updateResume = async (updates: Partial<Resume>) => {
    if (!id) return;

    const response = await fetch(`${API_BASE}/resumes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update resume");
    }

    // Revalidate
    mutate(`${API_BASE}/resumes/${id}`);
    mutate(`${API_BASE}/resumes`);
  };

  const setPrimary = async () => {
    if (!id) return;

    const response = await fetch(`${API_BASE}/resumes/${id}/set-primary`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to set as primary");
    }

    // Revalidate
    mutate(`${API_BASE}/resumes/${id}`);
    mutate(`${API_BASE}/resumes`);
  };

  const deleteResume = async () => {
    if (!id) return;

    const response = await fetch(`${API_BASE}/resumes/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete resume");
    }

    // Revalidate
    mutate(`${API_BASE}/resumes`);
  };

  return {
    resume: data || null,
    isLoading,
    error,
    updateResume,
    setPrimary,
    deleteResume,
  };
}

export function useResumeSections(resumeId: string | null, activeOnly: boolean = false) {
  const { data, error, isLoading } = useSWR<ResumeSection[]>(
    resumeId ? `${API_BASE}/resumes/${resumeId}/sections?active_only=${activeOnly}` : null,
    fetcher
  );

  const createSection = async (section: Partial<ResumeSection>) => {
    if (!resumeId) return;

    const response = await fetch(`${API_BASE}/resumes/${resumeId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(section),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create section");
    }

    // Revalidate
    mutate(`${API_BASE}/resumes/${resumeId}/sections?active_only=${activeOnly}`);
    mutate(`${API_BASE}/resumes/${resumeId}`);
  };

  const updateSection = async (sectionId: string, updates: Partial<ResumeSection>) => {
    if (!resumeId) return;

    const response = await fetch(`${API_BASE}/resumes/${resumeId}/sections/${sectionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update section");
    }

    // Revalidate
    mutate(`${API_BASE}/resumes/${resumeId}/sections?active_only=${activeOnly}`);
    mutate(`${API_BASE}/resumes/${resumeId}`);
  };

  const deleteSection = async (sectionId: string) => {
    if (!resumeId) return;

    const response = await fetch(`${API_BASE}/resumes/${resumeId}/sections/${sectionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete section");
    }

    // Revalidate
    mutate(`${API_BASE}/resumes/${resumeId}/sections?active_only=${activeOnly}`);
    mutate(`${API_BASE}/resumes/${resumeId}`);
  };

  const reorderSections = async (sectionOrders: Record<string, number>) => {
    if (!resumeId) return;

    const response = await fetch(`${API_BASE}/resumes/${resumeId}/sections/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sectionOrders),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to reorder sections");
    }

    // Revalidate
    mutate(`${API_BASE}/resumes/${resumeId}/sections?active_only=${activeOnly}`);
    mutate(`${API_BASE}/resumes/${resumeId}`);
  };

  return {
    sections: data || [],
    isLoading,
    error,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
  };
}
