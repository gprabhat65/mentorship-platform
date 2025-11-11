import { Home, Calendar, User, BarChart3 } from 'lucide-react';

type NavigationProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: 'mentor' | 'mentee';
};

export const Navigation = ({ activeTab, onTabChange, role }: NavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sessions', label: 'My Sessions', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    ...(role === 'mentor'
      ? [{ id: 'availability', label: 'Availability', icon: Calendar }]
      : [{ id: 'mentors', label: 'Find Mentors', icon: User }]),
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
