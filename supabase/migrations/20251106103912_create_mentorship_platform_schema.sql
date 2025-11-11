/*
  # Mentorship Management Platform Database Schema

  1. New Tables
    - profiles: User profiles with role (mentor/mentee), department, expertise
    - availability: Mentor time slots for scheduling
    - sessions: Mentorship sessions with scheduling info
    - feedback: Session ratings and comments
    - notifications: System notifications for reminders and updates

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Session participants can view their sessions
    - Feedback restricted to session participants
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('mentor', 'mentee')),
  department text,
  job_title text,
  bio text DEFAULT '',
  expertise_areas text[] DEFAULT '{}',
  learning_goals text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_recurring boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mentor availability"
  ON availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mentors can manage own availability"
  ON availability FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = mentor_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor')
  );

CREATE POLICY "Mentors can update own availability"
  ON availability FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete own availability"
  ON availability FOR DELETE
  TO authenticated
  USING (auth.uid() = mentor_id);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  meeting_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Mentees can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = mentee_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentee')
  );

CREATE POLICY "Session participants can update sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id)
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback for their sessions"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = feedback.session_id 
      AND (sessions.mentor_id = auth.uid() OR sessions.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Session participants can create feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id AND
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = feedback.session_id 
      AND (sessions.mentor_id = auth.uid() OR sessions.mentee_id = auth.uid())
    )
  );

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('session_reminder', 'session_scheduled', 'session_cancelled', 'feedback_received')),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_availability_mentor ON availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mentor ON sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mentee ON sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_feedback_session ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
