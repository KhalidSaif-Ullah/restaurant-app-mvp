import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);
const TOKEN_KEY = '@restaurant_token';
const USER_KEY = '@restaurant_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Could not restore session:', error);
      } finally {
        setAuthLoaded(true);
      }
    }

    restoreSession();
  }, []);

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

    if (authToken) {
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);

    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, authLoaded, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}