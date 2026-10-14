
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { restaurantApi } from '../services/restaurantApi';

const SERVICE_RATE = 0.05;
const SALES_TAX_RATE = 0.15;

export default function Cart() {
  const router = useRouter();
  const { state, dispatch } = useCart();
  const { theme } = useTheme();
  const { dispatch: orderDispatch } = useOrders();
  const { user, token } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [orderType, setOrderType] = useState('Dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totals = useMemo(() => {
    const subtotal = state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const serviceCharge = subtotal * SERVICE_RATE;
    const salesTax = subtotal * SALES_TAX_RATE;
    const discount = subtotal * (state.discountPercent / 100);

    const grandTotal =
      subtotal + serviceCharge + salesTax - discount;

    return {
      subtotal,
      serviceCharge,
      salesTax,
      discount,
      grandTotal,
    };
  }, [state.items, state.discountPercent]);

  const applyPromo = () => {
    dispatch({
      type: 'APPLY_PROMO',
      payload: promoCode,
    });
  };

  const clearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from the cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => dispatch({ type: 'CLEAR_CART' }),
        },
      ]
    );
  };

  const placeOrder = async () => {
    if (state.items.length === 0) {
      Alert.alert('Empty Cart', 'Add items before placing an order.');
      return;
    }

    if (!user || !token) {
      Alert.alert(
        'Login Required',
        'Please log in before placing an order.'
      );
      return;
    }

    if (
      orderType === 'Dine-in' &&
      tableNumber.trim() === ''
    ) {
      Alert.alert(
        'Table Required',
        'Enter a table number for dine-in.'
      );
      return;
    }

    if (
      orderType === 'Takeaway' &&
      pickupTime.trim() === ''
    ) {
      Alert.alert(
        'Pickup Time Required',
        'Enter a pickup time for takeaway.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const deliveryAddress =
        orderType === 'Dine-in'
          ? `Dine-in table: ${tableNumber.trim()}`
          : `Takeaway pickup: ${pickupTime.trim()}`;

      const result = await restaurantApi.createOrder(token, {
        items: state.items.map((item) => ({
          menuItem: String(item.id),
          quantity: Number(item.quantity),
        })),
        deliveryAddress,
      });

      const savedOrder =
        result.order || result.data?.order || result;

      if (!savedOrder._id && !savedOrder.id) {
        throw new Error(
          'The server did not return a saved order. Please check your orders before trying again.'
        );
      }

      const order = {
        ...savedOrder,
        id: String(savedOrder._id || savedOrder.id),
        items: (savedOrder.items || []).map((item) => ({
          id: String(
            item.menuItem?._id ||
              item.menuItem ||
              item.id ||
              item.name
          ),
          name: item.name || item.menuItem?.name || 'Menu item',
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          note: '',
        })),
        total: Number(savedOrder.totalAmount ?? totals.subtotal),
        type: orderType,
        tableNumber:
          orderType === 'Dine-in' ? tableNumber.trim() : null,
        pickupTime:
          orderType === 'Takeaway' ? pickupTime.trim() : null,
        status: savedOrder.status || 'Pending',
        timestamp: savedOrder.createdAt
          ? new Date(savedOrder.createdAt).getTime()
          : Date.now(),
      };

      orderDispatch({
        type: 'ADD_ORDER',
        payload: order,
      });

      dispatch({ type: 'CLEAR_CART' });

      Alert.alert(
        'Order Placed',
        `Your order #${order.id.slice(-5)} has been saved.\nDatabase total: Rs. ${order.total.toFixed(2)}`,
        [
          {
            text: 'Track Order',
            onPress: () => router.push('/tracking'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Order Failed',
        error.message || 'Could not place your order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text
        style={[styles.title, { color: theme.text }]}
      >
        Your Cart
      </Text>

      {state.items.length === 0 ? (
        <View style={styles.empty}>
          <Text
            style={[styles.emptyText, { color: theme.text }]}
          >
            Your cart is empty.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/menu')}
          >
            <Text style={styles.buttonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={state.items}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card },
              ]}
            >
              <Text
                style={[styles.itemName, { color: theme.text }]}
              >
                {item.name}
              </Text>

              <Text
                style={[styles.price, { color: theme.text }]}
              >
                Rs. {item.price} × {item.quantity}
              </Text>

              <TextInput
                style={[
                  styles.noteInput,
                  {
                    color: theme.text,
                    borderColor: theme.text,
                  },
                ]}
                placeholder="Special instructions"
                placeholderTextColor="#888"
                value={item.note || ''}
                onChangeText={(note) =>
                  dispatch({
                    type: 'UPDATE_NOTE',
                    payload: { id: item.id, note },
                  })
                }
              />

              <View style={styles.controls}>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() =>
                    dispatch({
                      type: 'DECREMENT',
                      payload: item.id,
                    })
                  }
                >
                  <Text style={styles.buttonText}>−</Text>
                </TouchableOpacity>

                <Text
                  style={[styles.quantity, { color: theme.text }]}
                >
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() =>
                    dispatch({
                      type: 'INCREMENT',
                      payload: item.id,
                    })
                  }
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() =>
                    dispatch({
                      type: 'REMOVE_ITEM',
                      payload: item.id,
                    })
                  }
                >
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View>
              <View style={styles.promoRow}>
                <TextInput
                  style={[
                    styles.promoInput,
                    {
                      color: theme.text,
                      borderColor: theme.text,
                    },
                  ]}
                  placeholder="Promo code"
                  placeholderTextColor="#888"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={applyPromo}
                >
                  <Text style={styles.buttonText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {state.promoError !== '' && (
                <Text style={styles.error}>
                  {state.promoError}
                </Text>
              )}

              {state.promoCode !== '' && (
                <Text
                  style={[styles.applied, { color: theme.text }]}
                >
                  {state.promoCode} applied:{' '}
                  {state.discountPercent}% off
                </Text>
              )}

              <View style={styles.summary}>
                <Text
                  style={[styles.summaryText, { color: theme.text }]}
                >
                  Subtotal: Rs. {totals.subtotal.toFixed(2)}
                </Text>

                <Text
                  style={[styles.summaryText, { color: theme.text }]}
                >
                  Service (5%): Rs.{' '}
                  {totals.serviceCharge.toFixed(2)}
                </Text>

                <Text
                  style={[styles.summaryText, { color: theme.text }]}
                >
                  Sales Tax (15%): Rs.{' '}
                  {totals.salesTax.toFixed(2)}
                </Text>

                <Text
                  style={[styles.summaryText, { color: theme.text }]}
                >
                  Discount: Rs. {totals.discount.toFixed(2)}
                </Text>

                <Text
                  style={[styles.total, { color: theme.text }]}
                >
                  Grand Total: Rs. {totals.grandTotal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.orderSection}>
                <Text
                  style={[styles.orderTitle, { color: theme.text }]}
                >
                  Order Type
                </Text>

                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      orderType === 'Dine-in' && styles.selectedType,
                    ]}
                    onPress={() => setOrderType('Dine-in')}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        orderType === 'Dine-in' &&
                          styles.selectedTypeText,
                      ]}
                    >
                      Dine-in
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      orderType === 'Takeaway' && styles.selectedType,
                    ]}
                    onPress={() => setOrderType('Takeaway')}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        orderType === 'Takeaway' &&
                          styles.selectedTypeText,
                      ]}
                    >
                      Takeaway
                    </Text>
                  </TouchableOpacity>
                </View>

                {orderType === 'Dine-in' ? (
                  <TextInput
                    style={[
                      styles.orderInput,
                      {
                        color: theme.text,
                        borderColor: theme.text,
                      },
                    ]}
                    placeholder="Table number"
                    placeholderTextColor="#888"
                    value={tableNumber}
                    onChangeText={setTableNumber}
                  />
                ) : (
                  <TextInput
                    style={[
                      styles.orderInput,
                      {
                        color: theme.text,
                        borderColor: theme.text,
                      },
                    ]}
                    placeholder="Pickup time e.g. 19:30"
                    placeholderTextColor="#888"
                    value={pickupTime}
                    onChangeText={setPickupTime}
                  />
                )}

                <TouchableOpacity
                  style={[
                    styles.placeOrderButton,
                    isSubmitting && styles.disabledButton,
                  ]}
                  onPress={placeOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      Place Order
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearCart}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Clear Cart</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 35,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    marginTop: 5,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  smallButton: {
    backgroundColor: '#333',
    width: 35,
    height: 35,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  promoRow: {
    flexDirection: 'row',
    paddingTop: 5,
    gap: 8,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 5,
  },
  applied: {
    marginTop: 5,
  },
  summary: {
    paddingVertical: 15,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  orderSection: {
    paddingBottom: 10,
  },
  orderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  typeText: {
    fontWeight: 'bold',
  },
  selectedTypeText: {
    color: '#fff',
  },
  orderInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 11,
    minHeight: 45,
    marginTop: 10,
  },
  placeOrderButton: {
    backgroundColor: '#333',
    minHeight: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  clearButton: {
    backgroundColor: '#333',
    marginTop: 10,
    marginBottom: 20,
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 15,
  },
});