import { useState, useEffect } from 'react';
import { TrendingUp, Users, Star, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type DashboardStats = {
  totalMentors: number;
  totalMentees: number;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  topMentors: Array<{
    id: string;
    name: string;
    department: string | null;
    sessionCount: number;
    averageRating: number;
  }>;
  mentorUtilization: Array<{
    id: string;
    name: string;
    utilizationPercent: number;
    sessionsCount: number;
  }>;
};

export const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMentors: 0,
    totalMentees: 0,
    totalSessions: 0,
    completedSessions: 0,
    averageRating: 0,
    topMentors: [],
    mentorUtilization: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: mentors } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor');

    const { data: mentees } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentee');

    const { data: sessions } = await supabase.from('sessions').select('*');

    const completedSessions = sessions?.filter((s) => s.status === 'completed') || [];

    const { data: allFeedback } = await supabase.from('feedback').select('rating');

    const avgRating =
      allFeedback && allFeedback.length > 0
        ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
        : 0;

    const mentorStats = await Promise.all(
      (mentors || []).map(async (mentor) => {
        const { data: mentorSessions } = await supabase
          .from('sessions')
          .select('id, status')
          .eq('mentor_id', mentor.id);

        const completedCount =
          mentorSessions?.filter((s) => s.status === 'completed').length || 0;

        const { data: feedback } = await supabase
          .from('feedback')
          .select('rating')
          .in(
            'session_id',
            mentorSessions?.map((s) => s.id) || []
          );

        const avgRating =
          feedback && feedback.length > 0
            ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
            : 0;

        const { data: availability } = await supabase
          .from('availability')
          .select('*')
          .eq('mentor_id', mentor.id);

        const totalAvailableSlots = availability?.length || 0;
        const utilizationPercent =
          totalAvailableSlots > 0 ? (completedCount / (totalAvailableSlots * 4)) * 100 : 0;

        return {
          id: mentor.id,
          name: mentor.full_name,
          department: mentor.department,
          sessionCount: mentorSessions?.length || 0,
          completedCount,
          averageRating: avgRating,
          utilizationPercent: Math.min(utilizationPercent, 100),
        };
      })
    );

    const topMentors = mentorStats
      .filter((m) => m.sessionCount > 0)
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.sessionCount - a.sessionCount;
      })
      .slice(0, 5);

    const mentorUtilization = mentorStats
      .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        name: m.name,
        utilizationPercent: m.utilizationPercent,
        sessionsCount: m.completedCount,
      }));

    setStats({
      totalMentors: mentors?.length || 0,
      totalMentees: mentees?.length || 0,
      totalSessions: sessions?.length || 0,
      completedSessions: completedSessions.length,
      averageRating: avgRating,
      topMentors,
      mentorUtilization,
    });

    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mentors</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalMentors}</p>
            </div>
            <Users size={40} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mentees</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalMentees}</p>
            </div>
            <Users size={40} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalSessions}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.completedSessions} completed
              </p>
            </div>
            <Calendar size={40} className="text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {stats.averageRating.toFixed(1)}
              </p>
              <div className="flex items-center mt-1">
                <Star size={16} className="text-yellow-500" fill="currentColor" />
                <span className="text-xs text-gray-500 ml-1">out of 5</span>
              </div>
            </div>
            <Star size={40} className="text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Top Performing Mentors</h3>
          </div>

          {stats.topMentors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topMentors.map((mentor, index) => (
                <div
                  key={mentor.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{mentor.name}</p>
                      {mentor.department && (
                        <p className="text-xs text-gray-600">{mentor.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500" fill="currentColor" />
                      <span className="font-semibold">{mentor.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-600">{mentor.sessionCount} sessions</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-green-600" />
            <h3 className="text-xl font-semibold text-gray-800">Mentor Utilization</h3>
          </div>

          {stats.mentorUtilization.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available yet</p>
          ) : (
            <div className="space-y-4">
              {stats.mentorUtilization.map((mentor) => (
                <div key={mentor.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-800">{mentor.name}</p>
                    <span className="text-sm text-gray-600">
                      {mentor.utilizationPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${mentor.utilizationPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {mentor.sessionsCount} completed sessions
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
