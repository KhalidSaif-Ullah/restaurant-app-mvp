import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
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

const tabs = [
  'Incoming Orders',
  'Reservations',
  'Menu Management',
];

const statuses = [
  'Pending',
  'Preparing',
  'Ready',
  'Served',
];

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
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
  const [newPrice, setNewPrice] =
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

  const changeOrderStatus = (
    id: string,
    status: string
  ) => {
    orderDispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { id, status },
    });
  };

  const changeReservationStatus = (
    id: string,
    status: string
  ) => {
    reservationDispatch({
      type: 'UPDATE_RESERVATION_STATUS',
      payload: {
        id,
        status,
      },
    });
  };

  const addMenuItem = () => {
    if (
      !newName.trim() ||
      !newPrice.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Enter an item name and price.'
      );
      return;
    }

    const price = Number(newPrice);

    if (!price || price <= 0) {
      Alert.alert(
        'Invalid Price',
        'Enter a valid price.'
      );
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: newName.trim(),
      description: 'New menu item',
      price,
      category: 'Mains',
      image:
        'https://images.unsplash.com/photo-1547592180-85f173990554',
      isSpecial: false,
      isAvailable: true,
    };

    addItem(newItem);
    setNewName('');
    setNewPrice('');

    Alert.alert(
      'Success',
      'Menu item added.'
    );
  };

  const editPrice = (item: any) => {
    Alert.prompt(
      'Edit Price',
      `Enter new price for ${item.name}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: (value) => {
            const price = Number(value);

            if (!price || price <= 0) {
              Alert.alert(
                'Invalid Price',
                'Enter a valid price.'
              );
              return;
            }

            updateItem(item.id, { price });
          },
        },
      ],
      'plain-text',
      String(item.price)
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
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
              activeTab === tab &&
                styles.activeTab,
            ]}
            onPress={() =>
              setActiveTab(tab)
            }
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
              .map((order: any) => (
                <View
                  key={order.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor:
                        theme.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: theme.text },
                    ]}
                  >
                    Order #{order.id.slice(-5)}
                  </Text>

                  <Text
                    style={{
                      color: theme.text,
                    }}
                  >
                    Type: {order.type}
                  </Text>

                  {order.tableNumber && (
                    <Text
                      style={{
                        color: theme.text,
                      }}
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
                    Total: Rs.{' '}
                    {order.total.toFixed(2)}
                  </Text>

                  <Text
                    style={[
                      styles.currentOrderStatus,
                      { color: theme.text },
                    ]}
                  >
                    Status: {order.status}
                  </Text>

                  <View
                    style={styles.statusButtons}
                  >
                    {statuses.map(
                      (status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.smallButton,
                            order.status ===
                              status &&
                              styles.selectedButton,
                          ]}
                          onPress={() =>
                            changeOrderStatus(
                              order.id,
                              status
                            )
                          }
                        >
                          <Text
                            style={
                              styles.smallButtonText
                            }
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              ))
          )}
        </View>
      )}

      {activeTab === 'Reservations' && (
        <View>
          {reservationState.reservations
            .length === 0 ? (
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
              .map((reservation: any) => (
                <View
                  key={reservation.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor:
                        theme.card,
                    },
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

                  <Text
                    style={{
                      color: theme.text,
                    }}
                  >
                    Date: {reservation.date}
                  </Text>

                  <Text
                    style={{
                      color: theme.text,
                    }}
                  >
                    Time: {reservation.time}
                  </Text>

                  <Text
                    style={{
                      color: theme.text,
                    }}
                  >
                    Party Size:{' '}
                    {reservation.partySize}
                  </Text>

                  <Text
                    style={{
                      color: theme.text,
                    }}
                  >
                    Table: {reservation.tableId}
                  </Text>

                  <Text
                    style={{
                      color: theme.text,
                    }}
                  >
                    Phone: {reservation.contact}
                  </Text>

                  <Text
                    style={[
                      styles.currentOrderStatus,
                      { color: theme.text },
                    ]}
                  >
                    Status: {reservation.status}
                  </Text>

                  {reservation.status ===
                    'Pending' && (
                    <View
                      style={
                        styles.statusButtons
                      }
                    >
                      <TouchableOpacity
                        style={[
                          styles.smallButton,
                          styles.acceptButton,
                        ]}
                        onPress={() =>
                          changeReservationStatus(
                            reservation.id,
                            'Accepted'
                          )
                        }
                      >
                        <Text
                          style={
                            styles.smallButtonText
                          }
                        >
                          Accept
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.smallButton,
                          styles.declineButton,
                        ]}
                        onPress={() =>
                          changeReservationStatus(
                            reservation.id,
                            'Declined'
                          )
                        }
                      >
                        <Text
                          style={
                            styles.smallButtonText
                          }
                        >
                          Decline
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
          )}
        </View>
      )}

      {activeTab === 'Menu Management' && (
        <View>
          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.card,
              },
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
                  borderColor:
                    theme.text,
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
                  borderColor:
                    theme.text,
                },
              ]}
              placeholder="Price"
              placeholderTextColor="#888"
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={addMenuItem}
            >
              <Text
                style={styles.buttonText}
              >
                Add Item
              </Text>
            </TouchableOpacity>
          </View>

          {menuItems.map((item: any) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor:
                    theme.card,
                },
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

              <Text
                style={{
                  color: theme.text,
                }}
              >
                Price: Rs. {item.price}
              </Text>

              <Text
                style={{
                  color: theme.text,
                }}
              >
                Availability:{' '}
                {item.isAvailable
                  ? 'Available'
                  : 'Unavailable'}
              </Text>

              <View
                style={styles.actionRow}
              >
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() =>
                    editPrice(item)
                  }
                >
                  <Text
                    style={
                      styles.smallButtonText
                    }
                  >
                    Edit Price
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() =>
                    toggleAvailability(
                      item.id
                    )
                  }
                >
                  <Text
                    style={
                      styles.smallButtonText
                    }
                  >
                    Toggle Availability
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.replace('/menu')
        }
      >
        <Text style={styles.buttonText}>
          Back to Menu
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
  },

  selectedButton: {
    backgroundColor: '#555',
  },

  acceptButton: {
    backgroundColor: '#bbb',
  },

  declineButton: {
    backgroundColor: '#aaa',
  },

  smallButtonText: {
    color: '#111',
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
});