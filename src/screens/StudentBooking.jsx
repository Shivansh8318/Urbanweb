import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { motion } from 'framer-motion';
import useWebSocket from 'react-use-websocket';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Modal from 'react-modal';
import studentImage from '../assets/images/10.jpg';
import 'react-big-calendar/lib/css/react-big-calendar.css';

Modal.setAppElement('#root');

const localizer = momentLocalizer(moment);
const meetingURL = 'https://shivansh-videoconf-309.app.100ms.live/meeting/uvr-mzvu-vgd';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-500 bg-opacity-20 rounded-lg shadow-lg text-white">
          <p className="text-lg">Something went wrong: {this.state.error.message}</p>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const StudentBooking = () => {
  const { state } = useLocation();
  const { userData } = state || {};
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedClasses, setBookedClasses] = useState([]);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allSlots, setAllSlots] = useState([]);
  const [showMeeting, setShowMeeting] = useState(false);

  // Validate userData
  if (!userData?.user_id) {
    console.error('userData is missing or invalid:', userData);
    useEffect(() => {
      alert('User data missing. Please log in again.');
      navigate('/auth/Student');
    }, [navigate]);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-lg">Redirecting to login...</p>
      </div>
    );
  }

  const getWebSocketUrl = () => {
    const wsUrl = `/ws/booking/${userData.user_id}/`;
    return wsUrl;
  };

  const { sendMessage, lastMessage, readyState } = useWebSocket(getWebSocketUrl(), {
    onOpen: () => console.log('WebSocket Connected for StudentBooking:', getWebSocketUrl()),
    onError: (error) => {
      console.error('WebSocket Error:', error);
      alert('WebSocket connection failed. Please check your network or try again later.');
    },
    onClose: (event) => {
      console.error('WebSocket Disconnected. Code:', event.code, 'Reason:', event.reason);
      if (event.code === 1008) {
        alert('Access denied. Please log in again.');
        navigate('/auth/Student');
      }
    },
    shouldReconnect: (closeEvent) => closeEvent?.code !== 1000 && closeEvent?.code !== 1008,
    reconnectAttempts: 3,
    reconnectInterval: 10000,
  });

  useEffect(() => {
    fetchTeachers();
    fetchBookedClasses();
  }, []);

  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'booking_update') {
          setAvailableSlots((prev) => prev.filter((slot) => slot.id !== data.booking.slot_id));
          setAllSlots((prev) => prev.filter((slot) => slot.id !== data.booking.slot_id));
          setBookingSlotId(null);
          fetchBookedClasses();
          if (selectedTeacher) {
            fetchAllSlots(selectedTeacher.user_id);
            if (selectedDate) fetchAvailableSlots(selectedTeacher.user_id, selectedDate);
          }
        } else if (data.type === 'slot_update' && selectedTeacher) {
          if (data.slot && !data.slot.is_booked && data.slot.teacher_id === selectedTeacher.user_id) {
            setAllSlots((prev) => {
              if (prev.some((slot) => slot.id === data.slot.id)) return prev;
              return [
                ...prev,
                {
                  ...data.slot,
                  start_time: data.slot.start_time.padEnd(8, ':00'),
                  end_time: data.slot.end_time.padEnd(8, ':00'),
                }
              ].sort((a, b) => {
                const dateDiff = new Date(a.date) - new Date(b.date);
                return dateDiff !== 0 ? dateDiff : a.start_time.localeCompare(b.start_time);
              });
            });
            if (selectedDate && data.slot.date === moment(selectedDate).format('YYYY-MM-DD')) {
              setAvailableSlots((prev) => {
                if (prev.some((slot) => slot.id === data.slot.id)) return prev;
                return [
                  ...prev,
                  {
                    ...data.slot,
                    start_time: data.slot.start_time.padEnd(8, ':00'),
                    end_time: data.slot.end_time.padEnd(8, ':00'),
                  }
                ].sort((a, b) => a.start_time.localeCompare(b.start_time));
              });
            }
          } else if (data.action === 'deleted') {
            setAllSlots((prev) => prev.filter((slot) => slot.id !== data.slot_id));
            setAvailableSlots((prev) => prev.filter((slot) => slot.id !== data.slot_id));
          }
        } else if (data.type === 'error') {
          setBookingSlotId(null);
          alert(data.message || 'An error occurred with the WebSocket connection.');
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
        alert('Error processing WebSocket message. Please try again.');
      }
    }
  }, [lastMessage, selectedTeacher, selectedDate]);

  useEffect(() => {
    if (selectedTeacher) {
      fetchAllSlots(selectedTeacher.user_id);
    }
  }, [selectedTeacher]);

  useEffect(() => {
    if (selectedTeacher && selectedDate) {
      fetchAvailableSlots(selectedTeacher.user_id, selectedDate);
    }
  }, [selectedTeacher, selectedDate]);

  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await axios.get('/api/teacher/list-teachers/');
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: Expected an array');
      }
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
      alert(`Failed to fetch teachers: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const fetchAllSlots = async (teacherId) => {
    try {
      const response = await axios.post('/api/booking/get-teacher-slots/', {
        teacher_id: teacherId,
        limit: 500,
        include_all: true,
      });
      const sortedSlots = response.data
        .filter((slot) => !slot.is_booked && new Date(slot.date) >= new Date().setHours(0, 0, 0, 0))
        .map((slot) => ({
          ...slot,
          start_time: slot.start_time.padEnd(8, ':00'),
          end_time: slot.end_time.padEnd(8, ':00'),
        }))
        .sort((a, b) => {
          const dateDiff = new Date(a.date) - new Date(b.date);
          return dateDiff !== 0 ? dateDiff : a.start_time.localeCompare(b.start_time);
        });
      setAllSlots(sortedSlots);
    } catch (error) {
      console.error('Error fetching all slots:', error);
      setAllSlots([]);
      alert('Failed to fetch slots: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchAvailableSlots = async (teacherId, date) => {
    try {
      const dateStr = moment(date).format('YYYY-MM-DD');
      const response = await axios.post('/api/booking/get-teacher-slots/', {
        teacher_id: teacherId,
        date: dateStr,
        limit: 500,
      });
      const available = response.data
        .filter((slot) => !slot.is_booked)
        .map((slot) => ({
          ...slot,
          start_time: slot.start_time.padEnd(8, ':00'),
          end_time: slot.end_time.padEnd(8, ':00'),
        }))
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      setAvailableSlots(available);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
      alert('Failed to fetch available slots: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchBookedClasses = async () => {
    try {
      const response = await axios.post('/api/booking/get-student-bookings/', {
        student_id: userData.user_id,
      });
      setBookedClasses(response.data);
    } catch (error) {
      console.error('Error fetching booked classes:', error);
      alert('Failed to fetch booked classes: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBookSlot = (slot) => {
    if (bookingSlotId) {
      alert('A booking is already in progress.');
      return;
    }
    if (window.confirm(`Book slot on ${slot.date} from ${slot.start_time} to ${slot.end_time}?`)) {
      setBookingSlotId(slot.id);
      sendMessage(JSON.stringify({
        action: 'book_slot',
        slot_id: slot.id,
        student_id: userData.user_id,
      }));
      setTimeout(() => {
        if (bookingSlotId === slot.id) {
          setBookingSlotId(null);
          fetchBookedClasses();
          if (selectedTeacher) {
            fetchAllSlots(selectedTeacher.user_id);
            if (selectedDate) fetchAvailableSlots(selectedTeacher.user_id, selectedDate);
          }
        }
      }, 10000);
    }
  };

  const handlePayment = async (booking) => {
    try {
      const response = await axios.post('/api/payment/create-order/', {
        booking_id: booking.id,
        amount: 500,
        currency: 'INR',
      });
      const options = {
        key: response.data.key,
        amount: response.data.amount,
        currency: response.data.currency,
        name: 'UrbanBook',
        description: 'Payment for class booking',
        order_id: response.data.order_id,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post('/api/payment/verify-payment/', {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            if (verifyResponse.data.success) {
              alert('Payment completed successfully!');
              fetchBookedClasses();
            } else {
              alert('Payment verification failed: ' + verifyResponse.data.message);
            }
          } catch (error) {
            alert('Failed to verify payment: ' + (error.response?.data?.message || error.message));
          }
        },
        prefill: {
          email: userData?.identity_value || '',
          name: userData?.name || 'Student',
        },
        theme: { color: '#9333EA' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Failed to initiate payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const events = allSlots.map((slot) => ({
    title: `${slot.start_time} - ${slot.end_time}`,
    start: new Date(`${slot.date}T${slot.start_time}`),
    end: new Date(`${slot.date}T${slot.end_time}`),
    id: slot.id,
  }));

  const CustomToolbar = ({ date, onNavigate }) => {
    return (
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-800 rounded-lg">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          onClick={() => onNavigate('PREV')}
        >
          Previous
        </button>
        <span className="text-white text-lg font-semibold">{moment(date).format('MMMM YYYY')}</span>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          onClick={() => onNavigate('NEXT')}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        <style>
          {`
            .rbc-calendar {
              background-color: #1F2937;
            }
            .rbc-date-cell {
              color: #FFFFFF !important;
            }
            .rbc-date-cell.rbc-off-range {
              color: #9CA3AF !important;
            }
            .rbc-date-cell.rbc-now {
              color: #FFFFFF !important;
              background-color: #4B5563;
            }
            .rbc-event {
              background-color: #4F46E5 !important;
              color: #FFFFFF !important;
            }
            .rbc-event.rbc-selected {
              background-color: #7C3AED !important;
            }
            .rbc-day-bg {
              background-color: #1F2937;
            }
            .rbc-day-bg.rbc-off-range-bg {
              background-color: #374151;
            }
            .rbc-header {
              background-color: #1F2937;
              color: #FFFFFF;
              border-bottom: 1px solid #4B5563 !important;
            }
            .rbc-time-view {
              background-color: #1F2937;
            }
            .rbc-time-header {
              background-color: #1F2937;
              color: #FFFFFF;
            }
            .rbc-time-content {
              background-color: #1F2937;
              color: #FFFFFF;
            }
            .rbc-time-slot {
              color: #D1D5DB;
            }
            .rbc-today {
              background-color: #4B5563;
            }
          `}
        </style>
        <img src={studentImage} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <motion.h1
            className="text-3xl sm:text-4xl font-bold text-white text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Book Your Classes
          </motion.h1>

          {/* Teachers Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Select a Teacher</h2>
            {isLoadingTeachers ? (
              <p className="text-white">Loading teachers...</p>
            ) : teachers.length === 0 ? (
              <p className="text-white opacity-70">No teachers available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.user_id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedTeacher?.user_id === teacher.user_id
                        ? 'bg-indigo-600 bg-opacity-30 border-2 border-indigo-500'
                        : 'bg-gray-800 bg-opacity-50 border border-gray-600'
                    } hover:bg-indigo-600 hover:bg-opacity-20`}
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setSelectedDate(new Date());
                      setAvailableSlots([]);
                    }}
                  >
                    <p className="text-white font-semibold">{teacher.name}</p>
                    <p className="text-white opacity-60 text-sm">{teacher.subject}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Available Slots</h2>
            <Calendar
              localizer={localizer}
              date={selectedDate}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-600"
              onSelectEvent={(event) => {
                const slot = allSlots.find((s) => s.id === event.id);
                if (slot) handleBookSlot(slot);
              }}
              onSelectSlot={({ start }) => setSelectedDate(start)}
              onNavigate={(newDate) => setSelectedDate(newDate)}
              selectable
              min={new Date()}
              components={{ toolbar: CustomToolbar }}
            />
          </motion.div>

          {/* Available Slots Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Available Slots ({availableSlots.length})</h2>
            {!selectedTeacher ? (
              <p className="text-white opacity-70">Please select a teacher to view available slots.</p>
            ) : !selectedDate ? (
              <p className="text-white opacity-70">Please select a date to view available slots.</p>
            ) : availableSlots.length === 0 ? (
              <div>
                <p className="text-white opacity-70">No available slots for this date.</p>
                <p className="text-white opacity-50 text-sm">Try selecting another date on the calendar.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex justify-between items-center p-4 bg-gray-800 rounded-lg border border-gray-600"
                  >
                    <p className="text-white">
                      {slot.date} {slot.start_time} - {slot.end_time}
                    </p>
                    <button
                      className={`bg-indigo-600 text-white px-4 py-2 rounded-lg transition ${
                        bookingSlotId === slot.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                      }`}
                      onClick={() => handleBookSlot(slot)}
                      disabled={bookingSlotId === slot.id}
                    >
                      {bookingSlotId === slot.id ? 'Booking...' : 'Book Slot'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Booked Classes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Booked Classes</h2>
            {bookedClasses.length === 0 ? (
              <p className="text-white opacity-70">No booked classes.</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {bookedClasses.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-800 rounded-lg border border-gray-600"
                  >
                    <div>
                      <p className="text-white font-semibold">Teacher: {booking.teacher_name}</p>
                      <p className="text-white">
                        {booking.date} {booking.start_time} - {booking.end_time}
                      </p>
                      <p
                        className={`text-sm ${
                          booking.status === 'confirmed'
                            ? 'text-green-400'
                            : booking.status === 'canceled'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                        }`}
                      >
                        Status: {booking.status}
                      </p>
                      {booking.payment_status && <p className="text-green-400 text-sm">Payment: Completed</p>}
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      {!booking.payment_status && (
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                          onClick={() => handlePayment(booking)}
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        onClick={() => setShowMeeting(true)}
                      >
                        Start Class
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Meeting Modal */}
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
                background: '#1F2937',
              },
            }}
          >
            <iframe src={meetingURL} className="w-full h-[70vh]" allow="camera; microphone" title="Video Meeting" />
            <button
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full"
              onClick={() => setShowMeeting(false)}
            >
              Close
            </button>
          </Modal>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StudentBooking;