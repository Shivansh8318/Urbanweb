import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Import the Footer component
import Footer from '../components/layout/Footer';

// Import all images
import image1 from '../assets/images/1.jpg';
import image2 from '../assets/images/2.jpg';
import image3 from '../assets/images/3.jpg';
import image4 from '../assets/images/4.jpg';
import image5 from '../assets/images/5.jpg';
import image6 from '../assets/images/6.jpg';
import image7 from '../assets/images/7.jpg';
import image8 from '../assets/images/8.jpg';

const events = [
  { id: 1, title: 'UrbanBook', image: image1 },
  { id: 2, title: 'Seamless Scheduling', image: image2 },
  { id: 3, title: 'Video Classes', image: image3 },
  { id: 4, title: 'Live Sync', image: image4 },
  { id: 5, title: 'Homework Mastery', image: image5 },
  { id: 6, title: 'Seamless Scheduling', image: image6 },
  { id: 7, title: 'Video Classes', image: image7 },
  { id: 8, title: 'Live Sync', image: image8 },
];

const WelcomeScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  // Carousel auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full bg-gray-900 text-white font-sans overflow-x-hidden">
      {/* Hero Section with Carousel */}
      <section className="hero-section">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={events[activeIndex].id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={events[activeIndex].image}
                alt={events[activeIndex].title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center w-full px-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  {events[activeIndex].title}
                </h2>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 section-container flex flex-col justify-center items-center text-center">
          <motion.p
            className="responsive-text font-medium text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 100, delay: 0.3 }}
          >
            Welcome to
          </motion.p>
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-400 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            UrbanBook
          </motion.h1>
          <motion.p
            className="responsive-text text-white/80 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 100, delay: 0.7 }}
          >
            Transform education with seamless scheduling, real-time collaboration, and powerful learning tools.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 100, delay: 0.9 }}
          >
            <Link to="/role-selection" className="btn btn-primary">
              Start Your Journey
            </Link>
          </motion.div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-10">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'bg-blue-400 scale-125' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-gray-800">
        <div className="section-container text-center">
          <h2 className="responsive-heading bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-8 sm:mb-12">
            How UrbanBook Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Sign Up', description: 'Create your account as a student or teacher.', icon: '✨' },
              { step: '2', title: 'Schedule', description: 'Book appointments with ease.', icon: '📅' },
              { step: '3', title: 'Collaborate', description: 'Join live video classes and sync in real-time.', icon: '📹' },
              { step: '4', title: 'Succeed', description: 'Track progress and master your goals.', icon: '🏆' },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="card bg-gray-900"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="text-3xl sm:text-4xl mb-4">{step.icon}</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-white/70 text-sm sm:text-base">{step.description}</p>
                <div className="mt-4 text-blue-400 font-bold">{`Step ${step.step}`}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-gray-900">
        <div className="section-container text-center">
          <h2 className="responsive-heading bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-8 sm:mb-12">
            Why UrbanBook?
          </h2>
          <div className="card-container">
            {[
              {
                title: 'Seamless Scheduling',
                description: 'Effortlessly book and manage appointments with teachers or students.',
                icon: '📅',
              },
              {
                title: 'Live Collaboration',
                description: 'Engage in real-time video classes and interactive sessions.',
                icon: '📹',
              },
              {
                title: 'Homework Mastery',
                description: 'Track assignments and progress with intuitive tools.',
                icon: '📚',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="card flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="text-3xl sm:text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm sm:text-base flex-grow">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 bg-gray-800">
        <div className="section-container text-center">
          <h2 className="responsive-heading bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-8 sm:mb-12">
            What Our Users Say
          </h2>
          <div className="card-container">
            {[
              {
                name: 'Sarah J.',
                role: 'Student',
                quote: 'UrbanBook made scheduling my tutoring sessions so easy! I love the video classes.',
                avatar: image1,
              },
              {
                name: 'Mr. Thompson',
                role: 'Teacher',
                quote: "The platform's live sync feature keeps my classes organized and engaging.",
                avatar: image2,
              },
              {
                name: 'Emily R.',
                role: 'Parent',
                quote: "Tracking my child's homework and progress has never been this seamless!",
                avatar: image3,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="card bg-gray-900 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="flex-grow flex flex-col items-center">
                  <img
                    src={testimonial.avatar}
                    alt={`${testimonial.name}'s avatar`}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-white/70 italic text-sm sm:text-base mb-4">"{testimonial.quote}"</p>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold">{testimonial.name}</h4>
                  <p className="text-white/60 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="section-container text-center">
          <motion.h2
            className="responsive-heading text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            Ready to Transform Your Learning Experience?
          </motion.h2>
          <motion.p
            className="responsive-text text-white/80 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            Join UrbanBook today and unlock a world of seamless education and collaboration.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Link
              to="/role-selection"
              className="bg-white text-blue-600 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-opacity-90 transition-all duration-300 shadow-lg inline-block"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Use the Footer component */}
      <Footer />
    </div>
  );
};

export default WelcomeScreen;