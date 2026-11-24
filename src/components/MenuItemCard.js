
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const dishIcons = {
  'Chicken Burger': '🍔',
  'Beef Burger': '🍔',
  'Zinger Burger': '🍔',
  'BBQ Chicken Burger': '🍔',
  'Margherita Pizza': '🍕',
  'Pepperoni Pizza': '🍕',
  'Fajita Pizza': '🍕',
  'Creamy Tikka Pizza': '🍕',
  'Chicken Biryani': '🍛',
  'Beef Pulao': '🍚',
  'Chicken Fried Rice': '🍚',
  'Chicken Karahi': '🍲',
  'Chicken Handi': '🍲',
  'Chicken Alfredo': '🍝',
  'Chicken Arrabbiata': '🍝',
  'Chicken Pasta': '🍝',
  'French Fries': '🍟',
  'Chicken Nuggets': '🍗',
  'Garlic Bread': '🥖',
  'Caesar Salad': '🥗',
  'Chocolate Cake': '🍰',
  'Brownie with Ice Cream': '🍨',
  'Fresh Lemonade': '🥤',
  'Mint Margarita': '🍹',
  'Chocolate Shake': '🥤',
};

const categoryColors = {
  Burgers: '#F8DFBC',
  Pizza: '#F5D9CE',
  Rice: '#E9E4C9',
  'Main Course': '#F0DCCB',
  Pasta: '#F3DCC5',
  Sides: '#F8E5B9',
  Salads: '#DDE9D5',
  Desserts: '#F0D9E8',
  Drinks: '#D8EAF0',
};

function MenuItemCard({
  item,
  onAddToCart,
  onToggleFavourite,
  isFavourite,
}) {
  const { theme } = useTheme();

  const dishIcon = dishIcons[item.name] || '🍽️';
  const imageBackground =
    categoryColors[item.category] || '#F3E6D5';

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: imageBackground },
        ]}
      >
        <View style={styles.imageTopRow}>
          <Text style={styles.categoryBadge}>
            {item.category}
          </Text>

          {item.isSpecial && (
            <Text style={styles.specialBadge}>
              ★ SPECIAL
            </Text>
          )}
        </View>

        <Text style={styles.dishIcon}>
          {dishIcon}
        </Text>

        <Text style={styles.imageCaption}>
          FRESHLY PREPARED
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>
            {item.name}
          </Text>

          <TouchableOpacity
            onPress={() => onToggleFavourite(item.id)}
            style={styles.favouriteButton}
          >
            <Text
              style={[
                styles.heart,
                isFavourite && styles.activeHeart,
              ]}
            >
              {isFavourite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>
          {item.description}
        </Text>

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.priceLabel}>
              PRICE
            </Text>

            <Text style={styles.price}>
              Rs. {item.price}
            </Text>
          </View>

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
                ? '+ Add'
                : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default React.memo(MenuItemCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#6B4937',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 7,
  },

  imageContainer: {
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageTopRow: {
    position: 'absolute',
    top: 13,
    left: 13,
    right: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  categoryBadge: {
    backgroundColor: '#FFFFFF',
    color: '#754A35',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },

  specialBadge: {
    backgroundColor: '#B95D3F',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },

  dishIcon: {
    fontSize: 100,
  },

  imageCaption: {
    position: 'absolute',
    bottom: 12,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#775D49',
  },

  content: {
    padding: 17,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  name: {
    flex: 1,
    color: '#35271F',
    fontSize: 20,
    fontWeight: 'bold',
  },

  favouriteButton: {
    paddingLeft: 12,
    paddingVertical: 2,
  },

  heart: {
    color: '#9B8B80',
    fontSize: 28,
  },

  activeHeart: {
    color: '#D45D55',
  },

  description: {
    color: '#786A61',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 17,
  },

  priceLabel: {
    color: '#A08B7C',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },

  price: {
    color: '#A64E32',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 3,
  },

  addButton: {
    backgroundColor: '#B95D3F',
    paddingHorizontal: 21,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
  },

  disabledButton: {
    backgroundColor: '#A9A19B',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});