import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase, Availability } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AvailabilityManager = () => {
  const { profile } = useAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState('');

  const fetchAvailabilities = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('mentor_id', profile.id)
      .order('day_of_week')
      .order('start_time');

    if (!error && data) {
      setAvailabilities(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [profile]);

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!profile) return;

    const { error: insertError } = await supabase
      .from('availability')
      .insert({
        mentor_id: profile.id,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_recurring: true,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setShowForm(false);
      setStartTime('09:00');
      setEndTime('10:00');
      fetchAvailabilities();
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchAvailabilities();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading availability...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Availability</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Time Slot
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddAvailability} className="mb-6 p-4 border border-gray-200 rounded-md">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DAYS.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {availabilities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No availability slots set. Add your available time slots to allow mentees to book sessions.
          </p>
        ) : (
          availabilities.map((availability) => (
            <div
              key={availability.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {DAYS[availability.day_of_week]}
                </p>
                <p className="text-sm text-gray-600">
                  {availability.start_time} - {availability.end_time}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAvailability(availability.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
