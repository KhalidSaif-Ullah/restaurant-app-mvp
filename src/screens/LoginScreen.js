import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { restaurantApi } from '../services/restaurantApi';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert('Missing information', 'Enter your email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        Alert.alert('Missing information', 'Enter your name.');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Password mismatch', 'The passwords do not match.');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Invalid password', 'Use at least 6 characters.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        await restaurantApi.register({
          name: name.trim(),
          email: cleanEmail,
          password,
          role,
        });
      }

      const result = await restaurantApi.login(cleanEmail, password);
      const user = result.user || result.data?.user;
      const token = result.token || result.data?.token;

      if (!user || !token) {
        throw new Error(
          mode === 'signup'
            ? 'Account created, but login details were not returned. Switch to Login and sign in.'
            : 'The server did not return a user and token.'
        );
      }

      await login(user, token);

      if (user.role === 'Manager') {
        router.replace('/dashboard');
      } else {
        router.replace('/menu');
      }
    } catch (error) {
      Alert.alert('Authentication failed', error.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = styles.input;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant App</Text>
      <Text style={styles.subtitle}>
        {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
      </Text>

      {mode === 'signup' && (
        <>
          <TextInput
            style={inputStyle}
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'Customer' && styles.selected]}
              onPress={() => setRole('Customer')}
            >
              <Text>Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, role === 'Manager' && styles.selected]}
              onPress={() => setRole('Manager')}
            >
              <Text>Manager</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TextInput
        style={inputStyle}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={inputStyle}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.showPassword}
        onPress={() => setShowPassword((current) => !current)}
      >
        <Text>{showPassword ? 'Hide password' : 'Show password'}</Text>
      </TouchableOpacity>

      {mode === 'signup' && (
        <TextInput
          style={inputStyle}
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
      )}

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitText}>
            {mode === 'login' ? 'Login' : 'Create Account'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setMode((current) =>
          current === 'login' ? 'signup' : 'login'
        )}
      >
        <Text style={styles.switchText}>
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#222222',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    color: '#666666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selected: {
    borderColor: '#d35400',
    backgroundColor: '#fff0e6',
  },
  showPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#d35400',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchButton: {
    padding: 16,
    alignItems: 'center',
  },
  switchText: {
    color: '#d35400',
  },
});