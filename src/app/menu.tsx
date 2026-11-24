
import { useRouter } from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import MenuItemCard from '../components/MenuItemCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import useDebounce from '../hooks/useDebounce';

const categories = [
  'All',
  'Burgers',
  'Pizza',
  'Rice',
  'Main Course',
  'Pasta',
  'Sides',
  'Salads',
  'Desserts',
  'Drinks',
];

const categoryIcons: Record<string, string> = {
  All: '🍽️',
  Burgers: '🍔',
  Pizza: '🍕',
  Rice: '🍚',
  'Main Course': '🍲',
  Pasta: '🍝',
  Sides: '🍟',
  Salads: '🥗',
  Desserts: '🍰',
  Drinks: '🥤',
};

const sortOptions = [
  'Default',
  'Price Low-High',
  'Price High-Low',
  'Name A-Z',
];

export default function Menu() {
  const router = useRouter();

  const { user, logout } = useAuth();
  const { state, dispatch } = useCart();
  const { menuItems, isLoaded } = useMenu();

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [sortOption, setSortOption] =
    useState('Default');

  const [isLoading, setIsLoading] =
    useState(true);

  const [favouriteIds, setFavouriteIds] =
    useState<string[]>([]);

  const listRef = useRef<FlatList>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const filteredItems = useMemo(() => {
    let result = menuItems.filter(
      (item) => item.isAvailable
    );

    if (selectedCategory !== 'All') {
      result = result.filter(
        (item) => item.category === selectedCategory
      );
    }

    const query = debouncedSearch.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    if (sortOption === 'Price Low-High') {
      result = [...result].sort(
        (a, b) => a.price - b.price
      );
    }

    if (sortOption === 'Price High-Low') {
      result = [...result].sort(
        (a, b) => b.price - a.price
      );
    }

    if (sortOption === 'Name A-Z') {
      result = [...result].sort(
        (a, b) => a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [
    menuItems,
    selectedCategory,
    debouncedSearch,
    sortOption,
  ]);

  const handleAddToCart = useCallback(
    (item: any) => {
      dispatch({
        type: 'ADD_ITEM',
        payload: item,
      });

      Alert.alert(
        'Added to Cart',
        `${item.name} added to your cart.`
      );
    },
    [dispatch]
  );

  const handleToggleFavourite = useCallback(
    (id: string) => {
      setFavouriteIds((current) =>
        current.includes(id)
          ? current.filter((itemId) => itemId !== id)
          : [...current, id]
      );
    },
    []
  );

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const cartCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🍽️</Text>

        <ActivityIndicator
          size="large"
          color="#B95D3F"
        />

        <Text style={styles.loadingText}>
          Preparing your menu...
        </Text>
      </View>
    );
  }

  // Everything above the dishes belongs to the
  // same scrollable list as the menu items.
  const menuHeader = (
    <View>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            GOOD FOOD, GOOD MOOD
          </Text>

          <Text style={styles.title}>
            Our Menu
          </Text>

          <Text style={styles.welcome}>
            Hello, {user?.name || 'Guest'}!
          </Text>

          <Text style={styles.subtitle}>
            What would you like to eat today?
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.cartIcon}>🛒</Text>

          <Text style={styles.cartText}>
            {cartCount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/reservation')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionText}>Reserve</Text>
        </TouchableOpacity>

        {user?.role === 'Manager' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Dashboard</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLogout}
        >
          <Text style={styles.actionIcon}>↪</Text>
          <Text style={styles.actionText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Find something delicious..."
          placeholderTextColor="#A69A90"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CATEGORIES */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>
          Explore Categories
        </Text>

        <Text style={styles.sectionSubtitle}>
          Find your favourite food
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => {
            const selected =
              selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selected && styles.selectedCategory,
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  scrollToTop();
                }}
              >
                <Text style={styles.categoryIcon}>
                  {categoryIcons[category]}
                </Text>

                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* POPULAR CHOICES */}
      <View style={styles.popularSection}>
        <View style={styles.sortHeader}>
          <Text style={styles.sectionTitle}>
            Popular Choices
          </Text>

          <Text style={styles.resultCount}>
            {filteredItems.length} items
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortScroll}
          contentContainerStyle={styles.sortContainer}
        >
          {sortOptions.map((option) => {
            const selected = sortOption === option;

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortButton,
                  selected && styles.selectedSort,
                ]}
                onPress={() => {
                  setSortOption(option);
                  scrollToTop();
                }}
              >
                <Text
                  style={[
                    styles.sortText,
                    selected && styles.selectedSortText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        style={styles.menuList}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={menuHeader}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onAddToCart={handleAddToCart}
            onToggleFavourite={handleToggleFavourite}
            isFavourite={favouriteIds.includes(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍽️</Text>

            <Text style={styles.emptyTitle}>
              Nothing on the plate!
            </Text>

            <Text style={styles.emptyText}>
              Try another category or search.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingIcon: {
    fontSize: 55,
    marginBottom: 18,
  },

  loadingText: {
    color: '#806B5D',
    fontSize: 15,
    marginTop: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: '#B95D3F',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 3,
  },

  title: {
    color: '#38291F',
    fontSize: 29,
    fontWeight: 'bold',
  },

  welcome: {
    color: '#755D4E',
    fontSize: 14,
    marginTop: 3,
  },

  subtitle: {
    color: '#9A897C',
    fontSize: 12,
    marginTop: 3,
  },

  cartButton: {
    width: 58,
    height: 58,
    backgroundColor: '#B95D3F',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  cartIcon: {
    fontSize: 21,
  },

  cartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 7,
  },

  actionButton: {
    flex: 1,
    backgroundColor: '#F0E5D9',
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },

  actionIcon: {
    fontSize: 17,
  },

  actionText: {
    color: '#604735',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 3,
  },

  searchContainer: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE2D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 18,
    elevation: 1,
  },

  searchIcon: {
    color: '#B95D3F',
    fontSize: 27,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: '#38291F',
    fontSize: 14,
  },

  clearSearch: {
    color: '#A08B7C',
    fontSize: 18,
    padding: 5,
  },

  categorySection: {
    marginBottom: 20,
  },

  sectionTitle: {
    color: '#38291F',
    fontSize: 17,
    fontWeight: 'bold',
  },

  sectionSubtitle: {
    color: '#A08B7C',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },

  categoryScroll: {
    height: 78,
  },

  categoryContainer: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 5,
  },

  categoryButton: {
    minWidth: 78,
    height: 68,
    paddingHorizontal: 10,
    marginRight: 9,
    borderRadius: 14,
    backgroundColor: '#F0E5D9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCategory: {
    backgroundColor: '#B95D3F',
  },

  categoryIcon: {
    fontSize: 21,
    marginBottom: 4,
  },

  categoryText: {
    color: '#705744',
    fontSize: 10,
    fontWeight: 'bold',
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  popularSection: {
    marginTop: 4,
    marginBottom: 12,
  },

  sortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    minHeight: 26,
  },

  resultCount: {
    color: '#9A897C',
    fontSize: 12,
  },

  sortScroll: {
    height: 42,
  },

  sortContainer: {
    alignItems: 'center',
    paddingRight: 5,
  },

  sortButton: {
    backgroundColor: '#F0E5D9',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
    marginRight: 8,
  },

  selectedSort: {
    backgroundColor: '#75876A',
  },

  sortText: {
    color: '#705744',
    fontSize: 11,
    fontWeight: 'bold',
  },

  selectedSortText: {
    color: '#FFFFFF',
  },

  menuList: {
    flex: 1,
    minHeight: 0,
  },

  listContent: {
    paddingTop: 4,
    paddingBottom: 120,
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#38291F',
    fontSize: 20,
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#9A897C',
    fontSize: 14,
    marginTop: 7,
  },
});
