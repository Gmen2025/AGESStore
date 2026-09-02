import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/context/StoreContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { COLORS } from './src/theme/colors';

function Root() {
  const { owner, loading, logout } = useStore();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!owner) return <AuthScreen />;
  if (owner.approvalStatus && owner.approvalStatus !== 'approved') {
    return <View style={styles.pending}><Text style={styles.pendingTitle}>Store application submitted</Text><Text style={styles.pendingText}>Your store is waiting for administrator approval.</Text><TouchableOpacity style={styles.logout} onPress={logout}><Text style={styles.logoutText}>Log Out</Text></TouchableOpacity></View>;
  }
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  pending: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 28 },
  pendingTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  pendingText: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 10 },
  logout: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 13, marginTop: 28 },
  logoutText: { color: '#fff', fontWeight: '700' },
});
