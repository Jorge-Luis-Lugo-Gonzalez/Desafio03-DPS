import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

export default function AccountsScreen() {
  const { theme } = useTheme();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [name, setName] = useState('');

  const fetchAccounts = async () => {
    try {
      const { data } = await client.get('/accounts');
      setAccounts(data);
    } catch { Alert.alert('Error', 'No se pudieron cargar las cuentas'); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchAccounts(); }, []));

  const openModal = (account = null) => {
    setEditTarget(account);
    setName(account?.name || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'El nombre no puede estar vacío');
    try {
      if (editTarget) await client.put(`/accounts/${editTarget.id}`, { name: name.trim() });
      else await client.post('/accounts', { name: name.trim() });
      setModalVisible(false);
      fetchAccounts();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmar', '¿Eliminar esta cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await client.delete(`/accounts/${id}`); fetchAccounts(); }
        catch { Alert.alert('Error', 'No se pudo eliminar'); }
      }}
    ]);
  };

  const s = styles(theme);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Mis Cuentas</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => openModal()}>
          <Text style={s.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {loading
        ? <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#2196F3" />
        : <FlatList
            data={accounts}
            keyExtractor={a => a.id}
            ListEmptyComponent={<Text style={s.empty}>No tienes cuentas aún</Text>}
            renderItem={({ item }) => (
              <View style={s.card}>
                <View>
                  <Text style={s.accountName}>{item.name}</Text>
                  <Text style={s.balanceLabel}>Saldo actual</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.balance, { color: item.balance >= 0 ? '#4CAF50' : '#F44336' }]}>
                    ${item.balance?.toFixed(2) ?? '0.00'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    <TouchableOpacity onPress={() => openModal(item)}>
                      <Text style={s.edit}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Text style={s.delete}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
      }

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{editTarget ? 'Editar cuenta' : 'Nueva cuenta'}</Text>
            <TextInput
              style={s.input}
              placeholder="Ej: Efectivo, Tarjeta VISA"
              placeholderTextColor={theme.muted}
              value={name}
              onChangeText={setName}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[s.btn, { backgroundColor: theme.muted, flex: 1 }]} onPress={() => setModalVisible(false)}>
                <Text style={s.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={handleSave}>
                <Text style={s.btnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (theme) => ({
  container:    { flex: 1, backgroundColor: theme.bg },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: theme.card, elevation: 2 },
  title:        { fontSize: 20, fontWeight: 'bold', color: theme.text },
  addBtn:       { backgroundColor: '#2196F3', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText:   { color: '#fff', fontWeight: 'bold' },
  card:         { backgroundColor: theme.card, margin: 8, marginHorizontal: 12, borderRadius: 10, padding: 16, flexDirection: 'row', justifyContent: 'space-between', elevation: 1 },
  accountName:  { fontSize: 16, fontWeight: 'bold', color: theme.text },
  balanceLabel: { color: theme.muted, fontSize: 12, marginTop: 4 },
  balance:      { fontSize: 20, fontWeight: 'bold' },
  edit:         { color: '#2196F3', fontSize: 13 },
  delete:       { color: '#F44336', fontSize: 13 },
  empty:        { textAlign: 'center', marginTop: 40, color: theme.muted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: theme.card, borderRadius: 12, padding: 20 },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme.text },
  input:        { backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: theme.border, fontSize: 16, color: theme.text },
  btn:          { backgroundColor: '#2196F3', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnText:      { color: '#fff', fontWeight: 'bold' },
});