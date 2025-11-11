import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export const LoginForm = ({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) setError(error.message);

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md backdrop-blur-lg bg-white/70 border border-white/40 shadow-2xl rounded-2xl p-8"
      >
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">Welcome Back 👋</h2>
        <p className="text-gray-500 text-center mb-6">Sign in to continue your journey</p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center border border-red-200"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer w-full px-4 pt-5 pb-2 text-gray-800 border border-gray-300 rounded-lg bg-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all duration-200"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-2.5 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="peer w-full px-4 pt-5 pb-2 text-gray-800 border border-gray-300 rounded-lg bg-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all duration-200"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-2.5 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              Password
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
};