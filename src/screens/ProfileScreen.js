import { useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Profile
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card },
        ]}
      >
        <Text style={[styles.label, { color: theme.text }]}>
          Name
        </Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {user?.name}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>
          Email
        </Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {user?.email}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>
          Role
        </Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {user?.role}
        </Text>
      </View>

      <View style={styles.themeRow}>
        <Text style={[styles.themeText, { color: theme.text }]}>
          Dark Mode
        </Text>

        <Switch
          value={isDark}
          onValueChange={toggleTheme}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  card: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  themeText: {
    fontSize: 17,
  },
  logoutButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});