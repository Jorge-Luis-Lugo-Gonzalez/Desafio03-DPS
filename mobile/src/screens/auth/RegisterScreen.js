import React, { useState } from 'react';
import {
  Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Ingresa tu nombre');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return Alert.alert('Error', 'Email inválido');
    if (password.length < 6) return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(theme);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={s.title}>Crear cuenta</Text>

      <TextInput style={s.input} placeholder="Nombre" placeholderTextColor={theme.muted} value={name} onChangeText={setName} />
      <TextInput style={s.input} placeholder="Email" placeholderTextColor={theme.muted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Contraseña (mín. 6 caracteres)" placeholderTextColor={theme.muted} secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={s.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Registrarse</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={s.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => ({
  container:  { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.bg },
  title:      { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: '#2196F3' },
  input:      { backgroundColor: theme.inputBg, borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.border, fontSize: 16, color: theme.text },
  button:     { backgroundColor: '#2196F3', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link:       { textAlign: 'center', marginTop: 16, color: '#2196F3' },
});