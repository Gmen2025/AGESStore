import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { demoDashboard, demoTopProducts } from '../data/demoData';
import { COLORS, SPACING } from '../theme/colors';
import { StatCard, Section, Badge, money } from '../components/common';

export default function DashboardScreen({ navigation }) {
  const { owner } = useStore();
  const [stats, setStats] = useState(demoDashboard);
  const [topProducts, setTopProducts] = useState(demoTopProducts);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!owner?.storeId) return;
    try {
      const [d, t] = await Promise.all([
        api.getDashboard(owner.storeId),
        api.getTopProducts(owner.storeId),
      ]);
      if (d) setStats((s) => ({ ...s, ...d }));
      if (t?.products) setTopProducts(t.products.length ? t.products : demoTopProducts);
    } catch (e) {
      console.warn('dashboard load failed', e.message);
    }
  }, [owner?.storeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const maxSold = Math.max(...topProducts.map((p) => p.sold), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: SPACING.md }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Hello, {owner?.storeName ?? 'Store'} 👋</Text>
      <Text style={styles.sub}>Here is how your store is doing today.</Text>

      <View style={styles.grid}>
        <StatCard label="Today's Sales" value={money(stats.todaySales)} accent={COLORS.accent} />
        <StatCard label="Monthly Sales" value={money(stats.monthlySales)} accent={COLORS.primary} onPress={() => navigation.navigate('Sales')} />
        <StatCard label="Orders" value={stats.totalOrders} accent={COLORS.primary} onPress={() => navigation.navigate('Orders')} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} accent={COLORS.warning} onPress={() => navigation.navigate('Orders')} />
        <StatCard label="Products" value={stats.totalProducts} accent={COLORS.primary} onPress={() => navigation.navigate('Products')} />
        <StatCard label="Customer Rating" value={`${stats.avgRating} ⭐`} accent={COLORS.star} onPress={() => navigation.navigate('Reviews')} />
        <StatCard label="Available Balance" value={money(stats.availableBalance)} accent={COLORS.accent} onPress={() => navigation.navigate('Earnings')} />
        <StatCard label="Pending Payout" value={money(stats.pendingPayout)} accent={COLORS.warning} onPress={() => navigation.navigate('Earnings')} />
      </View>

      {(stats.lowStock > 0 || stats.outOfStock > 0) && (
        <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate('Products', { filter: 'low' })}>
          <Text style={styles.alertTitle}>⚠️ Inventory Alerts</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Badge text={`${stats.lowStock} Low Stock`} color={COLORS.warning} />
            <View style={{ width: 8 }} />
            <Badge text={`${stats.outOfStock} Out of Stock`} color={COLORS.danger} />
          </View>
        </TouchableOpacity>
      )}

      <Section title="🏆 Top Selling Products" actionLabel="See all" onAction={() => navigation.navigate('Products')}>
        {topProducts.slice(0, 5).map((p, i) => (
          <View key={p.id} style={styles.topRow}>
            <Text style={styles.rank}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.topName}>{p.name}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(p.sold / maxSold) * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.topSold}>{p.sold} sold</Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  sub: { color: COLORS.textSecondary, marginBottom: SPACING.md, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  alertCard: { backgroundColor: '#FFF6E5', borderRadius: 14, padding: SPACING.md, marginTop: SPACING.sm, borderWidth: 1, borderColor: '#FFE0A3' },
  alertTitle: { fontWeight: '700', color: COLORS.text },
  topRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.sm },
  rank: { width: 28, fontSize: 16, fontWeight: '800', color: COLORS.primary },
  topName: { fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  barTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 3 },
  topSold: { marginLeft: 10, fontWeight: '700', color: COLORS.textSecondary, fontSize: 12 },
});
