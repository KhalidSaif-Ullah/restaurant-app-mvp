import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';

const statuses = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Delivered',
];

export default function Tracking() {
  const router = useRouter();
  const { theme } = useTheme();
  const { state } = useOrders();

  const order = state.orders[state.orders.length - 1];

  if (!order) {
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
          No Active Order
        </Text>

        <Text
          style={[
            styles.info,
            { color: theme.text },
          ]}
        >
          Place an order to track its progress.
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

  const currentIndex = statuses.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';
  const isDelivered = order.status === 'Delivered';

  const progressIndex = isCancelled
    ? -1
    : currentIndex;

  const orderId = String(order.id ?? order._id ?? '');

  const total = Number(
    order.total ?? order.totalAmount ?? 0
  );

  const orderItems = Array.isArray(order.items)
    ? order.items
    : [];

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
        Order Tracking
      </Text>

      <Text
        style={[
          styles.orderId,
          { color: theme.text },
        ]}
      >
        Order #{orderId.slice(-5)}
      </Text>

      <Text
        style={[
          styles.type,
          { color: theme.text },
        ]}
      >
        {order.type || 'Restaurant Order'}
      </Text>

      {order.tableNumber && (
        <Text
          style={[
            styles.info,
            { color: theme.text },
          ]}
        >
          Table: {order.tableNumber}
        </Text>
      )}

      {order.pickupTime && (
        <Text
          style={[
            styles.info,
            { color: theme.text },
          ]}
        >
          Pickup: {order.pickupTime}
        </Text>
      )}

      {isCancelled ? (
        <View
          style={[
            styles.statusCard,
            { backgroundColor: theme.card },
          ]}
        >
          <Text
            style={[
              styles.currentLabel,
              { color: theme.text },
            ]}
          >
            Order Status
          </Text>

          <Text style={styles.cancelledStatus}>
            Cancelled
          </Text>

          <Text
            style={[
              styles.info,
              { color: theme.text },
            ]}
          >
            This order has been cancelled.
          </Text>
        </View>
      ) : (
        <View style={styles.progress}>
          {statuses.map((status, index) => {
            const completed = index <= progressIndex;

            return (
              <View
                key={status}
                style={styles.step}
              >
                <View
                  style={[
                    styles.circle,
                    completed && styles.completedCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      completed && styles.completedText,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.statusText,
                    { color: theme.text },
                    completed && styles.completedStatus,
                  ]}
                >
                  {status}
                </Text>

                {index < statuses.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      index < progressIndex &&
                        styles.completedLine,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}

      <View
        style={[
          styles.statusCard,
          { backgroundColor: theme.card },
        ]}
      >
        <Text
          style={[
            styles.currentLabel,
            { color: theme.text },
          ]}
        >
          Current Status
        </Text>

        <Text
          style={[
            styles.currentStatus,
            isCancelled && styles.cancelledStatus,
            isDelivered && styles.deliveredStatus,
          ]}
        >
          {order.status || 'Pending'}
        </Text>

        <Text
          style={[
            styles.info,
            { color: theme.text },
          ]}
        >
          {isDelivered
            ? 'Your order has been delivered.'
            : isCancelled
              ? 'This order is no longer active.'
              : 'Your order status is managed by the restaurant.'}
        </Text>
      </View>

      <Text
        style={[
          styles.itemsTitle,
          { color: theme.text },
        ]}
      >
        Items
      </Text>

      {orderItems.map((item: any, index: number) => {
        const itemId = String(
          item.id ??
          item._id ??
          item.menuItem ??
          index
        );

        const itemName =
          item.name ??
          item.menuItem?.name ??
          'Menu Item';

        return (
          <Text
            key={`${itemId}-${index}`}
            style={[
              styles.item,
              { color: theme.text },
            ]}
          >
            {itemName} × {item.quantity}
          </Text>
        );
      })}

      <Text
        style={[
          styles.total,
          { color: theme.text },
        ]}
      >
        Total: Rs. {total.toFixed(2)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 55,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  orderId: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  type: {
    marginTop: 5,
  },

  info: {
    marginTop: 6,
  },

  progress: {
    marginTop: 35,
  },

  step: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 55,
  },

  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completedCircle: {
    backgroundColor: '#333',
  },

  circleText: {
    color: '#333',
    fontWeight: 'bold',
  },

  completedText: {
    color: '#fff',
  },

  statusText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },

  completedStatus: {
    fontWeight: 'bold',
  },

  line: {
    position: 'absolute',
    left: 18,
    top: 38,
    width: 2,
    height: 17,
    backgroundColor: '#bbb',
  },

  completedLine: {
    backgroundColor: '#333',
  },

  statusCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 10,
  },

  currentLabel: {
    fontSize: 14,
  },

  currentStatus: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },

  cancelledStatus: {
    color: '#c62828',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },

  deliveredStatus: {
    color: '#2e7d32',
  },

  itemsTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 8,
  },

  item: {
    marginBottom: 5,
  },

  total: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 12,
  },

  button: {
    backgroundColor: '#333',
    minHeight: 46,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});