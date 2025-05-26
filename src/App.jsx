import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import AuthScreen from './screens/AuthScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import StudentDashboard from './screens/StudentDashboard';
import TeacherDashboard from './screens/TeacherDashboard';
import StudentBooking from './screens/StudentBooking';
import TeacherBooking from './screens/TeacherBooking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/role-selection" element={<RoleSelectionScreen />} />
        <Route path="/auth/:role" element={<AuthScreen />} />
        <Route path="/complete-profile" element={<CompleteProfileScreen />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/student/booking" element={<StudentBooking />} />
        <Route path="/teacher/booking" element={<TeacherBooking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;