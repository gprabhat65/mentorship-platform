import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { MentorProfile } from '../components/mentor/MentorProfile';
import { AvailabilityManager } from '../components/mentor/AvailabilityManager';
import { MentorList } from '../components/mentee/MentorList';
import { SessionScheduler } from '../components/mentee/SessionScheduler';
import { SessionsList } from '../components/shared/SessionsList';
import { FeedbackForm } from '../components/shared/FeedbackForm';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsDashboard';
import { Profile } from '../lib/supabase';

export const DashboardPage = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMentor, setSelectedMentor] = useState<Profile | null>(null);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);

  if (!profile) return null;

  const handleSchedulerClose = () => {
    setSelectedMentor(null);
  };

  const handleSchedulerSuccess = () => {
    setSelectedMentor(null);
    setActiveTab('sessions');
  };

  const handleFeedbackClose = () => {
    setFeedbackSessionId(null);
  };

  const handleFeedbackSuccess = () => {
    setFeedbackSessionId(null);
    setActiveTab('sessions');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} role={profile.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Welcome back, {profile.full_name}!
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <p className="text-gray-700">
                {profile.role === 'mentor'
                  ? 'Manage your availability, view your upcoming sessions, and help mentees grow.'
                  : 'Find mentors, schedule sessions, and accelerate your professional development.'}
              </p>
            </div>
            <AnalyticsDashboard />
          </div>
        )}

        {activeTab === 'profile' && <MentorProfile />}

        {activeTab === 'availability' && profile.role === 'mentor' && <AvailabilityManager />}

        {activeTab === 'mentors' && profile.role === 'mentee' && (
          <MentorList onSelectMentor={setSelectedMentor} />
        )}

        {activeTab === 'sessions' && <SessionsList onFeedbackRequest={setFeedbackSessionId} />}

        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </main>

      {selectedMentor && (
        <SessionScheduler
          mentor={selectedMentor}
          onClose={handleSchedulerClose}
          onSuccess={handleSchedulerSuccess}
        />
      )}

      {feedbackSessionId && (
        <FeedbackForm
          sessionId={feedbackSessionId}
          onClose={handleFeedbackClose}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </div>
  );
};
