
export interface TimeEntry {
  id: string;
  contractor_id: string;
  staff_id: string;
  job_id: string;
  clock_in_time: string;
  clock_out_time?: string;
  break_duration: number;
  notes?: string;
  status: 'clocked_in' | 'clocked_out' | 'break';
  gps_location_in?: any;
  gps_location_out?: any;
  driving_data?: any;
  created_at: string;
  updated_at: string;
}

export interface TimeEntryWithDetails extends TimeEntry {
  staff: {
    first_name: string;
    last_name: string;
  };
  job: {
    title: string;
  };
}
