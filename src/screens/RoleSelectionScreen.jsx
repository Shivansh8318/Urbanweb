import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import studentImage from '../assets/images/10.jpg';
import teacherImage from '../assets/images/9.jpg';

const roles = [
  {
    id: 1,
    title: 'Student',
    image: studentImage,
    description: 'Book classes and learn from expert teachers.',
    features: ['Access to expert teachers', 'Flexible scheduling', 'Progress tracking', 'Interactive learning tools'],
    icon: '👨‍🎓'
  },
  {
    id: 2,
    title: 'Teacher',
    image: teacherImage,
    description: 'Manage your slots and teach students.',
    features: ['Manage teaching schedule', 'Connect with students', 'Track student progress', 'Earn by teaching'],
    icon: '👨‍🏫'
  },
];

const RoleSelectionScreen = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          scale: isHovering ? 1.05 : 1
        }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={roles[activeIndex].image}
          alt={roles[activeIndex].title}
          className="absolute inset-0 w-full h-full object-cover filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 min-h-screen flex flex-col justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
          >
            Choose Your Path
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            Select your role to begin your educational journey with UrbanBook
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              variants={itemVariants}
              className={`relative group cursor-pointer backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                activeIndex === index
                  ? 'border-blue-500 bg-white/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => {
                setActiveIndex(index);
                setIsHovering(true);
              }}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <span className="text-4xl mr-4">{role.icon}</span>
                  <h2 className="text-3xl font-bold text-white">{role.title}</h2>
                </div>
                <p className="text-lg text-white/80 mb-6">{role.description}</p>
                <ul className="space-y-3 mb-8">
                  {role.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center text-white/70"
                    >
                      <span className="text-blue-400 mr-3">✓</span>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/auth/${role.title.toLowerCase()}`)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                    activeIndex === index
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  Continue as {role.title}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;