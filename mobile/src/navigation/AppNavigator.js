import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TransactionListScreen from '../screens/transactions/TransactionListScreen';
import TransactionFormScreen from '../screens/transactions/TransactionFormScreen';
import AccountsScreen from '../screens/accounts/AccountsScreen';
import BudgetsScreen from '../screens/budgets/BudgetsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard:     '📊',
  Transacciones: '💸',
  Cuentas:       '🏦',
  Presupuestos:  '🎯',
};

const MainTabs = () => {
  const { theme } = useTheme();  

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Transacciones" component={TransactionListScreen} />
      <Tab.Screen name="Cuentas" component={AccountsScreen} />
      <Tab.Screen name="Presupuestos" component={BudgetsScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { user, loading } = useAuth();  
  const { theme, isDark, themeLoaded } = useTheme(); 

  if (loading || !themeLoaded) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
      <ActivityIndicator size="large" color="#2196F3" />
    </View>
  );

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: theme.bg, card: theme.card, border: theme.border, text: theme.text } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: theme.bg, card: theme.card, border: theme.border, text: theme.text } };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="TransactionForm" component={TransactionFormScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}