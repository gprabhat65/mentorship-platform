import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationCenter } from '../shared/NotificationCenter';

export const Header = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MentorConnect</h1>
            {profile && (
              <p className="text-sm text-gray-600">
                Welcome, {profile.full_name} ({profile.role})
              </p>
            )}
          </div>

          {profile && (
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
