import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const MentorProfile = () => {
  const { profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [jobTitle, setJobTitle] = useState(profile?.job_title || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [expertiseAreas, setExpertiseAreas] = useState(
    profile?.expertise_areas.join(', ') || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        department: department || null,
        job_title: jobTitle || null,
        bio,
        expertise_areas: expertiseAreas.split(',').map(a => a.trim()).filter(a => a),
      })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await refreshProfile();
      setIsEditing(false);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || '');
    setDepartment(profile?.department || '');
    setJobTitle(profile?.job_title || '');
    setBio(profile?.bio || '');
    setExpertiseAreas(profile?.expertise_areas.join(', ') || '');
    setIsEditing(false);
    setError('');
  };

  if (!profile) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit2 size={20} />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={20} />
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.full_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <p className="text-gray-900">{profile.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            {isEditing ? (
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.department || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile.job_title || 'Not specified'}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expertise Areas
          </label>
          {isEditing ? (
            <input
              type="text"
              value={expertiseAreas}
              onChange={(e) => setExpertiseAreas(e.target.value)}
              placeholder="e.g., Leadership, Project Management, Technical Skills"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.expertise_areas.length > 0 ? (
                profile.expertise_areas.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No expertise areas specified</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
