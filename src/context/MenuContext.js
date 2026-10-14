import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { menuItems as initialMenuItems } from '../data/menu';
import { restaurantApi } from '../services/restaurantApi';
import { useAuth } from './AuthContext';

const MenuContext = createContext(null);
const MENU_KEY = '@restaurant_menu';

function normalizeMenuItem(item) {
  return {
    ...item,
    id: String(item._id || item.id),
    isAvailable: item.available ?? item.isAvailable ?? true,
    isSpecial: item.isSpecial ?? false,
  };
}

function extractItems(data) {
  if (Array.isArray(data)) return data;
  return data?.menuItems || data?.items || [];
}

export function MenuProvider({ children }) {
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshMenu = async () => {
    const data = await restaurantApi.getMenu();
    const items = extractItems(data).map(normalizeMenuItem);
    setMenuItems(items);
    await AsyncStorage.setItem(MENU_KEY, JSON.stringify(items));
    return items;
  };

  useEffect(() => {
    let active = true;

    async function loadMenu() {
      try {
        const data = await restaurantApi.getMenu();
        const items = extractItems(data).map(normalizeMenuItem);

        if (active && items.length > 0) {
          setMenuItems(items);
          await AsyncStorage.setItem(MENU_KEY, JSON.stringify(items));
        } else if (active) {
          const saved = await AsyncStorage.getItem(MENU_KEY);
          if (saved) setMenuItems(JSON.parse(saved));
        }
      } catch (error) {
        try {
          const saved = await AsyncStorage.getItem(MENU_KEY);
          if (active && saved) setMenuItems(JSON.parse(saved));
        } catch (storageError) {
          console.error('Could not load saved menu:', storageError);
        }
        console.error('Could not load menu from API:', error.message);
      } finally {
        if (active) setIsLoaded(true);
      }
    }

    loadMenu();

    return () => {
      active = false;
    };
  }, []);

  const addItem = async (item) => {
    if (!token) throw new Error('Please log in before managing the menu.');

    const created = await restaurantApi.createMenuItem(token, {
      name: item.name,
      description: item.description || '',
      price: Number(item.price),
      category: item.category || 'Mains',
      image: item.image || '',
      available: item.isAvailable ?? true,
    });

    const newItem = normalizeMenuItem(created.menuItem || created.item || created);
    setMenuItems((current) => [
      ...current.filter((entry) => entry.id !== newItem.id),
      newItem,
    ]);
    return newItem;
  };

  const updateItem = async (id, changes) => {
    if (!token) throw new Error('Please log in before managing the menu.');

    const current = menuItems.find((item) => item.id === String(id));
    if (!current) throw new Error('Menu item not found.');

    const payload = {
      name: changes.name ?? current.name,
      description: changes.description ?? current.description ?? '',
      price: Number(changes.price ?? current.price),
      category: changes.category ?? current.category ?? 'Mains',
      image: changes.image ?? current.image ?? '',
      available: changes.isAvailable ?? current.isAvailable ?? true,
    };

    const updated = await restaurantApi.updateMenuItem(token, String(id), payload);
    const newItem = normalizeMenuItem(updated.menuItem || updated.item || updated);

    setMenuItems((items) =>
      items.map((item) => item.id === String(id) ? newItem : item)
    );

    return newItem;
  };

  const toggleAvailability = async (id) => {
    const current = menuItems.find((item) => item.id === String(id));
    if (!current) throw new Error('Menu item not found.');

    return updateItem(id, { isAvailable: !current.isAvailable });
  };

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        addItem,
        updateItem,
        toggleAvailability,
        refreshMenu,
        isLoaded,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used inside MenuProvider');
  return context;
}