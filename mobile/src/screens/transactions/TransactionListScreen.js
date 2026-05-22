import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';

const CATEGORIES = ['Todas', 'Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Salario', 'Otros'];

export default function TransactionListScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  const fetchTransactions = async () => {
    try {
      const params = categoryFilter !== 'Todas' ? { category: categoryFilter } : {};
      const { data } = await client.get('/transactions', { params });
      setTransactions(data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTransactions(); }, [categoryFilter]));

  const handleDelete = (id) => {
    Alert.alert('Confirmar', '¿Eliminar esta transacción?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await client.delete(`/transactions/${id}`);
            setTransactions(prev => prev.filter(t => t.id !== id));
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.description}>{item.description || '—'}</Text>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.amount, { color: item.type === 'income' ? '#4CAF50' : '#F44336' }]}>
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionForm', { transaction: item })}>
            <Text style={styles.edit}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.delete}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transacciones</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('TransactionForm', {})}>
          <Text style={styles.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro por categoría */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, categoryFilter === item && styles.filterChipActive]}
            onPress={() => setCategoryFilter(item)}
          >
            <Text style={[styles.filterText, categoryFilter === item && styles.filterTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading
        ? <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        : <FlatList
            data={transactions}
            keyExtractor={t => t.id}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTransactions(); }} />}
            ListEmptyComponent={<Text style={styles.empty}>No hay transacciones</Text>}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#2196F3', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  filterList: { maxHeight: 48, paddingHorizontal: 12, marginVertical: 8 },
  filterChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#e0e0e0', marginRight: 8, height: 34, justifyContent: 'center' },
  filterChipActive: { backgroundColor: '#2196F3' },
  filterText: { color: '#555' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', margin: 8, marginHorizontal: 12, borderRadius: 10, padding: 14, flexDirection: 'row', elevation: 1 },
  category: { fontWeight: 'bold', fontSize: 15 },
  description: { color: '#666', fontSize: 13, marginTop: 2 },
  date: { color: '#aaa', fontSize: 12, marginTop: 2 },
  amount: { fontSize: 18, fontWeight: 'bold' },
  edit: { color: '#2196F3', fontSize: 13 },
  delete: { color: '#F44336', fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 40, color: '#aaa' },
});