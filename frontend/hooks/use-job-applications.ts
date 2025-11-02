import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface JobApplication {
  id: string;
  position_title: string;
  company_name: string;
  company_id?: string;
  job_url?: string;
  job_description?: string;
  status: 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'accepted' | 'declined';
  application_date?: string;
  deadline?: string;
  salary_range?: string;
  location?: string;
  work_mode?: 'remote' | 'hybrid' | 'onsite';
  resume_id?: string;
  cover_letter_id?: string;
  notes?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobApplicationData {
  position_title: string;
  company_name: string;
  company_id?: string;
  job_url?: string;
  job_description?: string;
  status?: string;
  application_date?: string;
  deadline?: string;
  salary_range?: string;
  location?: string;
  work_mode?: string;
  notes?: string;
}

export function useJobApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async (filters?: {
    status?: string;
    company_id?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.company_id) params.append('company_id', filters.company_id);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const url = `${API_BASE_URL}/api/v1/job-applications/?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (data: CreateJobApplicationData): Promise<JobApplication> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/job-applications/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create application');
    }

    const newApplication = await response.json();
    setApplications((prev) => [newApplication, ...prev]);
    return newApplication;
  };

  const updateApplication = async (
    id: string,
    data: Partial<CreateJobApplicationData>
  ): Promise<JobApplication> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/job-applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update application');
    }

    const updatedApplication = await response.json();
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? updatedApplication : app))
    );
    return updatedApplication;
  };

  const deleteApplication = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/job-applications/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete application');
    }

    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  };
}
