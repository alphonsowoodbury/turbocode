import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface NetworkContact {
  id: string;
  company_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  linkedin_url?: string;
  phone?: string;
  current_title?: string;
  current_company?: string;
  contact_type?: 'recruiter_internal' | 'recruiter_external' | 'hiring_manager' | 'peer' | 'referrer' | 'mentor' | 'former_colleague';
  relationship_strength: 'cold' | 'warm' | 'hot';
  last_contact_date?: string;
  next_followup_date?: string;
  interaction_count: number;
  how_we_met?: string;
  conversation_history?: string;
  referral_status?: 'none' | 'requested' | 'agreed' | 'completed';
  github_url?: string;
  personal_website?: string;
  twitter_url?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContactData {
  company_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  linkedin_url?: string;
  phone?: string;
  current_title?: string;
  current_company?: string;
  contact_type?: string;
  relationship_strength?: string;
  last_contact_date?: string;
  next_followup_date?: string;
  how_we_met?: string;
  conversation_history?: string;
  referral_status?: string;
  github_url?: string;
  personal_website?: string;
  twitter_url?: string;
  notes?: string;
}

export function useContacts() {
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async (filters?: {
    contact_type?: string;
    relationship_strength?: string;
    company_id?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.contact_type) params.append('contact_type', filters.contact_type);
      if (filters?.relationship_strength) params.append('relationship_strength', filters.relationship_strength);
      if (filters?.company_id) params.append('company_id', filters.company_id);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const url = `${API_BASE_URL}/api/v1/network-contacts/?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (data: CreateContactData): Promise<NetworkContact> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/network-contacts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create contact');
    }

    const newContact = await response.json();
    setContacts((prev) => [newContact, ...prev]);
    return newContact;
  };

  const updateContact = async (
    id: string,
    data: Partial<CreateContactData>
  ): Promise<NetworkContact> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/network-contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update contact');
    }

    const updatedContact = await response.json();
    setContacts((prev) =>
      prev.map((contact) => (contact.id === id ? updatedContact : contact))
    );
    return updatedContact;
  };

  const deleteContact = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/network-contacts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete contact');
    }

    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
}
