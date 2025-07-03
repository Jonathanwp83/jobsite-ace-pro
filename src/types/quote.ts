
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Quote {
  id: string;
  contractor_id: string;
  customer_id: string;
  quote_number: string;
  title: string;
  description?: string;
  line_items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: string;
  valid_until?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteWithCustomer extends Quote {
  customer: {
    name: string;
  };
}
