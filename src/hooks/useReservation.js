import { useState } from 'react';
import { useReservations } from '../context/ReservationsContext';

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

  const [selectedDate, setSelectedDate] =
    useState('');
  const [selectedTime, setSelectedTime] =
    useState('');
  const [partySize, setPartySize] = useState(2);
  const [contact, setContact] = useState('');

  const reservations = state.reservations;

  const timeSlots = Array.from(
    { length: 11 },
    (_, index) => {
      const hour = index + 12;
      return `${hour}:00`;
    }
  );

  const isValidPhone =
    /^03\d{2}-\d{7}$/.test(contact);

  const getAvailableTable = () => {
    return mockTables.find(
      (table) =>
        table.seats >= Number(partySize)
    );
  };

  const isSlotAvailable = (date, time) => {
    return !reservations.some(
      (reservation) =>
        reservation.date === date &&
        reservation.time === time &&
        reservation.status !== 'Declined'
    );
  };

  const createReservation = () => {
    if (!selectedDate || !selectedTime) {
      return {
        success: false,
        message: 'Please select a date and time.',
      };
    }

    if (
      Number(partySize) < 1 ||
      Number(partySize) > 12
    ) {
      return {
        success: false,
        message:
          'Party size must be between 1 and 12.',
      };
    }

    if (!isValidPhone) {
      return {
        success: false,
        message:
          'Phone must be in format 03XX-XXXXXXX.',
      };
    }

    const table = getAvailableTable();

    if (!table) {
      return {
        success: false,
        message:
          'No suitable table is available.',
      };
    }

    if (
      !isSlotAvailable(
        selectedDate,
        selectedTime
      )
    ) {
      return {
        success: false,
        message:
          'This time slot is unavailable.',
      };
    }

    const reservation = {
      id: Date.now().toString(),
      date: selectedDate,
      time: selectedTime,
      partySize: Number(partySize),
      tableId: table.id,
      contact,
      status: 'Pending',
    };

    dispatch({
      type: 'ADD_RESERVATION',
      payload: reservation,
    });

    return {
      success: true,
      reservation,
    };
  };

  const cancelReservation = (id) => {
    dispatch({
      type: 'REMOVE_RESERVATION',
      payload: id,
    });
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
    timeSlots,
    reservations,
    createReservation,
    cancelReservation,
    isSlotAvailable,
  };
}