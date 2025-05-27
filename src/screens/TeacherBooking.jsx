import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import useWebSocket from 'react-use-websocket';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Modal from 'react-modal';
import teacherImage from '../assets/images/9.jpg';

Modal.setAppElement('#root');

const localizer = momentLocalizer(moment);
const meetingURL = 'https://shivansh-videoconf-309.app.100ms.live/meeting/uvr-mzvu-vgd';

const TeacherBooking = () => {
  const { state } = useLocation();
  const { userData } = state || {};
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [pendingSlots, setPendingSlots] = useState([]); // New state for pending slots
  const [showMeeting, setShowMeeting] = useState(false);

  const { sendMessage, lastMessage } = useWebSocket(`/ws/booking/${userData.user_id}/`, {
    onOpen: () => {
      console.log('WebSocket Connected for user:', userData.user_id);
      fetchSlots();
    },
    onError: (e) => {
      console.error('WebSocket Error for user:', userData.user_id, e);
      alert('Connection error. Trying to reconnect...');
      fetchSlots();
    },
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastMessage) {
      console.log('Received WebSocket message:', lastMessage.data);
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'slot_update' && data.action === 'added') {
          setPendingSlots((prev) => prev.filter((slot) => slot.id !== data.slot.id)); // Remove from pending
          setUpcomingSlots((prev) => {
            // Replace temp slot with server-confirmed slot
            const updatedSlots = prev.filter((slot) => slot.id !== data.slot.id && !slot.id.startsWith('temp_'));
            return [...updatedSlots, data.slot].sort((a, b) => new Date(a.date) - new Date(b.date) || a.start_time.localeCompare(b.start_time));
          });
        } else if (data.type === 'slot_update' && data.action === 'deleted') {
          setUpcomingSlots((prev) => prev.filter((slot) => slot.id !== data.slot_id));
          setPendingSlots((prev) => prev.filter((slot) => slot.id !== data.slot_id));
        } else if (data.type === 'booking_update' || data.type === 'slots_count') {
          fetchSlots();
        } else if (data.type === 'error') {
          alert(data.message);
          // Revert optimistic update if slot addition fails
          if (data.message.includes('slot')) {
            setPendingSlots([]);
            setUpcomingSlots((prev) => prev.filter((slot) => !slot.id.startsWith('temp_')));
          }
          fetchSlots();
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        fetchSlots();
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    console.log('upcomingSlots:', upcomingSlots, 'pendingSlots:', pendingSlots);
  }, [upcomingSlots, pendingSlots]);

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(() => fetchSlots(), 30000);
    return () => clearInterval(interval);
  }, [userData]);

  const fetchSlots = async () => {
    try {
      const response = await axios.post(`/api/booking/get-teacher-slots/?t=${new Date().getTime()}`, {
        teacher_id: userData.user_id,
        limit: 100,
      });
      const sortedSlots = response.data.sort((a, b) => new Date(a.date) - new Date(b.date) || a.start_time.localeCompare(b.start_time));
      // Preserve pending slots that haven't been confirmed
      setUpcomingSlots([...pendingSlots, ...sortedSlots.filter((slot) => !slot.is_booked)]);
      setBookedSlots(sortedSlots.filter((slot) => slot.is_booked));
    } catch (error) {
      alert('Failed to fetch slots: ' + error.message);
      setTimeout(() => fetchSlots(), 5000);
    }
  };

  const handleAddSlot = () => {
    if (!date || !startTime || !endTime) {
      alert('Please fill in all fields');
      return;
    }
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      alert('Time must be in HH:MM format (24-hour)');
      return;
    }
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      alert('End time must be after start time');
      return;
    }
    const newSlot = {
      teacher_id: userData.user_id,
      date,
      start_time: startTime,
      end_time: endTime,
      is_booked: false,
      id: `temp_${Date.now()}`,
    };
    if (window.confirm(`Add slot on ${date} from ${startTime} to ${endTime}?`)) {
      setDate('');
      setStartTime('');
      setEndTime('');
      setPendingSlots((prev) => [...prev, newSlot]);
      setUpcomingSlots((prev) => [...prev, newSlot].sort((a, b) => new Date(a.date) - new Date(b.date) || a.start_time.localeCompare(b.start_time)));
      sendMessage(JSON.stringify({ action: 'add_slot', ...newSlot }));
      alert('Slot added successfully');
    }
  };

  const events = [...upcomingSlots, ...bookedSlots].map((slot) => ({
    title: `${slot.start_time} - ${slot.end_time} ${slot.is_booked ? '(Booked)' : ''}`,
    start: new Date(`${slot.date}T${slot.start_time}`),
    end: new Date(`${slot.date}T${slot.end_time}`),
    id: slot.id,
    isBooked: slot.is_booked,
  }));

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <img src={teacherImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-55"></div>
      <div className="relative max-w-4xl mx-auto p-6">
        <motion.h1
          className="text-4xl font-bold text-white text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Manage Slots
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-white mb-4">Add New Slot</h2>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-20 mb-4"
            onSelectSlot={({ start }) => setDate(moment(start).format('YYYY-MM-DD'))}
            selectable
            min={new Date()}
          />
          <input
            className="w-full p-2 mb-4 border rounded bg-white bg-opacity-10 text-white"
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            readOnly
          />
          <input
            className="w-full p-2 mb-4 border rounded bg-white bg-opacity-10 text-white"
            placeholder="Start Time (HH:MM)"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <input
            className="w-full p-2 mb-4 border rounded bg-white bg-opacity-10 text-white"
            placeholder="End Time (HH:MM)"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <button
            className="w-full bg-indigo-600 text-white py-4 rounded-full hover:bg-indigo-700"
            onClick={handleAddSlot}
          >
            Add Slot
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <h2 className="text-2xl font-bold text-white mb-4">Upcoming Slots <span className="text-sm text-white text-opacity-70">Total: {upcomingSlots.length}</span></h2>
          {console.log('Rendering upcomingSlots:', upcomingSlots)}
          {upcomingSlots.length === 0 ? (
            <p className="text-white text-opacity-70">No upcoming slots.</p>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {upcomingSlots.map((slot) => (
                <div key={slot.id} className="p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20">
                  <p className="text-white">{slot.date} {slot.start_time} - {slot.end_time}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <h2 className="text-2xl font-bold text-white mb-4">Booked Slots <span className="text-sm text-white text-opacity-70">Total: {bookedSlots.length}</span></h2>
          {bookedSlots.length === 0 ? (
            <p className="text-white text-opacity-70">No booked slots.</p>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {bookedSlots.map((slot) => (
                <div key={slot.id} className="flex justify-between items-center p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20">
                  <div>
                    <p className="text-white">{slot.date} {slot.start_time} - {slot.end_time}</p>
                    {slot.status && <p className="text-white text-opacity-60 text-sm">Status: {slot.status}</p>}
                    {slot.student_name && <p className="text-white text-opacity-70 text-sm">Student: {slot.student_name}</p>}
                  </div>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => setShowMeeting(true)}
                  >
                    Start Class
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        <Modal
          isOpen={showMeeting}
          onRequestClose={() => setShowMeeting(false)}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '800px',
              padding: '20px',
              borderRadius: '8px',
            },
          }}
        >
          <iframe src={meetingURL} className="w-full h-[70vh]" allow="camera; microphone" />
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
            onClick={() => setShowMeeting(false)}
          >
            Close
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherBooking;