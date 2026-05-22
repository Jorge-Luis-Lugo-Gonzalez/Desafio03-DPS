import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#009688'];

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ income: 0, expenses: 0, accounts: [], byCategory: [] });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const [txRes, accRes] = await Promise.all([
        client.get('/transactions', { params: { from } }),
        client.get('/accounts'),
      ]);

      const txs = txRes.data;
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      // Agrupar gastos por categoría
      const catMap = {};
      txs.filter(t => t.type === 'expense').forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });
      const byCategory = Object.entries(catMap).map(([name, amount], i) => ({
        name,
        amount,
        color: COLORS[i % COLORS.length],
        legendFontColor: '#555',
        legendFontSize: 13,
      }));

      setData({ income, expenses, accounts: accRes.data, byCategory });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDashboard(); }, []));

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, marginTop: 60 }} />;

  const net = data.income - data.expenses;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name} 👋</Text>
          <Text style={styles.month}>{new Date().toLocaleString('es', { month: 'long', year: 'numeric' })}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Balance general */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Balance del mes</Text>
        <Text style={[styles.net, { color: net >= 0 ? '#4CAF50' : '#F44336' }]}>
          {net >= 0 ? '+' : ''}${net.toFixed(2)}
        </Text>
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Ingresos</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>${data.income.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gastos</Text>
            <Text style={[styles.statValue, { color: '#F44336' }]}>${data.expenses.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Cuentas */}
      <Text style={styles.sectionTitle}>Saldo por cuenta</Text>
      {data.accounts.length === 0
        ? <Text style={styles.empty}>No hay cuentas</Text>
        : data.accounts.map(a => (
          <View key={a.id} style={styles.accountRow}>
            <Text style={styles.accountName}>{a.name}</Text>
            <Text style={[styles.accountBalance, { color: a.balance >= 0 ? '#4CAF50' : '#F44336' }]}>
              ${a.balance?.toFixed(2)}
            </Text>
          </View>
        ))
      }

      {/* Gráfica de torta */}
      {data.byCategory.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Gastos por categoría</Text>
          <PieChart
            data={data.byCategory}
            width={width - 24}
            height={200}
            chartConfig={{ color: (o = 1) => `rgba(0,0,0,${o})` }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="10"
            style={styles.chart}
          />
          {data.byCategory.map((c, i) => (
            <View key={c.name} style={styles.catRow}>
              <View style={[styles.dot, { backgroundColor: c.color }]} />
              <Text style={styles.catName}>{c.name}</Text>
              <Text style={styles.catAmount}>${c.amount.toFixed(2)}</Text>
              <Text style={styles.catPct}>
                {data.expenses > 0 ? Math.round((c.amount / data.expenses) * 100) : 0}%
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#2196F3' },
  greeting: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  month: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  balanceCard: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 20, elevation: 2 },
  balanceTitle: { fontSize: 14, color: '#888', marginBottom: 6 },
  net: { fontSize: 36, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statLabel: { color: '#888', fontSize: 13 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', margin: 12, marginBottom: 6 },
  accountRow: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6, borderRadius: 8, padding: 14, flexDirection: 'row', justifyContent: 'space-between', elevation: 1 },
  accountName: { fontSize: 15 },
  accountBalance: { fontSize: 15, fontWeight: 'bold' },
  chart: { marginHorizontal: 12, borderRadius: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  catName: { flex: 1, fontSize: 14 },
  catAmount: { fontSize: 14, fontWeight: 'bold', marginRight: 8 },
  catPct: { fontSize: 13, color: '#888', width: 36, textAlign: 'right' },
  empty: { textAlign: 'center', color: '#aaa', margin: 20 },
});