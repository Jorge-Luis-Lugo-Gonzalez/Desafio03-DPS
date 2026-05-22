import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import client from '../../api/client';

const CATEGORIES = ['Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Salario', 'Otros'];
const TYPES = [{ label: 'Ingreso', value: 'income' }, { label: 'Gasto', value: 'expense' }];

export default function TransactionFormScreen({ route, navigation }) {
  const existing = route.params?.transaction;
  const [amount, setAmount] = useState(existing?.amount?.toString() || '');
  const [type, setType] = useState(existing?.type || 'expense');
  const [category, setCategory] = useState(existing?.category || CATEGORIES[0]);
  const [accountId, setAccountId] = useState(existing?.accountId || '');
  const [date, setDate] = useState(existing?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(existing?.description || '');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get('/accounts').then(r => {
      setAccounts(r.data);
      if (!accountId && r.data.length > 0) setAccountId(r.data[0].id);
    }).catch(() => Alert.alert('Error', 'No se cargaron las cuentas'));
  }, []);

  const handleSave = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return Alert.alert('Error', 'Ingresa un monto válido');
    if (!accountId) return Alert.alert('Error', 'Selecciona una cuenta');

    setLoading(true);
    try {
      const payload = { amount: Number(amount), type, category, accountId, date, description };
      if (existing) {
        await client.put(`/transactions/${existing.id}`, payload);
      } else {
        await client.post('/transactions', payload);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  const Selector = ({ options, value, onSelect, labelKey = 'label', valueKey = 'value' }) => (
    <View style={styles.selectorRow}>
      {options.map(opt => {
        const val = typeof opt === 'string' ? opt : opt[valueKey];
        const lbl = typeof opt === 'string' ? opt : opt[labelKey];
        return (
          <TouchableOpacity
            key={val}
            style={[styles.chip, value === val && styles.chipActive]}
            onPress={() => onSelect(val)}
          >
            <Text style={[styles.chipText, value === val && styles.chipTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>{existing ? 'Editar' : 'Nueva'} transacción</Text>

      <Text style={styles.label}>Tipo</Text>
      <Selector options={TYPES} value={type} onSelect={setType} />

      <Text style={styles.label}>Monto ($)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Categoría</Text>
      <Selector options={CATEGORIES} value={category} onSelect={setCategory} />

      <Text style={styles.label}>Cuenta</Text>
      <Selector
        options={accounts}
        value={accountId}
        onSelect={setAccountId}
        labelKey="name"
        valueKey="id"
      />

      <Text style={styles.label}>Fecha (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="2026-05-19" value={date} onChangeText={setDate} />

      <Text style={styles.label}>Descripción (opcional)</Text>
      <TextInput style={styles.input} placeholder="Ej: Compra del supermercado" value={description} onChangeText={setDescription} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#444', marginTop: 14 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#e0e0e0' },
  chipActive: { backgroundColor: '#2196F3' },
  chipText: { color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#2196F3', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 28 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});