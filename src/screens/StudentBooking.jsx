
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import useWebSocket from 'react-use-websocket';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Modal from 'react-modal';
import studentImage from '../assets/images/10.jpg';

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
        <div className="text-white p-4 bg-red-500 bg-opacity-20 rounded">
          <p>Something went wrong: {this.state.error.message}</p>
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
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
  const [selectedDate, setSelectedDate] = useState(null);
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
        <p className="text-white">Redirecting to login...</p>
      </div>
    );
  }

  console.log('StudentBooking initialized with user_id:', userData.user_id);
  console.log('Full userData:', userData);

  const getWebSocketUrl = () => {
    const wsUrl = `/ws/booking/${userData.user_id}/`;
    console.log('Generated WebSocket URL:', wsUrl);
    return wsUrl;
  };

  const { sendMessage, lastMessage, readyState } = useWebSocket(getWebSocketUrl(), {
    onOpen: () => {
      console.log('WebSocket Connected for StudentBooking:', getWebSocketUrl());
      console.log('WebSocket ReadyState:', readyState);
      console.log('User ID being used:', userData.user_id);
    },
    onError: (error) => {
      console.error('WebSocket Error in StudentBooking:', error);
      console.error('WebSocket URL:', getWebSocketUrl());
      console.error('WebSocket ReadyState:', readyState);
      console.error('User Data:', userData);
      alert('WebSocket connection failed. Please check your network or try again later.');
    },
    onClose: (event) => {
      console.error('WebSocket Disconnected in StudentBooking. Code:', event.code, 'Reason:', event.reason);
      console.error('WebSocket URL:', getWebSocketUrl());
      console.error('User ID:', userData.user_id);
      if (event.code === 1000) {
        console.warn('Normal closure (1000). Server may have closed the connection intentionally.');
      } else if (event.code === 1006) {
        console.error('Abnormal closure (1006). Possible causes: Backend rejected connection, invalid user_id, or network issue.');
        alert('WebSocket connection closed unexpectedly. Please ensure your user ID is valid and try again.');
      } else if (event.code === 1008) {
        console.error('Policy violation (1008). Possible causes: Invalid user_id or unauthorized access.');
        alert('Access denied. Please log in again.');
        navigate('/auth/Student');
      }
    },
    shouldReconnect: (closeEvent) => {
      console.log('Attempting to reconnect WebSocket. Close event code:', closeEvent?.code);
      if (closeEvent?.code === 1000 || closeEvent?.code === 1008) {
        console.log('Not reconnecting due to close code:', closeEvent.code);
        return false;
      }
      return true;
    },
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
        console.log('WebSocket Message:', data);
        if (data.type === 'booking_update') {
          console.log('Processing booking_update:', data);
          setAvailableSlots((prev) => prev.filter((slot) => slot.id !== data.booking.slot_id));
          setAllSlots((prev) => prev.filter((slot) => slot.id !== data.booking.slot_id));
          setBookingSlotId(null);
          fetchBookedClasses();
          if (selectedTeacher) {
            fetchAllSlots(selectedTeacher.user_id);
            if (selectedDate) fetchAvailableSlots(selectedTeacher.user_id, selectedDate);
          }
        } else if (data.type === 'slot_update' && selectedTeacher) {
          console.log('Processing slot_update:', data);
          if (data.slot && !data.slot.is_booked && data.slot.teacher_id === selectedTeacher.user_id) {
            setAllSlots((prev) => {
              if (prev.some((slot) => slot.id === data.slot.id)) return prev;
              return [...prev, {
                ...data.slot,
                start_time: data.slot.start_time.padEnd(8, ':00'),
                end_time: data.slot.end_time.padEnd(8, ':00'),
              }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.start_time.localeCompare(b.start_time));
            });
            if (selectedDate && data.slot.date === moment(selectedDate).format('YYYY-MM-DD')) {
              setAvailableSlots((prev) => {
                if (prev.some((slot) => slot.id === data.slot.id)) return prev;
                return [...prev, {
                  ...data.slot,
                  start_time: data.slot.start_time.padEnd(8, ':00'),
                  end_time: data.slot.end_time.padEnd(8, ':00'),
                }].sort((a, b) => a.start_time.localeCompare(b.start_time));
              });
            }
          } else if (data.action === 'deleted') {
            setAllSlots((prev) => prev.filter((slot) => slot.id !== data.slot_id));
            setAvailableSlots((prev) => prev.filter((slot) => slot.id !== data.slot_id));
          }
        } else if (data.type === 'error') {
          console.error('WebSocket Error Message:', data);
          setBookingSlotId(null);
          alert(data.message || 'An error occurred with the WebSocket connection.');
        } else {
          console.warn('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error, 'Raw message:', lastMessage.data);
        alert('Error processing WebSocket message. Please try again.');
      }
    }
  }, [lastMessage, selectedTeacher, selectedDate]);

  useEffect(() => {
    if (selectedTeacher) {
      console.log('Selected teacher changed, fetching slots for:', selectedTeacher.user_id);
      fetchAllSlots(selectedTeacher.user_id);
    }
  }, [selectedTeacher]);

  useEffect(() => {
    if (selectedTeacher && selectedDate) {
      console.log('Selected date changed, fetching available slots for:', selectedTeacher.user_id, selectedDate);
      fetchAvailableSlots(selectedTeacher.user_id, selectedDate);
    }
  }, [selectedTeacher, selectedDate]);

  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      console.log('Fetching teachers from /api/teacher/list-teachers/');
      const response = await axios.get('/api/teacher/list-teachers/');
      console.log('Raw API response:', response);
      if (!Array.isArray(response.data)) {
        throw new Error(`Invalid response format: Expected an array, got ${JSON.stringify(response.data)}`);
      }
      console.log('Teachers fetched:', response.data);
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      console.error('Error response:', error.response?.data);
      setTeachers([]);
      alert(`Failed to fetch teachers: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const fetchAllSlots = async (teacherId) => {
    try {
      console.log('Fetching all slots for teacher:', teacherId);
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
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.start_time.localeCompare(b.start_time));
      console.log('All slots fetched and filtered:', sortedSlots);
      setAllSlots(sortedSlots);
    } catch (error) {
      console.error('Error fetching all slots:', error);
      setAllSlots([]);
      alert('Failed to fetch slots: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchAvailableSlots = async (teacherId, date) => {
    try {
      console.log('Fetching available slots for teacher:', teacherId, 'date:', date);
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
      console.log('Available slots fetched:', available);
      setAvailableSlots(available);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
      alert('Failed to fetch available slots: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchBookedClasses = async () => {
    try {
      console.log('Fetching booked classes for student:', userData.user_id);
      const response = await axios.post('/api/booking/get-student-bookings/', {
        student_id: userData.user_id,
      });
      console.log('Booked classes fetched:', response.data);
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
      console.log('Booking slot:', slot.id, 'for student:', userData.user_id);
      setBookingSlotId(slot.id);
      const message = {
        action: 'book_slot',
        slot_id: slot.id,
        student_id: userData.user_id,
      };
      console.log('Sending WebSocket message:', message);
      sendMessage(JSON.stringify(message));
      setTimeout(() => {
        if (bookingSlotId === slot.id) {
          console.log('Booking timeout reached, refreshing data');
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

  const getReadyStateText = (state) => {
    switch (state) {
      case 0: return 'CONNECTING';
      case 1: return 'OPEN';
      case 2: return 'CLOSING';
      case 3: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 relative">
        <img src={studentImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-55"></div>
        <div className="relative max-w-4xl mx-auto p-6">
          <motion.h1
            className="text-4xl font-bold text-white text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Book Classes
          </motion.h1>

          <div className="mb-4 p-2 bg-white bg-opacity-10 rounded text-white text-sm">
            <p>WebSocket Status: <span className={readyState === 1 ? 'text-green-400' : 'text-red-400'}>{getReadyStateText(readyState)}</span></p>
            <p>User ID: {userData?.user_id}</p>
            <p>WebSocket URL: {getWebSocketUrl()}</p>
            <p>Last Message: {lastMessage ? 'Received' : 'None'}</p>
            {readyState === 3 && (
              <div className="text-red-400">
                <p>Connection failed - Check if user exists in backend and endpoint is correct</p>
                <p>Compare with TeacherBooking WebSocket URL format</p>
              </div>
            )}
            <button
              className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
              onClick={() => {
                console.log('Manual connection test - Current userData:', userData);
                console.log('Manual connection test - WebSocket URL:', getWebSocketUrl());
                console.log('Manual connection test - ReadyState:', readyState);
              }}
            >
              Log Debug Info
            </button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h2 className="text-2xl font-bold text-white mb-4">Select Teacher</h2>
            {isLoadingTeachers ? (
              <p className="text-white">Loading teachers...</p>
            ) : teachers.length === 0 ? (
              <p className="text-white text-opacity-70">No teachers available.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.user_id}
                    className={`p-4 rounded-lg cursor-pointer ${
                      selectedTeacher?.user_id === teacher.user_id
                        ? 'bg-indigo-600 bg-opacity-20 border-2 border-indigo-600'
                        : 'bg-white bg-opacity-10 border border-white border-opacity-20'
                    }`}
                    onClick={() => {
                      console.log('Teacher selected:', teacher);
                      setSelectedTeacher(teacher);
                      setSelectedDate(null);
                      setAvailableSlots([]);
                    }}
                  >
                    <p className="text-white font-bold">{teacher.name}</p>
                    <p className="text-white text-opacity-60 text-sm">{teacher.subject}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h2 className="text-2xl font-bold text-white mb-4">Available Slots</h2>
            <Calendar
              localizer={localizer}
              date={selectedDate || undefined}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-20"
              onSelectEvent={(event) => {
                const slot = allSlots.find((s) => s.id === event.id);
                if (slot) handleBookSlot(slot);
              }}
              onSelectSlot={({ start }) => {
                console.log('Date selected on calendar:', start);
                setSelectedDate(start);
              }}
              selectable
              min={new Date()}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <h2 className="text-2xl font-bold text-white mb-4">Available Slots ({availableSlots.length})</h2>
            {!selectedTeacher ? (
              <p className="text-white text-opacity-70">Please select a teacher to view available slots.</p>
            ) : !selectedDate ? (
              <p className="text-white text-opacity-70">Please select a date to view available slots.</p>
            ) : availableSlots.length === 0 ? (
              <div>
                <p className="text-white text-opacity-70">No available slots for this date.</p>
                <p className="text-white text-opacity-50 text-sm">Try selecting another date on the calendar.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex justify-between items-center p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20"
                  >
                    <p className="text-white">
                      {slot.date} {slot.start_time} - {slot.end_time}
                    </p>
                    <button
                      className={`bg-indigo-600 text-white px-4 py-2 rounded-full ${
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <h2 className="text-2xl font-bold text-white mb-4">Booked Classes</h2>
            {bookedClasses.length === 0 ? (
              <p className="text-white text-opacity-70">No booked classes.</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {bookedClasses.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex justify-between items-center p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20"
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
                    <div className="flex space-x-2">
                      {!booking.payment_status && (
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          onClick={() => handlePayment(booking)}
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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
            <iframe src={meetingURL} className="w-full h-[70vh]" allow="camera; microphone" title="Video Meeting" />
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full w-full"
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