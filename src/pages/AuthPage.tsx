import { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';

export const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MentorConnect</h1>
          <p className="text-gray-600">
            Connect with mentors and accelerate your professional growth
          </p>
        </div>

        {showLogin ? (
          <LoginForm onSwitchToSignUp={() => setShowLogin(false)} />
        ) : (
          <SignUpForm onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    </div>
  );
};
