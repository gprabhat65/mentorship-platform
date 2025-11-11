import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export const SignUpForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"mentor" | "mentee">("mentee");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [expertiseAreas, setExpertiseAreas] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const profileData = {
      full_name: fullName,
      role,
      department: department || null,
      job_title: jobTitle || null,
      bio,
      expertise_areas: expertiseAreas
        ? expertiseAreas.split(",").map((a) => a.trim())
        : [],
      learning_goals: learningGoals
        ? learningGoals.split(",").map((g) => g.trim())
        : [],
    };

    const { error } = await signUp(email, password, profileData);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-3xl backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-2xl p-8"
      >
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
          Create Your Account
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Join as a Mentor or Mentee and start your growth journey
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center border border-red-200"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 text-gray-800 border border-gray-300 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-2.5 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Email *
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 text-gray-800 border border-gray-300 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2.5 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Password *
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div className="relative">
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder=" "
              className="peer w-full px-4 pt-5 pb-2 text-gray-800 border border-gray-300 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            />
            <label
              htmlFor="fullName"
              className="absolute left-4 top-2.5 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              Full Name *
            </label>
          </div>

          {/* Role Selection */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <label className="text-gray-700 text-sm font-medium">
              I want to be a *
            </label>
            <div className="flex gap-3">
              {["mentee", "mentor"].map((r) => (
                <motion.button
                  key={r}
                  type="button"
                  onClick={() => setRole(r as "mentee" | "mentor")}
                  whileTap={{ scale: 0.97 }}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                    role === r
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {r === "mentor" ? "Mentor" : "Mentee"}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Department & Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 text-gray-800 border border-gray-300 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              />
              <label
                htmlFor="department"
                className="absolute left-4 top-2.5 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Department
              </label>
            </div>

            <div className="relative">
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 text-gray-800 border border-gray-300 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              />
              <label
                htmlFor="jobTitle"
                className="absolute left-4 top-2.5 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Job Title
              </label>
            </div>
          </div>

          {/* Bio */}
          <div className="relative">
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder=" "
              className="peer w-full px-4 pt-5 pb-2 text-gray-800 border border-gray-300 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-400 outline-none transition-all resize-none"
            />
            <label
              htmlFor="bio"
              className="absolute left-4 top-2.5 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              Bio
            </label>
          </div>

          {/* Dynamic mentor/mentee field */}
          <AnimatePresence mode="wait">
            {role === "mentor" ? (
              <motion.div
                key="expertise"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <label
                  htmlFor="expertiseAreas"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Expertise Areas (comma-separated)
                </label>
                <input
                  id="expertiseAreas"
                  type="text"
                  value={expertiseAreas}
                  onChange={(e) => setExpertiseAreas(e.target.value)}
                  placeholder="e.g., Leadership, AI, Project Management"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </motion.div>
            ) : (
              <motion.div
                key="learningGoals"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <label
                  htmlFor="learningGoals"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Learning Goals (comma-separated)
                </label>
                <input
                  id="learningGoals"
                  type="text"
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="e.g., Career Growth, Soft Skills"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
};