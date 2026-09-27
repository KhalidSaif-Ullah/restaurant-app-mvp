import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import {
  MenuProvider,
  useMenu,
} from '../context/MenuContext';
import {
  OrdersProvider,
  useOrders,
} from '../context/OrdersContext';
import {
  ReservationsProvider,
  useReservations,
} from '../context/ReservationsContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function AppContent() {
  const { theme } = useTheme();
  const { state: orderState } = useOrders();
  const { isLoaded: menuLoaded } = useMenu();
  const { state: reservationState } =
    useReservations();

  const isLoading =
    !orderState.isLoaded ||
    !menuLoaded ||
    !reservationState.isLoaded;

  if (isLoading) {
    return (
      <View
        style={[
          styles.loading,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.text}
        />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="menu"
        options={{ title: 'Menu' }}
      />

      <Stack.Screen
        name="cart"
        options={{ title: 'Cart' }}
      />

      <Stack.Screen
        name="reservation"
        options={{ title: 'Reservation' }}
      />

      <Stack.Screen
        name="tracking"
        options={{ title: 'Order Tracking' }}
      />

      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Manager Dashboard',
        }}
      />

      <Stack.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <OrdersProvider>
            <MenuProvider>
              <ReservationsProvider>
                <AppContent />
              </ReservationsProvider>
            </MenuProvider>
          </OrdersProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});