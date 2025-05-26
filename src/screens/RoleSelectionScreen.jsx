import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import studentImage from '../assets/images/9.jpg';
import teacherImage from '../assets/images/10.jpg';

const roles = [
  { id: 1, title: 'Student', image: studentImage, description: 'Book classes and learn from expert teachers.' },
  { id: 2, title: 'Teacher', image: teacherImage, description: 'Manage your slots and teach students.' },
];

const RoleSelectionScreen = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <img
        src={roles[activeIndex].image}
        alt={roles[activeIndex].title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-55"></div>
      <div className="relative max-w-4xl mx-auto p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          
          <motion.h1
            className="text-3xl font-bold text-white text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Select Your Role
          </motion.h1>
        </motion.div>
        <motion.div
          className="flex justify-center space-x-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {roles.map((role, index) => (
            <div
              key={role.id}
              className={`p-4 rounded-lg cursor-pointer ${activeIndex === index ? 'bg-indigo-600 bg-opacity-20 border-2 border-indigo-600' : 'bg-white bg-opacity-10 border border-white border-opacity-20'}`}
              onClick={() => setActiveIndex(index)}
            >
              <img src={role.image} alt={role.title} className="w-32 h-32 object-cover rounded-lg mb-2" />
              <p className="text-white font-bold">{role.title}</p>
            </div>
          ))}
        </motion.div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">{roles[activeIndex].title}</h2>
          <p className="text-lg text-white text-opacity-70 mb-6">{roles[activeIndex].description}</p>
          <button
            onClick={() => navigate(`/auth/${roles[activeIndex].title}`)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-indigo-700"
          >
            Continue as {roles[activeIndex].title}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;