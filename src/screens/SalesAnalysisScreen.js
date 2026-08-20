import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { demoSales } from '../data/demoData';
import { COLORS, SPACING } from '../theme/colors';
import { Section, money } from '../components/common';

const RANGES = ['Today', '7 Days', '30 Days', '3 Months', '1 Year'];

function Row({ label, value, negative, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, negative && { color: COLORS.danger }, bold && styles.bold]}>
        {negative ? '−' : ''}{money(value)}
      </Text>
    </View>
  );
}

export default function SalesAnalysisScreen() {
  const [range, setRange] = useState('30 Days');
  const [data] = useState(demoSales);

  const s = data[range];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
      <Text style={styles.title}>Sales Analysis</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangeBar}>
        {RANGES.map((r) => (
          <TouchableOpacity key={r} style={[styles.rangeBtn, range === r && styles.rangeActive]} onPress={() => setRange(r)}>
            <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Store Net Earnings ({range})</Text>
        <Text style={styles.heroValue}>{money(s.net)}</Text>
        <Text style={styles.heroSub}>{s.orders} orders · avg {money(s.avgOrder)} per order</Text>
      </View>

      <Section title="Revenue Breakdown">
        <View style={styles.card}>
          <Row label="Product sales" value={s.gross} />
          <Row label="Discounts" value={s.discounts} negative />
          <Row label="Refunds" value={s.refunds} negative />
          <Row label="Platform commission" value={s.commission} negative />
          <View style={styles.divider} />
          <Row label="Store earnings" value={s.net} bold />
        </View>
      </Section>

      <Section title="Order Metrics">
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{s.orders}</Text>
            <Text style={styles.metricLabel}>Orders</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{money(s.avgOrder)}</Text>
            <Text style={styles.metricLabel}>Avg Order Value</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{((s.refunds / Math.max(s.gross, 1)) * 100).toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Refund Rate</Text>
          </View>
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  rangeBar: { flexGrow: 0, marginBottom: SPACING.md },
  rangeBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  rangeActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rangeText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
  rangeTextActive: { color: '#fff' },
  heroCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: SPACING.lg, alignItems: 'center' },
  heroLabel: { color: '#C7D4FF', fontSize: 13, fontWeight: '600' },
  heroValue: { color: '#fff', fontSize: 34, fontWeight: '800', marginVertical: 6 },
  heroSub: { color: '#C7D4FF', fontSize: 13 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { color: COLORS.textSecondary, fontSize: 14 },
  rowValue: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  bold: { fontWeight: '800', color: COLORS.text, fontSize: 15 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 6 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metric: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: SPACING.md, alignItems: 'center', marginHorizontal: 4 },
  metricValue: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  metricLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
});
