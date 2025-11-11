import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { supabase, Profile, Availability } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const SessionScheduler = ({
  mentor,
  onClose,
  onSuccess,
}: {
  mentor: Profile;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { profile } = useAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailabilities();
  }, [mentor]);

  const fetchAvailabilities = async () => {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('mentor_id', mentor.id)
      .order('day_of_week')
      .order('start_time');

    if (!error && data) {
      setAvailabilities(data);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!profile || !selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    setLoading(true);

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);

    const { error: sessionError } = await supabase.from('sessions').insert({
      mentor_id: mentor.id,
      mentee_id: profile.id,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: durationMinutes,
      status: 'scheduled',
    });

    if (sessionError) {
      setError(sessionError.message);
      setLoading(false);
      return;
    }

    const { error: notificationError } = await supabase.from('notifications').insert([
      {
        user_id: mentor.id,
        type: 'session_scheduled',
        message: `${profile.full_name} has scheduled a session with you on ${scheduledAt.toLocaleDateString()} at ${scheduledAt.toLocaleTimeString()}`,
      },
      {
        user_id: profile.id,
        type: 'session_scheduled',
        message: `You have scheduled a session with ${mentor.full_name} on ${scheduledAt.toLocaleDateString()} at ${scheduledAt.toLocaleTimeString()}`,
      },
    ]);

    if (notificationError) {
      console.error('Failed to create notifications:', notificationError);
    }

    setLoading(false);
    onSuccess();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getAvailableTimesForDate = () => {
    if (!selectedDate) return [];

    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();

    return availabilities.filter((a) => a.day_of_week === dayOfWeek);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Schedule Session</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">{mentor.full_name}</h3>
            <p className="text-sm text-gray-600">
              {mentor.job_title}
              {mentor.department && ` • ${mentor.department}`}
            </p>
          </div>

          {availabilities.length === 0 ? (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-4">
              This mentor has not set up their availability yet. Please check back later.
            </div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Available Time Slots:
                </p>
                <div className="space-y-1">
                  {availabilities.map((avail, idx) => (
                    <p key={idx} className="text-sm text-blue-700">
                      {DAYS[avail.day_of_week]}: {avail.start_time} - {avail.end_time}
                    </p>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedDate && getAvailableTimesForDate().length === 0 && (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
                    No available time slots for the selected day. Please choose another date.
                  </div>
                )}

                {selectedDate && getAvailableTimesForDate().length > 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Time
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose a time...</option>
                        {getAvailableTimesForDate().map((avail, idx) => (
                          <option key={idx} value={avail.start_time}>
                            {avail.start_time} - {avail.end_time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <select
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                      </select>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedTime}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Calendar size={20} />
                  {loading ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
