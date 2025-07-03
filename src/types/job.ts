
export interface Job {
  id: string;
  title: string;
  description: string;
  customer_id: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimated_hours: number;
  hourly_rate: number;
  fixed_price: number;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
}

export interface JobWithCustomer extends Job {
  customer: {
    name: string;
  };
}
