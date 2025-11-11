import { useState, useEffect } from 'react';
import { Calendar, Clock, X, CheckCircle } from 'lucide-react';
import { supabase, Session, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type SessionWithProfiles = Session & {
  mentor: Profile;
  mentee: Profile;
};

export const SessionsList = ({ onFeedbackRequest }: { onFeedbackRequest?: (sessionId: string) => void }) => {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<SessionWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchSessions();
  }, [profile]);

  const fetchSessions = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .or(`mentor_id.eq.${profile.id},mentee_id.eq.${profile.id}`)
      .order('scheduled_at', { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const sessionsWithProfiles = await Promise.all(
      data.map(async (session) => {
        const { data: mentor } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.mentor_id)
          .single();

        const { data: mentee } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.mentee_id)
          .single();

        return {
          ...session,
          mentor: mentor!,
          mentee: mentee!,
        };
      })
    );

    setSessions(sessionsWithProfiles);
    setLoading(false);
  };

  const handleCancelSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'cancelled' })
      .eq('id', sessionId);

    if (!error) {
      fetchSessions();
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (!error) {
      fetchSessions();
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const getOtherParticipant = (session: SessionWithProfiles) => {
    return profile?.id === session.mentor_id ? session.mentee : session.mentor;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Sessions</h2>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md transition-colors capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sessions found</p>
        ) : (
          filteredSessions.map((session) => {
            const otherParticipant = getOtherParticipant(session);
            const { date, time } = formatDateTime(session.scheduled_at);
            const isPast = new Date(session.scheduled_at) < new Date();

            return (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {profile?.role === 'mentor' ? 'Mentee' : 'Mentor'}: {otherParticipant.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {otherParticipant.job_title}
                      {otherParticipant.department && ` • ${otherParticipant.department}`}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {time} ({session.duration_minutes} min)
                  </div>
                </div>

                {session.meeting_notes && (
                  <div className="bg-gray-50 p-3 rounded-md mb-3">
                    <p className="text-sm text-gray-700">{session.meeting_notes}</p>
                  </div>
                )}

                {session.status === 'scheduled' && (
                  <div className="flex gap-2">
                    {profile?.role === 'mentor' && isPast && (
                      <button
                        onClick={() => handleCompleteSession(session.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        <CheckCircle size={16} />
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelSession(session.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}

                {session.status === 'completed' && onFeedbackRequest && (
                  <button
                    onClick={() => onFeedbackRequest(session.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Leave Feedback
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
