import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { useOrders } from '../context/OrdersContext';
import { useReservations } from '../context/ReservationsContext';
import { useTheme } from '../context/ThemeContext';
import { restaurantApi } from '../services/restaurantApi';

const tabs = [
  'Incoming Orders',
  'Reservations',
  'Menu Management',
];

const orderStatuses = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Delivered',
  'Cancelled',
];

export default function Dashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { theme } = useTheme();

  const {
    state: orderState,
    dispatch: orderDispatch,
  } = useOrders();

  const {
    menuItems,
    addItem,
    updateItem,
    toggleAvailability,
  } = useMenu();

  const {
    state: reservationState,
    dispatch: reservationDispatch,
  } = useReservations();

  const [activeTab, setActiveTab] =
    useState('Incoming Orders');

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState('');

  const [editingItem, setEditingItem] =
    useState<any>(null);

  const [editPriceValue, setEditPriceValue] =
    useState('');

  if (!user || user.role !== 'Manager') {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: theme.text },
          ]}
        >
          Access Denied
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/menu')}
        >
          <Text style={styles.buttonText}>
            Back to Menu
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const requireToken = () => {
    if (!token) {
      Alert.alert(
        'Authentication Required',
        'Please log in again before making changes.'
      );
      return false;
    }

    return true;
  };

  const changeOrderStatus = async (
    id: string,
    status: string
  ) => {
    if (!requireToken() || busyId) {
      return;
    }

    setBusyId(id);

    try {
      await restaurantApi.updateOrderStatus(
        token,
        id,
        status
      );

      orderDispatch({
        type: 'UPDATE_ORDER_STATUS',
        payload: { id, status },
      });

      Alert.alert(
        'Order Updated',
        `Order status changed to ${status}.`
      );
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error?.message ||
          'Could not update the order status.'
      );
    } finally {
      setBusyId('');
    }
  };

  const changeReservationStatus = async (
    id: string,
    status: 'Confirmed' | 'Cancelled'
  ) => {
    if (!requireToken() || busyId) {
      return;
    }

    setBusyId(id);

    try {
      await restaurantApi.updateReservationStatus(
        token,
        id,
        status
      );

      reservationDispatch({
        type: 'UPDATE_RESERVATION_STATUS',
        payload: {
          id,
          status,
        },
      });

      Alert.alert(
        'Reservation Updated',
        status === 'Confirmed'
          ? 'The reservation has been confirmed.'
          : 'The reservation has been cancelled.'
      );
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error?.message ||
          'Could not update the reservation.'
      );
    } finally {
      setBusyId('');
    }
  };

  const addMenuItem = async () => {
    if (!requireToken() || isSaving) {
      return;
    }

    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert(
        'Missing Information',
        'Enter an item name and price.'
      );
      return;
    }

    const price = Number(newPrice);

    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert(
        'Invalid Price',
        'Enter a valid price greater than zero.'
      );
      return;
    }

    setIsSaving(true);

    try {
      await addItem({
        name: newName.trim(),
        description: 'New menu item',
        price,
        category: 'Mains',
        image: '',
        isSpecial: false,
        isAvailable: true,
      });

      setNewName('');
      setNewPrice('');

      Alert.alert(
        'Success',
        'Menu item saved to the menu.'
      );
    } catch (error: any) {
      Alert.alert(
        'Could Not Add Item',
        error?.message ||
          'The menu item could not be saved.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openEditPrice = (item: any) => {
    setEditingItem(item);
    setEditPriceValue(String(item.price));
  };

  const saveEditedPrice = async () => {
    if (!editingItem || !requireToken() || isSaving) {
      return;
    }

    const price = Number(editPriceValue);

    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert(
        'Invalid Price',
        'Enter a valid price greater than zero.'
      );
      return;
    }

    setIsSaving(true);

    try {
      await updateItem(editingItem.id, { price });

      setEditingItem(null);
      setEditPriceValue('');

      Alert.alert(
        'Success',
        'The menu item price has been updated.'
      );
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error?.message ||
          'Could not update the menu item price.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailability = async (
    id: string
  ) => {
    if (!requireToken() || busyId) {
      return;
    }

    setBusyId(id);

    try {
      await toggleAvailability(id);
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error?.message ||
          'Could not change item availability.'
      );
    } finally {
      setBusyId('');
    }
  };

  return (
    <>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
        contentContainerStyle={styles.content}
      >
        <Text
          style={[
            styles.title,
            { color: theme.text },
          ]}
        >
          Manager Dashboard
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: theme.text },
          ]}
        >
          Welcome, {user.name}
        </Text>

        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab &&
                    styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Incoming Orders' && (
          <View>
            {orderState.orders.length === 0 ? (
              <Text
                style={[
                  styles.empty,
                  { color: theme.text },
                ]}
              >
                No incoming orders.
              </Text>
            ) : (
              orderState.orders
                .slice()
                .reverse()
                .map((order: any) => {
                  const orderId = String(
                    order.id ?? order._id ?? ''
                  );

                  const total = Number(
                    order.total ??
                      order.totalAmount ??
                      0
                  );

                  const orderType =
                    order.type ??
                    order.deliveryAddress ??
                    'Restaurant Order';

                  return (
                    <View
                      key={orderId}
                      style={[
                        styles.card,
                        { backgroundColor: theme.card },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: theme.text },
                        ]}
                      >
                        Order #{orderId.slice(-5)}
                      </Text>

                      <Text style={{ color: theme.text }}>
                        Type: {orderType}
                      </Text>

                      {order.tableNumber && (
                        <Text
                          style={{ color: theme.text }}
                        >
                          Table: {order.tableNumber}
                        </Text>
                      )}

                      <Text
                        style={[
                          styles.orderTotal,
                          { color: theme.text },
                        ]}
                      >
                        Total: Rs. {total.toFixed(2)}
                      </Text>

                      <Text
                        style={[
                          styles.currentOrderStatus,
                          { color: theme.text },
                        ]}
                      >
                        Status: {order.status}
                      </Text>

                      {busyId === orderId && (
                        <ActivityIndicator
                          color={theme.text}
                          style={styles.loader}
                        />
                      )}

                      <View style={styles.statusButtons}>
                        {orderStatuses.map((status) => (
                          <TouchableOpacity
                            key={status}
                            disabled={
                              busyId !== '' ||
                              order.status === status
                            }
                            style={[
                              styles.smallButton,
                              order.status === status &&
                                styles.selectedButton,
                                (busyId !== '' ||
                                  order.status === status) &&
                                  styles.disabledButton,
                            ]}
                            onPress={() =>
                              changeOrderStatus(
                                orderId,
                                status
                              )
                            }
                          >
                            <Text
                              style={styles.smallButtonText}
                            >
                              {status}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                })
            )}
          </View>
        )}

        {activeTab === 'Reservations' && (
          <View>
            {reservationState.reservations.length ===
            0 ? (
              <Text
                style={[
                  styles.empty,
                  { color: theme.text },
                ]}
              >
                No reservations.
              </Text>
            ) : (
              reservationState.reservations
                .slice()
                .reverse()
                .map((reservation: any) => {
                  const reservationId = String(
                    reservation.id ??
                      reservation._id ??
                      ''
                  );

                  return (
                    <View
                      key={reservationId}
                      style={[
                        styles.card,
                        { backgroundColor: theme.card },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: theme.text },
                        ]}
                      >
                        Reservation
                      </Text>

                      <Text style={{ color: theme.text }}>
                        Date: {reservation.date}
                      </Text>

                      <Text style={{ color: theme.text }}>
                        Time: {reservation.time}
                      </Text>

                      <Text style={{ color: theme.text }}>
                        Party Size: {reservation.partySize}
                      </Text>

                      <Text style={{ color: theme.text }}>
                        Table: {reservation.tableId || 'Not assigned'}
                      </Text>

                      <Text style={{ color: theme.text }}>
                        Phone: {reservation.contact || 'Not provided'}
                      </Text>

                      <Text
                        style={[
                          styles.currentOrderStatus,
                          { color: theme.text },
                        ]}
                      >
                        Status: {reservation.status}
                      </Text>

                      {busyId === reservationId && (
                        <ActivityIndicator
                          color={theme.text}
                          style={styles.loader}
                        />
                      )}

                      {reservation.status === 'Pending' && (
                        <View style={styles.statusButtons}>
                          <TouchableOpacity
                            disabled={busyId !== ''}
                            style={[
                              styles.smallButton,
                              styles.acceptButton,
                            ]}
                            onPress={() =>
                              changeReservationStatus(
                                reservationId,
                                'Confirmed'
                              )
                            }
                          >
                            <Text
                              style={styles.smallButtonText}
                            >
                              Confirm
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            disabled={busyId !== ''}
                            style={[
                              styles.smallButton,
                              styles.declineButton,
                            ]}
                            onPress={() =>
                              changeReservationStatus(
                                reservationId,
                                'Cancelled'
                              )
                            }
                          >
                            <Text
                              style={styles.smallButtonText}
                            >
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
            )}
          </View>
        )}

        {activeTab === 'Menu Management' && (
          <View>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.text },
                ]}
              >
                Add Menu Item
              </Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.text,
                  },
                ]}
                placeholder="Item name"
                placeholderTextColor="#888"
                value={newName}
                onChangeText={setNewName}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.text,
                  },
                ]}
                placeholder="Price"
                placeholderTextColor="#888"
                value={newPrice}
                onChangeText={setNewPrice}
                keyboardType="numeric"
              />

              <TouchableOpacity
                disabled={isSaving}
                style={[
                  styles.button,
                  isSaving && styles.disabledButton,
                ]}
                onPress={addMenuItem}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    Add Item
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {menuItems.map((item: any) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: theme.card },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text },
                  ]}
                >
                  {item.name}
                </Text>

                <Text style={{ color: theme.text }}>
                  Category: {item.category}
                </Text>

                <Text style={{ color: theme.text }}>
                  Price: Rs. {Number(item.price).toFixed(2)}
                </Text>

                <Text style={{ color: theme.text }}>
                  Availability:{' '}
                  {item.isAvailable
                    ? 'Available'
                    : 'Unavailable'}
                </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    disabled={isSaving || busyId !== ''}
                    style={styles.smallButton}
                    onPress={() => openEditPrice(item)}
                  >
                    <Text style={styles.smallButtonText}>
                      Edit Price
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={isSaving || busyId !== ''}
                    style={styles.smallButton}
                    onPress={() =>
                      handleToggleAvailability(item.id)
                    }
                  >
                    <Text style={styles.smallButtonText}>
                      {busyId === item.id
                        ? 'Saving...'
                        : 'Toggle Availability'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/menu')}
        >
          <Text style={styles.buttonText}>
            Back to Menu
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={editingItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: theme.text },
              ]}
            >
              Edit Price
            </Text>

            <Text
              style={[
                styles.modalDescription,
                { color: theme.text },
              ]}
            >
              {editingItem?.name}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.text,
                },
              ]}
              value={editPriceValue}
              onChangeText={setEditPriceValue}
              placeholder="Enter new price"
              placeholderTextColor="#888"
              keyboardType="numeric"
              editable={!isSaving}
              autoFocus
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                disabled={isSaving}
                style={styles.smallButton}
                onPress={() => setEditingItem(null)}
              >
                <Text style={styles.smallButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isSaving}
                style={styles.button}
                onPress={saveEditedPrice}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    Save Price
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 20,
  },

  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },

  tab: {
    backgroundColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },

  activeTab: {
    backgroundColor: '#333',
  },

  tabText: {
    color: '#222',
    fontWeight: '600',
  },

  activeTabText: {
    color: '#fff',
  },

  card: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  orderTotal: {
    fontWeight: 'bold',
    marginTop: 8,
  },

  currentOrderStatus: {
    fontWeight: 'bold',
    marginTop: 5,
  },

  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },

  smallButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 7,
    marginRight: 6,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedButton: {
    backgroundColor: '#aaa',
  },

  acceptButton: {
    backgroundColor: '#bbb',
  },

  declineButton: {
    backgroundColor: '#ddd',
  },

  disabledButton: {
    opacity: 0.55,
  },

  smallButtonText: {
    color: '#111',
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderRadius: 7,
    padding: 11,
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#333',
    minHeight: 46,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  empty: {
    fontSize: 16,
    marginVertical: 15,
  },

  loader: {
    marginTop: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },

  modalCard: {
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  modalDescription: {
    marginBottom: 16,
  },
});