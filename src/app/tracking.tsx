import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
  'Preparing',
  'Ready',
  'Served',
];

export default function Tracking() {
  const router = useRouter();
  const { theme } = useTheme();
  const { state, dispatch } = useOrders();

  const order = state.orders[state.orders.length - 1];

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!order) {
      return;
    }

    const interval = setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.id]);

  useEffect(() => {
    if (!order) {
      return;
    }

    const statusTimer = setInterval(() => {
      const elapsedSeconds =
        Math.floor(
          (Date.now() - order.timestamp) / 1000
        );

      let nextStatus = 'Pending';

      if (elapsedSeconds >= 30) {
        nextStatus = 'Served';
      } else if (elapsedSeconds >= 20) {
        nextStatus = 'Ready';
      } else if (elapsedSeconds >= 10) {
        nextStatus = 'Preparing';
      }

      if (nextStatus !== order.status) {
        dispatch({
          type: 'UPDATE_ORDER_STATUS',
          payload: {
            id: order.id,
            status: nextStatus,
          },
        });
      }
    }, 1000);

    return () => clearInterval(statusTimer);
  }, [order?.id, order?.status, dispatch]);

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

  const currentIndex = statuses.indexOf(
    order.status
  );

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
        Order #{order.id.slice(-5)}
      </Text>

      <Text
        style={[
          styles.type,
          { color: theme.text },
        ]}
      >
        {order.type}
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

      <View style={styles.progress}>
        {statuses.map((status, index) => {
          const completed =
            index <= currentIndex;

          return (
            <View
              key={status}
              style={styles.step}
            >
              <View
                style={[
                  styles.circle,
                  completed &&
                    styles.completedCircle,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    completed &&
                      styles.completedText,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>

              <Text
                style={[
                  styles.statusText,
                  { color: theme.text },
                  completed &&
                    styles.completedStatus,
                ]}
              >
                {status}
              </Text>

              {index < statuses.length - 1 && (
                <View
                  style={[
                    styles.line,
                    index < currentIndex &&
                      styles.completedLine,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

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
            { color: theme.text },
          ]}
        >
          {order.status}
        </Text>

        <Text
          style={[
            styles.elapsed,
            { color: theme.text },
          ]}
        >
          Elapsed Time: {elapsed}s
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

      {order.items.map((item: any) => (
        <Text
          key={item.id}
          style={[
            styles.item,
            { color: theme.text },
          ]}
        >
          {item.name} × {item.quantity}
        </Text>
      ))}

      <Text
        style={[
          styles.total,
          { color: theme.text },
        ]}
      >
        Total: Rs. {order.total.toFixed(2)}
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
    marginTop: 3,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },

  elapsed: {
    marginTop: 8,
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