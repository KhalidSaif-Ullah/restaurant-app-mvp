import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restaurantApi } from '../services/restaurantApi';
import { useAuth } from './AuthContext';

const OrdersContext = createContext(null);
const ORDERS_KEY = '@restaurant_orders';

const initialState = { orders: [], isLoaded: false };

function normalizeOrder(order) {
  const address = order.deliveryAddress || '';

  return {
    ...order,
    id: String(order._id || order.id),
    total: Number(order.totalAmount ?? order.total ?? 0),
    type: address.startsWith('Dine-in') ? 'Dine-in' : 'Takeaway',
    tableNumber: address.startsWith('Dine-in')
      ? address.replace('Dine-in table: ', '')
      : null,
    pickupTime: address.startsWith('Takeaway')
      ? address.replace('Takeaway pickup: ', '')
      : null,
    timestamp: order.createdAt
      ? new Date(order.createdAt).getTime()
      : order.timestamp || Date.now(),
    items: (order.items || []).map((item) => ({
      ...item,
      id: String(item.menuItem?._id || item.menuItem || item.id || item.name),
      name: item.name || item.menuItem?.name || 'Menu item',
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
    })),
  };
}

function extractOrders(data) {
  if (Array.isArray(data)) return data;
  return data?.orders || [];
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_ORDERS':
      return { ...state, orders: action.payload, isLoaded: true };

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
      };

    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === String(action.payload.id)
            ? { ...order, status: action.payload.status }
            : order
        ),
      };

    case 'CLEAR_ORDERS':
      return { ...state, orders: [] };

    default:
      return state;
  }
}

export function OrdersProvider({ children }) {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!token) {
        dispatch({ type: 'LOAD_ORDERS', payload: [] });
        return;
      }

      try {
        const data = await restaurantApi.getOrders(token);
        const orders = extractOrders(data).map(normalizeOrder);

        if (active) {
          dispatch({ type: 'LOAD_ORDERS', payload: orders });
          await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        }
      } catch (error) {
        console.error('Could not load orders:', error.message);

        if (active) {
          dispatch({ type: 'LOAD_ORDERS', payload: [] });
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <OrdersContext.Provider value={{ state, dispatch }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used inside OrdersProvider');
  return context;
}