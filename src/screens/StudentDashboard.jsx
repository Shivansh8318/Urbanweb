import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import studentImage from '../assets/images/10.jpg';

const StudentDashboard = () => {
  const { state } = useLocation();
  const { userData } = state || {};
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.post('/api/student/get-profile/', { user_id: userData.user_id });
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [userData]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: '🏠' },
    { label: 'Book Classes', path: '/student/booking', icon: '📚' },
    { label: 'View Schedule', path: '/student/booking', icon: '📅' },
    { label: 'Track Progress', path: '/student/booking', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        <img
          src={studentImage}
          alt="Background"
          className="w-full h-full object-cover filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
      </motion.div>

      {/* Subtle Background Particle Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1)_0%,_transparent_70%)] animate-pulse" />
      </div>

      {/* Layout with Sidebar */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <motion.div
          className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between p-6 fixed h-full z-10"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-8 tracking-tight">
              UrbanBook
            </h2>
            <nav className="space-y-2">
              {sidebarItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex items-center p-3 rounded-lg cursor-pointer group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                  onClick={() => navigate(item.path, { state: { userData } })}
                >
                  <span className="text-blue-400 mr-3 text-xl">{item.icon}</span>
                  <span className="text-gray-300 group-hover:text-blue-300 transition-colors duration-300">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </nav>
          </div>
          <motion.button
            className="relative w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full text-base font-semibold transform hover:scale-105 transition-all duration-300 overflow-hidden group"
            onClick={handleLogout}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Logout</span>
            <motion.span
              className="absolute inset-0 border-2 border-red-400 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            />
          </motion.button>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-6 sm:p-8 flex flex-col items-center min-h-screen justify-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-tight">
              Student Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 text-center mb-10">
              Welcome back, {profileData?.name || userData?.name || 'Student'}!
            </p>
          </motion.div>

          {/* Profile Card */}
          {profileData && (
            <motion.div
              className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 w-full max-w-2xl group mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <h2 className="relative text-2xl sm:text-3xl font-extrabold text-white mb-6 tracking-tight">
                Your Profile
              </h2>
              <div className="relative space-y-4">
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">👤</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Name: </span>
                    {profileData.name || 'Not available'}
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">⚥</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Gender: </span>
                    {profileData.gender || 'Not available'}
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">🎂</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Age: </span>
                    {profileData.age || 'Not available'}
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">📚</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Grade: </span>
                    {profileData.grade || 'Not available'}
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">🏫</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">School: </span>
                    {profileData.school || 'Not available'}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;