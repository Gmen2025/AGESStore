import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { demoOrders } from '../data/demoData';
import { COLORS, SPACING } from '../theme/colors';
import { Badge, money } from '../components/common';

const PIPELINE = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Delivered'];

const STATUS_COLORS = {
  Pending: COLORS.warning,
  Confirmed: COLORS.primary,
  Preparing: COLORS.primary,
  'Ready for Pickup': COLORS.accent,
  'Picked Up': COLORS.accent,
  Delivered: COLORS.success,
  Cancelled: COLORS.danger,
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState(demoOrders);
  const [tab, setTab] = useState('Active');
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    if (tab === 'Active') return orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status));
    if (tab === 'Completed') return orders.filter((o) => o.status === 'Delivered');
    return orders.filter((o) => o.status === 'Cancelled');
  }, [orders, tab]);

  const advance = (order) => {
    const idx = PIPELINE.indexOf(order.status);
    if (idx < 0 || idx >= PIPELINE.length - 1) return;
    const next = PIPELINE[idx + 1];
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
  };

  const cancel = (order) => {
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: 'Cancelled' } : o)));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      <View style={styles.tabs}>
        {['Active', 'Completed', 'Cancelled'].map((t) => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: 0 }}
        ListEmptyComponent={<Text style={styles.empty}>No orders here right now.</Text>}
        renderItem={({ item }) => {
          const open = expanded === item.id;
          const canAdvance = !['Delivered', 'Cancelled'].includes(item.status);
          return (
            <TouchableOpacity style={styles.card} onPress={() => setExpanded(open ? null : item.id)} activeOpacity={0.8}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderId}>Order #{item.id}</Text>
                  <Text style={styles.orderMeta}>{item.customer} · {item.time}</Text>
                  <Text style={styles.orderMeta}>📍 {item.location}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.orderTotal}>{money(item.total)}</Text>
                  <Badge text={item.status} color={STATUS_COLORS[item.status] ?? COLORS.primary} />
                </View>
              </View>

              {open && (
                <View style={styles.details}>
                  {item.items.map((it, i) => (
                    <View key={i} style={styles.itemRow}>
                      <Text style={styles.itemText}>{it.qty} × {it.name}</Text>
                      <Text style={styles.itemText}>{money(it.qty * it.price)}</Text>
                    </View>
                  ))}
                  {canAdvance && (
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.advanceBtn} onPress={() => advance(item)}>
                        <Text style={styles.advanceText}>
                          Mark as "{PIPELINE[PIPELINE.indexOf(item.status) + 1]}"
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => cancel(item)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, padding: SPACING.md, paddingBottom: 8 },
  tabs: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: SPACING.md, marginBottom: SPACING.sm },
  cardTop: { flexDirection: 'row' },
  orderId: { fontWeight: '800', color: COLORS.text, fontSize: 15 },
  orderMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 3 },
  orderTotal: { fontWeight: '800', color: COLORS.primary, fontSize: 17, marginBottom: 6 },
  details: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemText: { color: COLORS.text, fontSize: 13 },
  actions: { marginTop: SPACING.sm },
  advanceBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  advanceText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: COLORS.danger, fontWeight: '600', fontSize: 13 },
});
