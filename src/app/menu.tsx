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
import { useTheme } from '../context/ThemeContext';
import useDebounce from '../hooks/useDebounce';

const categories = [
  'All',
  'Starters',
  'Mains',
  'Desserts',
  'Drinks',
];

const sortOptions = [
  'Default',
  'Price Low-High',
  'Price High-Low',
  'Name A-Z',
];

export default function Menu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
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

  const debouncedSearch = useDebounce(
    searchQuery,
    300
  );

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const filteredItems = useMemo(() => {
    let result = menuItems.filter(
      (item) => item.isAvailable
    );

    if (selectedCategory !== 'All') {
      result = result.filter(
        (item) =>
          item.category === selectedCategory
      );
    }

    const query =
      debouncedSearch.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(query) ||
          item.description
            .toLowerCase()
            .includes(query)
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
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
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
          ? current.filter(
              (itemId) => itemId !== id
            )
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
      <View
        style={[
          styles.loadingContainer,
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

        <Text
          style={[
            styles.loadingText,
            { color: theme.text },
          ]}
        >
          Loading menu...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            Restaurant Menu
          </Text>

          <Text
            style={[
              styles.welcome,
              { color: theme.text },
            ]}
          >
            Welcome, {user?.name}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.buttonText}>
            Cart ({cartCount})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.buttonText}>
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push('/reservation')
          }
        >
          <Text style={styles.buttonText}>
            Reservation
          </Text>
        </TouchableOpacity>

        {user?.role === 'Manager' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              router.push('/dashboard')
            }
          >
            <Text style={styles.buttonText}>
              Dashboard
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.searchInput,
          {
            color: theme.text,
            borderColor: theme.text,
          },
        ]}
        placeholder="Search menu..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filterSection}>
        <Text
          style={[
            styles.filterLabel,
            { color: theme.text },
          ]}
        >
          Category
        </Text>

        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.categoryContainer
            }
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category &&
                    styles.selectedCategory,
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  scrollToTop();
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category &&
                      styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text
          style={[
            styles.filterLabel,
            { color: theme.text },
          ]}
        >
          Sort
        </Text>

        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.sortContainer
            }
          >
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortButton,
                  sortOption === option &&
                    styles.selectedSort,
                ]}
                onPress={() => {
                  setSortOption(option);
                  scrollToTop();
                }}
              >
                <Text
                  style={[
                    styles.sortText,
                    sortOption === option &&
                      styles.selectedSortText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <Text
        style={[
          styles.resultCount,
          { color: theme.text },
        ]}
      >
        {filteredItems.length} result
        {filteredItems.length !== 1
          ? 's'
          : ''}
      </Text>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyTitle,
              { color: theme.text },
            ]}
          >
            No items found
          </Text>

          <Text
            style={[
              styles.emptyText,
              { color: theme.text },
            ]}
          >
            Try another search or category.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              onAddToCart={handleAddToCart}
              onToggleFavourite={
                handleToggleFavourite
              }
              isFavourite={favouriteIds.includes(
                item.id
              )}
              theme={theme}
            />
          )}
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },

  welcome: {
    marginTop: 4,
  },

  cartButton: {
    backgroundColor: '#333',
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 8,
  },

  actionButton: {
    backgroundColor: '#333',
    minHeight: 40,
    paddingHorizontal: 11,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 12,
  },

  filterSection: {
    marginBottom: 12,
  },

  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  filterRow: {
    height: 44,
    justifyContent: 'center',
  },

  categoryContainer: {
    alignItems: 'center',
    paddingRight: 8,
  },

  categoryButton: {
    backgroundColor: '#ddd',
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  selectedCategory: {
    backgroundColor: '#333',
  },

  categoryText: {
    color: '#222',
    fontWeight: '600',
  },

  selectedCategoryText: {
    color: '#fff',
  },

  sortContainer: {
    alignItems: 'center',
    paddingRight: 8,
  },

  sortButton: {
    backgroundColor: '#ddd',
    minHeight: 38,
    paddingHorizontal: 11,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  selectedSort: {
    backgroundColor: '#555',
  },

  sortText: {
    color: '#222',
    fontWeight: '600',
  },

  selectedSortText: {
    color: '#fff',
  },

  resultCount: {
    fontWeight: 'bold',
    marginBottom: 6,
  },

  listContent: {
    paddingBottom: 30,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: 'bold',
  },

  emptyText: {
    marginTop: 7,
  },
});