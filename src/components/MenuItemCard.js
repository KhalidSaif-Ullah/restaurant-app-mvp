import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

function MenuItemCard({
  item,
  onAddToCart,
  onToggleFavourite,
  isFavourite,
}) {
  const { theme } = useTheme();

  console.log('MenuItemCard rendered:', item.name);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.name,
              { color: theme.text },
            ]}
          >
            {item.name}
          </Text>

          <TouchableOpacity
            onPress={() => onToggleFavourite(item.id)}
          >
            <Text style={styles.heart}>
              {isFavourite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.description,
            { color: theme.text },
          ]}
        >
          {item.description}
        </Text>

        <Text
          style={[
            styles.price,
            { color: theme.text },
          ]}
        >
          Rs. {item.price}
        </Text>

        {item.isSpecial && (
          <Text style={styles.special}>
            SPECIAL
          </Text>
        )}

        {!item.isAvailable && (
          <Text style={styles.unavailable}>
            Currently unavailable
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.addButton,
            !item.isAvailable && styles.disabledButton,
          ]}
          onPress={() => onAddToCart(item)}
          disabled={!item.isAvailable}
        >
          <Text style={styles.buttonText}>
            {item.isAvailable
              ? 'Add to Cart'
              : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(MenuItemCard);

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontSize: 19,
    fontWeight: 'bold',
  },
  heart: {
    fontSize: 28,
  },
  description: {
    marginTop: 6,
    fontSize: 14,
  },
  price: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: 'bold',
  },
  special: {
    color: 'green',
    fontWeight: 'bold',
    marginTop: 5,
  },
  unavailable: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});