
import { LineItem } from './quote';

export interface Invoice {
  id: string;
  contractor_id: string;
  customer_id: string;
  job_id?: string;
  invoice_number: string;
  title: string;
  description?: string;
  line_items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  paid_at?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithCustomer extends Invoice {
  customer: {
    name: string;
  };
  job?: {
    title: string;
  };
}
