import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  remote_policy?: string;
  target_status: 'researching' | 'interested' | 'applied' | 'interviewing' | 'offer' | 'accepted' | 'rejected' | 'not_interested';
  application_count: number;
  research_notes?: string;
  culture_notes?: string;
  tech_stack?: Record<string, any>;
  glassdoor_rating?: number;
  linkedin_url?: string;
  careers_page_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  remote_policy?: string;
  target_status?: string;
  research_notes?: string;
  culture_notes?: string;
  tech_stack?: Record<string, any>;
  glassdoor_rating?: number;
  linkedin_url?: string;
  careers_page_url?: string;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async (filters?: {
    target_status?: string;
    industry?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.target_status) params.append('target_status', filters.target_status);
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const url = `${API_BASE_URL}/api/v1/companies/?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (data: CreateCompanyData): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/companies/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create company');
    }

    const newCompany = await response.json();
    setCompanies((prev) => [newCompany, ...prev]);
    return newCompany;
  };

  const updateCompany = async (
    id: string,
    data: Partial<CreateCompanyData>
  ): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update company');
    }

    const updatedCompany = await response.json();
    setCompanies((prev) =>
      prev.map((company) => (company.id === id ? updatedCompany : company))
    );
    return updatedCompany;
  };

  const deleteCompany = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/companies/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete company');
    }

    setCompanies((prev) => prev.filter((company) => company.id !== id));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
}
