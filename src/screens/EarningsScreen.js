import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { demoEarnings } from '../data/demoData';
import { COLORS, SPACING } from '../theme/colors';
import { Section, money } from '../components/common';

export default function EarningsScreen() {
  const { owner } = useStore();
  const [earnings, setEarnings] = useState(demoEarnings);
  const [requesting, setRequesting] = useState(false);

  const load = useCallback(async () => {
    if (!owner?.storeId) return;
    try {
      const result = await api.getEarnings(owner.storeId);
      if (result) {
        setEarnings({
          available: result.available ?? 0,
          pending: result.pending ?? 0,
          totalEarned: result.totalEarned ?? 0,
          transactions: (result.transactions || []).map((t) => ({
            ...t,
            date: t.date ? new Date(t.date).toLocaleDateString() : '',
          })),
        });
      }
    } catch (e) {
      console.warn('earnings load failed', e.message);
    }
  }, [owner?.storeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const requestPayout = async () => {
    if (earnings.available <= 0) {
      Alert.alert('No balance', 'You have no available balance to withdraw.');
      return;
    }
    Alert.alert(
      'Request Payout',
      `Withdraw ${money(earnings.available)} to your registered payout account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setRequesting(true);
            try {
              await api.requestPayout(owner?.storeId, { amount: earnings.available });
              setEarnings((e) => ({ ...e, available: 0, pending: e.pending + e.available }));
              Alert.alert('Payout requested', 'Your payout is now pending and will be processed by the platform.');
            } catch (e) {
              Alert.alert('Payout failed', e.message);
            } finally {
              setRequesting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: SPACING.md }}
      data={earnings.transactions}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Earnings</Text>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>{money(earnings.available)}</Text>
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.miniLabel}>Pending Payout</Text>
                <Text style={styles.miniValue}>{money(earnings.pending)}</Text>
              </View>
              <View>
                <Text style={styles.miniLabel}>Total Earned</Text>
                <Text style={styles.miniValue}>{money(earnings.totalEarned)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.payoutBtn} onPress={requestPayout} disabled={requesting}>
              <Text style={styles.payoutText}>{requesting ? 'Requesting...' : 'Request Payout'}</Text>
            </TouchableOpacity>
          </View>

          <Section title="Transaction History">
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.2 }]}>Date</Text>
              <Text style={[styles.th, { flex: 1 }]}>Order</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Amount</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Fee</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Net</Text>
            </View>
          </Section>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.tableRow}>
          <Text style={[styles.td, { flex: 1.2 }]}>{item.date}</Text>
          <Text style={[styles.td, { flex: 1 }]}>{item.order}</Text>
          <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>{money(item.amount)}</Text>
          <Text style={[styles.td, { flex: 1, textAlign: 'right', color: COLORS.danger }]}>{money(item.commission)}</Text>
          <Text style={[styles.td, { flex: 1, textAlign: 'right', color: COLORS.accent, fontWeight: '700' }]}>{money(item.net)}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  balanceCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: SPACING.lg },
  balanceLabel: { color: '#C7D4FF', fontSize: 13, fontWeight: '600' },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginVertical: 6 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm, marginBottom: SPACING.md },
  miniLabel: { color: '#C7D4FF', fontSize: 11 },
  miniValue: { color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 2 },
  payoutBtn: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  payoutText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
  tableHeader: { flexDirection: 'row', paddingHorizontal: SPACING.sm, paddingBottom: 6 },
  th: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 10, padding: SPACING.sm + 4, marginBottom: 6 },
  td: { fontSize: 13, color: COLORS.text },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 20 },
});
