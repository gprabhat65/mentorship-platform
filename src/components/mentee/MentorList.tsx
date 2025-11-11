import { useState, useEffect } from 'react';
import { Calendar, Star } from 'lucide-react';
import { supabase, Profile } from '../../lib/supabase';

type MentorWithStats = Profile & {
  avg_rating: number;
  session_count: number;
};

export const MentorList = ({ onSelectMentor }: { onSelectMentor: (mentor: Profile) => void }) => {
  const [mentors, setMentors] = useState<MentorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    const { data: mentorsData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor');

    if (error || !mentorsData) {
      setLoading(false);
      return;
    }

    const mentorsWithStats = await Promise.all(
      mentorsData.map(async (mentor) => {
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('id')
          .eq('mentor_id', mentor.id)
          .eq('status', 'completed');

        const sessionCount = sessionsData?.length || 0;

        const { data: feedbackData } = await supabase
          .from('feedback')
          .select('rating')
          .in('session_id', sessionsData?.map(s => s.id) || []);

        const avgRating = feedbackData && feedbackData.length > 0
          ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length
          : 0;

        return {
          ...mentor,
          avg_rating: avgRating,
          session_count: sessionCount,
        };
      })
    );

    setMentors(mentorsWithStats);
    setLoading(false);
  };

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise_areas.some(area =>
        area.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loading) {
    return <div className="text-center py-8">Loading mentors...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Find a Mentor</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, department, or expertise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        {filteredMentors.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No mentors found</p>
        ) : (
          filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {mentor.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mentor.job_title}
                    {mentor.department && ` • ${mentor.department}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star size={16} className="text-yellow-500" fill="currentColor" />
                  <span className="font-medium">
                    {mentor.avg_rating > 0 ? mentor.avg_rating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-gray-500">
                    ({mentor.session_count} sessions)
                  </span>
                </div>
              </div>

              {mentor.bio && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{mentor.bio}</p>
              )}

              {mentor.expertise_areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {mentor.expertise_areas.map((area, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => onSelectMentor(mentor)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Calendar size={16} />
                Schedule Session
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
