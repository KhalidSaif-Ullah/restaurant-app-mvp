import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    useContext,
    useEffect,
    useReducer,
} from 'react';
  
  const OrdersContext = createContext(null);
  
  const STORAGE_KEY = '@restaurant_orders';
  
  const initialState = {
    orders: [],
    isLoaded: false,
  };
  
  function ordersReducer(state, action) {
    switch (action.type) {
      case 'LOAD_ORDERS':
        return {
          orders: action.payload,
          isLoaded: true,
        };
  
      case 'ADD_ORDER':
        return {
          ...state,
          orders: [
            ...state.orders,
            action.payload,
          ],
        };
  
      case 'UPDATE_ORDER_STATUS':
        return {
          ...state,
          orders: state.orders.map((order) =>
            order.id === action.payload.id
              ? {
                  ...order,
                  status: action.payload.status,
                }
              : order
          ),
        };
  
      case 'CLEAR_ORDERS':
        return {
          ...state,
          orders: [],
        };
  
      default:
        return state;
    }
  }
  
  export function OrdersProvider({
    children,
  }) {
    const [state, dispatch] = useReducer(
      ordersReducer,
      initialState
    );
  
    useEffect(() => {
      const loadOrders = async () => {
        try {
          const saved =
            await AsyncStorage.getItem(
              STORAGE_KEY
            );
  
          dispatch({
            type: 'LOAD_ORDERS',
            payload: saved
              ? JSON.parse(saved)
              : [],
          });
        } catch (error) {
          console.log(
            'Failed to load orders:',
            error
          );
  
          dispatch({
            type: 'LOAD_ORDERS',
            payload: [],
          });
        }
      };
  
      loadOrders();
    }, []);
  
    useEffect(() => {
      if (!state.isLoaded) {
        return;
      }
  
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.orders)
      ).catch((error) => {
        console.log(
          'Failed to save orders:',
          error
        );
      });
    }, [state.orders, state.isLoaded]);
  
    return (
      <OrdersContext.Provider
        value={{ state, dispatch }}
      >
        {children}
      </OrdersContext.Provider>
    );
  }
  
  export function useOrders() {
    const context = useContext(OrdersContext);
  
    if (!context) {
      throw new Error(
        'useOrders must be used inside OrdersProvider'
      );
    }
  
    return context;
  }