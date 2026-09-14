import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import AppHeader from '../components/AppHeader';
import CountrySwitcher from '../components/CountrySwitcher';
import DashboardScreen from '../screens/DashboardScreen';
import SalesAnalysisScreen from '../screens/SalesAnalysisScreen';
import ProductsScreen from '../screens/ProductsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import EarningsScreen from '../screens/EarningsScreen';
import StoreProfileScreen from '../screens/StoreProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: '⌂',
  Orders: '🧾',
  Products: '📦',
  Earnings: '💰',
  Store: '🏪',
};

function TabIcon({ name, focused }) {
  return <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.45 }]}>{TAB_ICONS[name]}</Text>;
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => <AppHeader />,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: [styles.tabBar, { height: 56 + insets.bottom, paddingBottom: insets.bottom + 8 }],
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Store" component={StoreProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTintColor: COLORS.primary, headerTitleStyle: { fontWeight: '700' }, headerRight: () => <CountrySwitcher /> }}>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Sales" component={SalesAnalysisScreen} options={{ title: 'Sales Analysis' }} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: 'Customer Reviews' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: { paddingTop: 6, backgroundColor: COLORS.card },
  tabIcon: { fontSize: 20 },
});
