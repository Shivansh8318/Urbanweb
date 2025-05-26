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

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <img src={studentImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-55"></div>
      <div className="relative max-w-4xl mx-auto p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white text-center mb-2">Student Dashboard</h1>
          <p className="text-lg text-white text-opacity-60 text-center mb-6">
            Welcome back, {profileData?.name || userData?.name || 'Student'}!
          </p>
        </motion.div>
        {profileData && (
          <motion.div
            className="bg-white bg-opacity-10 rounded-lg p-4 mb-6 border border-white border-opacity-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Your Profile</h2>
            <div className="bg-white bg-opacity-15 p-3 rounded-lg">
              <p className="text-base text-white mb-2"><span className="font-semibold text-white text-opacity-80">Name: </span>{profileData.name || 'Not available'}</p>
              <p className="text-base text-white mb-2"><span className="font-semibold text-white text-opacity-80">Gender: </span>{profileData.gender || 'Not available'}</p>
              <p className="text-base text-white mb-2"><span className="font-semibold text-white text-opacity-80">Age: </span>{profileData.age || 'Not available'}</p>
              <p className="text-base text-white mb-2"><span className="font-semibold text-white text-opacity-80">Grade: </span>{profileData.grade || 'Not available'}</p>
              <p className="text-base text-white"><span className="font-semibold text-white text-opacity-80">School: </span>{profileData.school || 'Not available'}</p>
            </div>
          </motion.div>
        )}
        <motion.button
          className="w-full bg-indigo-600 text-white py-4 rounded-full text-lg font-bold hover:bg-indigo-700"
          onClick={() => navigate('/student/booking', { state: { userData } })}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Book Classes
        </motion.button>
        <motion.button
          className="w-full bg-red-600 text-white py-4 rounded-full text-lg font-bold hover:bg-red-700 mt-4"
          onClick={handleLogout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Logout
        </motion.button>
      </div>
    </div>
  );
};

export default StudentDashboard;