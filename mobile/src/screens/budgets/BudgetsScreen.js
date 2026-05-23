import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = ['Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Otros'];

export default function BudgetsScreen() {
  const { theme } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');

  const fetchBudgets = async () => {
    try {
      const { data } = await client.get('/budgets');
      setBudgets(data);
    } catch { Alert.alert('Error', 'No se pudieron cargar los presupuestos'); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchBudgets(); }, []));

  const openModal = (budget = null) => {
    setEditTarget(budget);
    setCategory(budget?.category || CATEGORIES[0]);
    setLimit(budget?.limit?.toString() || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!limit || isNaN(limit) || Number(limit) <= 0)
      return Alert.alert('Error', 'Ingresa un límite válido');
    try {
      if (editTarget) await client.put(`/budgets/${editTarget.id}`, { limit: Number(limit) });
      else await client.post('/budgets', { category, limit: Number(limit) });
      setModalVisible(false);
      fetchBudgets();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmar', '¿Eliminar este presupuesto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await client.delete(`/budgets/${id}`); fetchBudgets(); }
        catch { Alert.alert('Error', 'No se pudo eliminar'); }
      }}
    ]);
  };

  const getBarColor = (alert) => {
    if (alert === 'over') return '#F44336';
    if (alert === 'warning') return '#FF9800';
    return '#4CAF50';
  };

  const s = styles(theme);

  const renderBudget = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.categoryText}>{item.category}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => openModal(item)}>
            <Text style={s.edit}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={s.delete}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={s.amounts}>
        ${item.spent?.toFixed(2)} / ${item.limit?.toFixed(2)}
        {'  '}
        <Text style={{ color: getBarColor(item.alert), fontWeight: 'bold' }}>
          {item.percentage}%
          {item.alert === 'over' ? ' ⚠️ Excedido' : item.alert === 'warning' ? ' ⚠️ Alerta' : ''}
        </Text>
      </Text>

      <View style={s.barBg}>
        <View style={[s.barFill, {
          width: `${Math.min(item.percentage, 100)}%`,
          backgroundColor: getBarColor(item.alert)
        }]} />
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Presupuestos</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => openModal()}>
          <Text style={s.addBtnText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading
        ? <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#2196F3" />
        : <FlatList
            data={budgets}
            keyExtractor={b => b.id}
            renderItem={renderBudget}
            ListEmptyComponent={<Text style={s.empty}>No hay presupuestos definidos</Text>}
          />
      }

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{editTarget ? 'Editar límite' : 'Nuevo presupuesto'}</Text>

            {!editTarget && (
              <>
                <Text style={s.label}>Categoría</Text>
                <View style={s.selectorRow}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity key={c} style={[s.chip, category === c && s.chipActive]} onPress={() => setCategory(c)}>
                      <Text style={[s.chipText, category === c && s.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={s.label}>Límite mensual ($)</Text>
            <TextInput
              style={s.input}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={theme.muted}
              value={limit}
              onChangeText={setLimit}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
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
  container:      { flex: 1, backgroundColor: theme.bg },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: theme.card, elevation: 2 },
  title:          { fontSize: 20, fontWeight: 'bold', color: theme.text },
  addBtn:         { backgroundColor: '#2196F3', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText:     { color: '#fff', fontWeight: 'bold' },
  card:           { backgroundColor: theme.card, margin: 8, marginHorizontal: 12, borderRadius: 10, padding: 16, elevation: 1 },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryText:   { fontSize: 16, fontWeight: 'bold', color: theme.text },
  amounts:        { fontSize: 13, color: theme.subtext, marginBottom: 8 },
  barBg:          { height: 10, backgroundColor: theme.border, borderRadius: 5, overflow: 'hidden' },
  barFill:        { height: '100%', borderRadius: 5 },
  edit:           { color: '#2196F3', fontSize: 13 },
  delete:         { color: '#F44336', fontSize: 13 },
  empty:          { textAlign: 'center', marginTop: 40, color: theme.muted },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent:   { backgroundColor: theme.card, borderRadius: 12, padding: 20 },
  modalTitle:     { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme.text },
  label:          { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10, color: theme.subtext },
  input:          { backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: theme.border, fontSize: 16, color: theme.text },
  selectorRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: theme.chip },
  chipActive:     { backgroundColor: '#2196F3' },
  chipText:       { color: theme.chipText, fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  btn:            { backgroundColor: '#2196F3', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnText:        { color: '#fff', fontWeight: 'bold' },
});