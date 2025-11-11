import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'mentor' | 'mentee';
  department: string | null;
  job_title: string | null;
  bio: string;
  expertise_areas: string[];
  learning_goals: string[];
  created_at: string;
};

export type Availability = {
  id: string;
  mentor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  created_at: string;
};

export type Session = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meeting_notes: string;
  created_at: string;
  updated_at: string;
};

export type Feedback = {
  id: string;
  session_id: string;
  from_user_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  session_id: string | null;
  type: 'session_reminder' | 'session_scheduled' | 'session_cancelled' | 'feedback_received';
  message: string;
  is_read: boolean;
  created_at: string;
};
