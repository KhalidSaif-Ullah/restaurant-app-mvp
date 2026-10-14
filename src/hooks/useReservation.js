import { useState } from 'react';
import { useReservations } from '../context/ReservationsContext';
import { useAuth } from '../context/AuthContext';
import { restaurantApi } from '../services/restaurantApi';

const mockTables = [
  { id: 'T1', seats: 2 },
  { id: 'T2', seats: 4 },
  { id: 'T3', seats: 4 },
  { id: 'T4', seats: 6 },
  { id: 'T5', seats: 8 },
  { id: 'T6', seats: 12 },
];

export default function useReservation() {
  const { state, dispatch } = useReservations();
  const { token } = useAuth();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [contact, setContact] = useState('');

  const reservations = state.reservations || [];

  const timeSlots = Array.from({ length: 21 }, (_, index) => {
    const totalMinutes = 12 * 60 + index * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }).filter((time) => time <= '22:00');

  const getAvailableTable = (size) =>
    mockTables.find((table) => table.seats >= Number(size));

  const isSlotAvailable = (date, time) =>
    !reservations.some((reservation) =>
      reservation.date === date &&
      reservation.time === time &&
      !['Cancelled', 'Declined'].includes(reservation.status)
    );

  const createReservation = async () => {
    if (!token) {
      return { success: false, message: 'Please log in first.' };
    }

    if (!selectedDate || !selectedTime) {
      return { success: false, message: 'Select a date and time.' };
    }

    if (!/^03\d{2}-\d{7}$/.test(contact)) {
      return {
        success: false,
        message: 'Enter your phone number in the format 03XX-XXXXXXX.',
      };
    }

    if (Number(partySize) < 1 || Number(partySize) > 12) {
      return { success: false, message: 'Party size must be between 1 and 12.' };
    }

    const table = getAvailableTable(partySize);

    if (!table) {
      return { success: false, message: 'No suitable table is available.' };
    }

    if (!isSlotAvailable(selectedDate, selectedTime)) {
      return {
        success: false,
        message: 'This time slot already has a reservation.',
      };
    }

    try {
      const result = await restaurantApi.createReservation(token, {
        date: selectedDate,
        time: selectedTime,
        guests: Number(partySize),
        notes: `Phone: ${contact}; Table: ${table.id}`,
      });

      const raw = result.reservation || result.data?.reservation || result;
      const reservation = {
        ...raw,
        id: String(raw._id || raw.id),
        date: raw.date ? String(raw.date).slice(0, 10) : selectedDate,
        time: raw.time || selectedTime,
        partySize: Number(raw.guests ?? partySize),
        tableId: table.id,
        contact,
        status: raw.status || 'Pending',
      };

      dispatch({ type: 'ADD_RESERVATION', payload: reservation });

      return { success: true, reservation };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Could not create reservation.',
      };
    }
  };

  const cancelReservation = async (id) => {
    if (!token) {
      return { success: false, message: 'Please log in first.' };
    }

    try {
      await restaurantApi.updateReservationStatus(token, String(id), 'Cancelled');
      dispatch({
        type: 'UPDATE_RESERVATION_STATUS',
        payload: { id: String(id), status: 'Cancelled' },
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Could not cancel reservation.',
      };
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    partySize,
    setPartySize,
    contact,
    setContact,
    reservations,
    timeSlots,
    getAvailableTable,
    isSlotAvailable,
    createReservation,
    cancelReservation,
  };
}