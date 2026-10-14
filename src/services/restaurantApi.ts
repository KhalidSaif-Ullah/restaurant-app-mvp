import { apiRequest } from './api';

export const restaurantApi = {
  // Authentication
  login(email: string, password: string) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  getProfile(token: string) {
    return apiRequest('/auth/profile', { token });
  },

  // Menu
  getMenu() {
    return apiRequest('/menu');
  },

  getMenuItem(id: string) {
    return apiRequest('/menu/' + id);
  },

  createMenuItem(token: string, data: object) {
    return apiRequest('/menu', {
      method: 'POST',
      token,
      body: data,
    });
  },

  updateMenuItem(token: string, id: string, data: object) {
    return apiRequest('/menu/' + id, {
      method: 'PUT',
      token,
      body: data,
    });
  },

  deleteMenuItem(token: string, id: string) {
    return apiRequest('/menu/' + id, {
      method: 'DELETE',
      token,
    });
  },

  // Reservations
  getReservations(token: string) {
    return apiRequest('/reservations', { token });
  },

  createReservation(token: string, data: object) {
    return apiRequest('/reservations', {
      method: 'POST',
      token,
      body: data,
    });
  },

  updateReservationStatus(
    token: string,
    id: string,
    status: string
  ) {
    return apiRequest('/reservations/' + id + '/status', {
      method: 'PATCH',
      token,
      body: { status },
    });
  },

  // Orders
  getOrders(token: string) {
    return apiRequest('/orders', { token });
  },

  createOrder(
    token: string,
    data: {
      items: { menuItem: string; quantity: number }[];
      deliveryAddress?: string;
    }
  ) {
    return apiRequest('/orders', {
      method: 'POST',
      token,
      body: data,
    });
  },

  updateOrderStatus(token: string, id: string, status: string) {
    return apiRequest('/orders/' + id + '/status', {
      method: 'PATCH',
      token,
      body: { status },
    });
  },
};