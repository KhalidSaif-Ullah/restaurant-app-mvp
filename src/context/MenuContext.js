import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { menuItems as initialMenuItems } from '../data/menu';
  
  const MenuContext = createContext(null);
  
  const STORAGE_KEY = '@restaurant_menu';
  
  export function MenuProvider({ children }) {
    const [menuItems, setMenuItems] = useState(initialMenuItems);
    const [isLoaded, setIsLoaded] = useState(false);
  
    useEffect(() => {
      const loadMenu = async () => {
        try {
          const savedMenu = await AsyncStorage.getItem(STORAGE_KEY);
  
          if (savedMenu) {
            setMenuItems(JSON.parse(savedMenu));
          }
        } catch (error) {
          console.log('Failed to load menu:', error);
        } finally {
          setIsLoaded(true);
        }
      };
  
      loadMenu();
    }, []);
  
    useEffect(() => {
      if (!isLoaded) {
        return;
      }
  
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(menuItems)
      ).catch((error) => {
        console.log('Failed to save menu:', error);
      });
    }, [menuItems, isLoaded]);
  
    const addItem = (item) => {
      setMenuItems((current) => [...current, item]);
    };
  
    const updateItem = (id, changes) => {
      setMenuItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, ...changes }
            : item
        )
      );
    };
  
    const toggleAvailability = (id) => {
      setMenuItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                isAvailable: !item.isAvailable,
              }
            : item
        )
      );
    };
  
    return (
      <MenuContext.Provider
        value={{
          menuItems,
          addItem,
          updateItem,
          toggleAvailability,
          isLoaded,
        }}
      >
        {children}
      </MenuContext.Provider>
    );
  }
  
  export function useMenu() {
    const context = useContext(MenuContext);
  
    if (!context) {
      throw new Error(
        'useMenu must be used inside MenuProvider'
      );
    }
  
    return context;
  }