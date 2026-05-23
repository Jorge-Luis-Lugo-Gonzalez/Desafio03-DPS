import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions,
  ActivityIndicator, TouchableOpacity, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

const { width } = Dimensions.get('window');
const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#009688', '#FF5722'];

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ income: 0, expenses: 0, accounts: [], byCategory: [] });

  const fetchData = async () => {
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

      const catMap = {};
      txs.filter(t => t.type === 'expense').forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });
      const byCategory = Object.entries(catMap).map(([name, amount], i) => ({
        name, amount,
        color: COLORS[i % COLORS.length],
        legendFontColor: theme.subtext,
        legendFontSize: 12,
      }));

      setStats({ income, expenses, accounts: accRes.data, byCategory });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const net = stats.income - stats.expenses;
  const monthName = new Date().toLocaleString('es', { month: 'long', year: 'numeric' });

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.header} />
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1a237e' : '#1a237e' }]}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name} 👋</Text>
          <Text style={styles.month}>{monthName}</Text>
        </View>
        <View style={styles.headerActions}>
          {/* Toggle tema */}
          <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
            <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tarjeta de saldo */}
      <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.balanceLabel, { color: theme.muted }]}>Saldo neto del mes</Text>
        <Text style={[styles.netAmount, { color: net >= 0 ? '#4CAF50' : '#F44336' }]}>
          {net >= 0 ? '+' : ''}${net.toFixed(2)}
        </Text>
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>💚 Ingresos</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>${stats.income.toFixed(2)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>❤️ Gastos</Text>
            <Text style={[styles.statValue, { color: '#F44336' }]}>${stats.expenses.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Saldo por cuenta */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>💳 Saldo por cuenta</Text>
      {stats.accounts.length === 0
        ? <Text style={[styles.empty, { color: theme.muted }]}>No hay cuentas creadas</Text>
        : stats.accounts.map(a => (
          <View key={a.id} style={[styles.accountRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.accountName, { color: theme.text }]}>{a.name}</Text>
            <Text style={[styles.accountBalance, { color: (a.balance ?? 0) >= 0 ? '#4CAF50' : '#F44336' }]}>
              ${(a.balance ?? 0).toFixed(2)}
            </Text>
          </View>
        ))
      }

      {/* Gráfica de categorías */}
      {stats.byCategory.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Gastos por categoría</Text>
          <PieChart
            data={stats.byCategory}
            width={width - 24}
            height={200}
            chartConfig={{
              color: (opacity = 1) => isDark
                ? `rgba(240,240,240,${opacity})`
                : `rgba(0,0,0,${opacity})`,
              backgroundColor: theme.card,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="10"
            style={styles.chart}
          />
          {stats.byCategory.map(c => (
            <View key={c.name} style={[styles.catRow, { backgroundColor: theme.card }]}>
              <View style={[styles.dot, { backgroundColor: c.color }]} />
              <Text style={[styles.catName, { color: theme.text }]}>{c.name}</Text>
              <Text style={[styles.catAmount, { color: theme.text }]}>${c.amount.toFixed(2)}</Text>
              <Text style={[styles.catPct, { color: theme.muted }]}>
                {stats.expenses > 0 ? Math.round((c.amount / stats.expenses) * 100) : 0}%
              </Text>
            </View>
          ))}
        </>
      ) : (
        <Text style={[styles.empty, { color: theme.muted }]}>Sin gastos este mes para mostrar gráfica</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  month: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  themeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 4,
  },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#fff', fontSize: 13 },
  balanceCard: { margin: 12, borderRadius: 16, padding: 20, elevation: 3 },
  balanceLabel: { fontSize: 13, marginBottom: 4 },
  netAmount: { fontSize: 38, fontWeight: 'bold', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  divider: { width: 1 },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 13 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 12, marginTop: 16, marginBottom: 8 },
  accountRow: { marginHorizontal: 12, marginBottom: 6, borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', elevation: 1, borderWidth: 1 },
  accountName: { fontSize: 15 },
  accountBalance: { fontSize: 16, fontWeight: 'bold' },
  chart: { marginHorizontal: 12, borderRadius: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, marginHorizontal: 12, marginBottom: 4, borderRadius: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  catName: { flex: 1, fontSize: 14 },
  catAmount: { fontSize: 14, fontWeight: 'bold', marginRight: 10 },
  catPct: { fontSize: 13, width: 38, textAlign: 'right' },
  empty: { textAlign: 'center', margin: 20, fontSize: 14 },
});