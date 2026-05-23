import React, { useState } from 'react';
import {
  Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Ingresa tu email');
    if (!/\S+@\S+\.\S+/.test(email)) return Alert.alert('Error', 'Formato de email inválido');
    if (!password) return Alert.alert('Error', 'Ingresa tu contraseña');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(theme);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity onPress={toggleTheme} style={s.themeToggle}>
        <Text style={{ fontSize: 22 }}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      <Text style={s.title}>Finanzas Personales</Text>
      <Text style={s.subtitle}>Inicia sesión</Text>

      <TextInput
        style={s.input}
        placeholder="Email"
        placeholderTextColor={theme.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={s.input}
        placeholder="Contraseña"
        placeholderTextColor={theme.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={s.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={s.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => ({
  container:   { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.bg },
  themeToggle: { position: 'absolute', top: 50, right: 20, padding: 8 },
  title:       { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#2196F3' },
  subtitle:    { fontSize: 16, textAlign: 'center', marginBottom: 32, color: theme.subtext },
  input:       { backgroundColor: theme.inputBg, borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.border, fontSize: 16, color: theme.text },
  button:      { backgroundColor: '#2196F3', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText:  { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link:        { textAlign: 'center', marginTop: 16, color: '#2196F3' },
});