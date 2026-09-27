import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useContext,
    useEffect,
    useReducer,
} from 'react';
  
  const ReservationsContext = createContext(null);
  
  const STORAGE_KEY = '@restaurant_reservations';
  
  const initialState = {
    reservations: [],
    isLoaded: false,
  };
  
  function reservationsReducer(state, action) {
    switch (action.type) {
      case 'LOAD_RESERVATIONS':
        return {
          reservations: action.payload,
          isLoaded: true,
        };
  
      case 'ADD_RESERVATION':
        return {
          ...state,
          reservations: [
            ...state.reservations,
            action.payload,
          ],
        };
  
      case 'UPDATE_RESERVATION_STATUS':
        return {
          ...state,
          reservations: state.reservations.map(
            (reservation) =>
              reservation.id === action.payload.id
                ? {
                    ...reservation,
                    status: action.payload.status,
                  }
                : reservation
          ),
        };
  
      case 'REMOVE_RESERVATION':
        return {
          ...state,
          reservations: state.reservations.filter(
            (reservation) =>
              reservation.id !== action.payload
          ),
        };
  
      default:
        return state;
    }
  }
  
  export function ReservationsProvider({
    children,
  }) {
    const [state, dispatch] = useReducer(
      reservationsReducer,
      initialState
    );
  
    useEffect(() => {
      const loadReservations = async () => {
        try {
          const saved =
            await AsyncStorage.getItem(
              STORAGE_KEY
            );
  
          dispatch({
            type: 'LOAD_RESERVATIONS',
            payload: saved
              ? JSON.parse(saved)
              : [],
          });
        } catch (error) {
          console.log(
            'Failed to load reservations:',
            error
          );
  
          dispatch({
            type: 'LOAD_RESERVATIONS',
            payload: [],
          });
        }
      };
  
      loadReservations();
    }, []);
  
    useEffect(() => {
      if (!state.isLoaded) {
        return;
      }
  
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.reservations)
      ).catch((error) => {
        console.log(
          'Failed to save reservations:',
          error
        );
      });
    }, [state.reservations, state.isLoaded]);
  
    return (
      <ReservationsContext.Provider
        value={{ state, dispatch }}
      >
        {children}
      </ReservationsContext.Provider>
    );
  }
  
  export function useReservations() {
    const context = useContext(
      ReservationsContext
    );
  
    if (!context) {
      throw new Error(
        'useReservations must be used inside ReservationsProvider'
      );
    }
  
    return context;
  }