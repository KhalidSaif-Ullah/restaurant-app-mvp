import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restaurantApi } from '../services/restaurantApi';
import { useAuth } from './AuthContext';

const ReservationsContext = createContext(null);
const RESERVATIONS_KEY = '@restaurant_reservations';

const initialState = { reservations: [], isLoaded: false };

function normalizeReservation(reservation) {
  const notes = reservation.notes || '';
  const phoneMatch = notes.match(/Phone:\s*([^;]+)/);
  const tableMatch = notes.match(/Table:\s*([^;]+)/);

  return {
    ...reservation,
    id: String(reservation._id || reservation.id),
    date: reservation.date
      ? String(reservation.date).slice(0, 10)
      : '',
    time: reservation.time || '',
    partySize: Number(reservation.guests ?? reservation.partySize ?? 2),
    contact: phoneMatch ? phoneMatch[1].trim() : '',
    tableId: tableMatch ? tableMatch[1].trim() : '',
    status: reservation.status || 'Pending',
  };
}

function extractReservations(data) {
  if (Array.isArray(data)) return data;
  return data?.reservations || [];
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_RESERVATIONS':
      return {
        ...state,
        reservations: action.payload,
        isLoaded: true,
      };

    case 'ADD_RESERVATION':
      return {
        ...state,
        reservations: [action.payload, ...state.reservations],
      };

    case 'UPDATE_RESERVATION_STATUS':
      return {
        ...state,
        reservations: state.reservations.map((reservation) =>
          reservation.id === String(action.payload.id)
            ? { ...reservation, status: action.payload.status }
            : reservation
        ),
      };

    case 'REMOVE_RESERVATION':
      return {
        ...state,
        reservations: state.reservations.filter(
          (reservation) => reservation.id !== String(action.payload)
        ),
      };

    default:
      return state;
  }
}

export function ReservationsProvider({ children }) {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let active = true;

    async function loadReservations() {
      if (!token) {
        dispatch({ type: 'LOAD_RESERVATIONS', payload: [] });
        return;
      }

      try {
        const data = await restaurantApi.getReservations(token);
        const reservations = extractReservations(data).map(normalizeReservation);

        if (active) {
          dispatch({ type: 'LOAD_RESERVATIONS', payload: reservations });
          await AsyncStorage.setItem(
            RESERVATIONS_KEY,
            JSON.stringify(reservations)
          );
        }
      } catch (error) {
        console.error('Could not load reservations:', error.message);

        if (active) {
          dispatch({ type: 'LOAD_RESERVATIONS', payload: [] });
        }
      }
    }

    loadReservations();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <ReservationsContext.Provider value={{ state, dispatch }}>
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationsContext);

  if (!context) {
    throw new Error('useReservations must be used inside ReservationsProvider');
  }

  return context;
}