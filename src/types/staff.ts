
export interface Staff {
  id: string;
  contractor_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  hourly_rate?: number;
  is_active: boolean;
  permissions: {
    can_view_jobs: boolean;
    can_edit_jobs: boolean;
  };
  created_at: string;
  updated_at: string;
}
