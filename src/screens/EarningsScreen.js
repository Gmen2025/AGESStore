import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { demoEarnings } from '../data/demoData';
import { COLORS, SPACING } from '../theme/colors';
import { Section, money } from '../components/common';

export default function EarningsScreen() {
  const { owner, dbVersion } = useStore();
  const [earnings, setEarnings] = useState({
    ...demoEarnings,
    currency: 'ETB',
    payouts: [],
  });
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'payouts'
  const [modalVisible, setModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutAccountInput, setPayoutAccountInput] = useState('');
  const [requesting, setRequesting] = useState(false);

  const load = useCallback(async () => {
    if (!owner?.storeId) return;
    try {
      const result = await api.getEarnings(owner.storeId);
      if (result) {
        setEarnings({
          currency: result.currency || 'ETB',
          available: result.available ?? 0,
          pending: result.pending ?? 0,
          totalEarned: result.totalEarned ?? 0,
          bankAccount: result.bankAccount || owner.bankAccount || '',
          transactions: (result.transactions || []).map((t) => ({
            ...t,
            date: t.date ? new Date(t.date).toLocaleDateString() : '',
          })),
          payouts: (result.payouts || []).map((p) => ({
            ...p,
            formattedDate: p.date ? new Date(p.date).toLocaleDateString() : '',
            formattedProcessed: p.dateProcessed ? new Date(p.dateProcessed).toLocaleDateString() : '',
          })),
        });
      }
    } catch (e) {
      console.warn('earnings load failed', e.message);
    }
  }, [owner?.storeId, owner?.bankAccount, dbVersion]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openPayoutModal = () => {
    if (earnings.available <= 0) {
      Alert.alert('No available balance', 'You have no delivered order balance available to withdraw at this time.');
      return;
    }
    setWithdrawAmount(String(earnings.available));
    setPayoutAccountInput(earnings.bankAccount || owner?.bankAccount || owner?.phone || '');
    setModalVisible(true);
  };

  const handleEarlyPayoutSubmit = async () => {
    const num = Number(withdrawAmount);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (num > earnings.available) {
      Alert.alert('Amount exceeds balance', `Maximum available to withdraw is ${money(earnings.available)}.`);
      return;
    }

    setRequesting(true);
    try {
      const res = await api.requestPayout(owner?.storeId, {
        amount: num,
        payoutType: 'early_request',
        accountDetails: payoutAccountInput.trim() || undefined,
      });

      if (res?.success) {
        setModalVisible(false);
        Alert.alert(
          'Early Payout Requested',
          'Your payout request has been sent to Easy Shopping admin. Funds will be transferred shortly.'
        );
        load();
      } else {
        Alert.alert('Request Failed', res?.message || 'Could not submit payout request.');
      }
    } catch (e) {
      Alert.alert('Payout failed', e.message || 'Unable to request payout right now.');
    } finally {
      setRequesting(false);
    }
  };

  const renderPayoutItem = ({ item }) => {
    const isPaid = item.status === 'paid';
    const isRejected = item.status === 'rejected';
    const isEarly = item.payoutType === 'early_request';

    return (
      <View style={styles.payoutCard}>
        <View style={styles.payoutHeader}>
          <View>
            <Text style={styles.payoutAmount}>{money(item.amount)}</Text>
            <Text style={styles.payoutDate}>Requested: {item.formattedDate || item.date}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={[
                styles.statusBadge,
                isPaid ? styles.statusPaid : isRejected ? styles.statusRejected : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isPaid ? styles.statusTextPaid : isRejected ? styles.statusTextRejected : styles.statusTextPending,
                ]}
              >
                {item.status ? item.status.toUpperCase() : 'PENDING'}
              </Text>
            </View>

            <View style={[styles.typeBadge, { backgroundColor: isEarly ? '#fef3c7' : '#e0e7ff' }]}>
              <Text style={[styles.typeBadgeText, { color: isEarly ? '#92400e' : '#3730a3' }]}>
                {isEarly ? '⚡ Early Request' : '📅 Weekly Settlement'}
              </Text>
            </View>
          </View>
        </View>

        {item.reference ? (
          <Text style={styles.payoutMeta}>Ref: {item.reference}</Text>
        ) : null}

        {item.accountDetails ? (
          <Text style={styles.payoutMeta}>To: {item.accountDetails}</Text>
        ) : null}

        {item.adminNotes ? (
          <Text style={styles.adminNote}>Admin note: {item.adminNotes}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        contentContainerStyle={{ padding: SPACING.md }}
        data={activeTab === 'transactions' ? earnings.transactions : earnings.payouts}
        keyExtractor={(item) => String(item.id || item._id)}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Earnings & Settlements</Text>

            {/* Policy Info Card */}
            <View style={styles.policyCard}>
              <Text style={styles.policyTitle}>ℹ️ Settlement Schedule</Text>
              <Text style={styles.policyText}>
                • <Text style={{ fontWeight: '700' }}>Weekly Payout:</Text> Regular payouts are automatically settled every Monday by Easy Shopping.
              </Text>
              <Text style={styles.policyText}>
                • <Text style={{ fontWeight: '700' }}>Early Payout Exception:</Text> Need funds sooner? You can request an early payout anytime below.
              </Text>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
              <Text style={styles.balanceValue}>{money(earnings.available)}</Text>
              <View style={styles.balanceRow}>
                <View>
                  <Text style={styles.miniLabel}>Pending Payout</Text>
                  <Text style={styles.miniValue}>{money(earnings.pending)}</Text>
                </View>
                <View>
                  <Text style={styles.miniLabel}>Total Net Earned</Text>
                  <Text style={styles.miniValue}>{money(earnings.totalEarned)}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.payoutBtn} onPress={openPayoutModal} disabled={requesting}>
                <Text style={styles.payoutText}>⚡ Request Early Payout</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs for Transactions vs Payout History */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
                onPress={() => setActiveTab('transactions')}
              >
                <Text style={[styles.tabTitle, activeTab === 'transactions' && styles.tabTitleActive]}>
                  Order Revenue ({earnings.transactions?.length || 0})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'payouts' && styles.tabActive]}
                onPress={() => setActiveTab('payouts')}
              >
                <Text style={[styles.tabTitle, activeTab === 'payouts' && styles.tabTitleActive]}>
                  Payout History ({earnings.payouts?.length || 0})
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'transactions' ? (
              <Section title="Delivered Orders Ledger (95% Net)">
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 1.2 }]}>Date</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Order</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Gross</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Fee (5%)</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Net</Text>
                </View>
              </Section>
            ) : null}
          </>
        }
        renderItem={({ item }) =>
          activeTab === 'transactions' ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { flex: 1.2 }]}>{item.date}</Text>
              <Text style={[styles.td, { flex: 1 }]}>{item.order}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>{money(item.amount)}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: 'right', color: COLORS.danger }]}>
                {money(item.commission)}
              </Text>
              <Text style={[styles.td, { flex: 1, textAlign: 'right', color: COLORS.accent, fontWeight: '700' }]}>
                {money(item.net)}
              </Text>
            </View>
          ) : (
            renderPayoutItem({ item })
          )
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {activeTab === 'transactions' ? 'No delivered order transactions yet.' : 'No payout requests yet.'}
          </Text>
        }
      />

      {/* Early Payout Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚡ Request Early Payout</Text>
            <Text style={styles.modalSubtitle}>
              Withdraw your delivered order earnings prior to the weekly Monday settlement.
            </Text>

            <View style={styles.availBox}>
              <Text style={styles.availLabel}>Available Balance:</Text>
              <Text style={styles.availVal}>{money(earnings.available)}</Text>
            </View>

            <Text style={styles.inputLabel}>Withdrawal Amount:</Text>
            <View style={styles.amountInputRow}>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="0.00"
              />
              <TouchableOpacity
                style={styles.maxBtn}
                onPress={() => setWithdrawAmount(String(earnings.available))}
              >
                <Text style={styles.maxBtnText}>MAX</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Payout Account / Telebirr / Bank Details:</Text>
            <TextInput
              style={styles.textInput}
              value={payoutAccountInput}
              onChangeText={setPayoutAccountInput}
              placeholder="e.g. CBE 1000... or Telebirr 2519... or US Checking"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setModalVisible(false)}
                disabled={requesting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSubmitBtn]}
                onPress={handleEarlyPayoutSubmit}
                disabled={requesting}
              >
                {requesting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  policyCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  policyTitle: { fontSize: 13, fontWeight: '800', color: '#1e40af', marginBottom: 4 },
  policyText: { fontSize: 12, color: '#1e3a8a', lineHeight: 18, marginTop: 2 },
  balanceCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.md },
  balanceLabel: { color: '#C7D4FF', fontSize: 13, fontWeight: '600' },
  balanceValue: { color: '#fff', fontSize: 34, fontWeight: '800', marginVertical: 6 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm, marginBottom: SPACING.md },
  miniLabel: { color: '#C7D4FF', fontSize: 11 },
  miniValue: { color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 2 },
  payoutBtn: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  payoutText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primary },
  tabTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  tabTitleActive: { color: '#fff' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: SPACING.sm, paddingBottom: 6 },
  th: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 10, padding: SPACING.sm + 4, marginBottom: 6 },
  td: { fontSize: 13, color: COLORS.text },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 20 },
  payoutCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border || '#e2e8f0',
  },
  payoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  payoutAmount: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  payoutDate: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusPending: { backgroundColor: '#fef3c7' },
  statusPaid: { backgroundColor: '#dcfce7' },
  statusRejected: { backgroundColor: '#fee2e2' },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  statusTextPending: { color: '#b45309' },
  statusTextPaid: { color: '#15803d' },
  statusTextRejected: { color: '#b91c1c' },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  payoutMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  adminNote: { fontSize: 11, color: '#475569', fontStyle: 'italic', marginTop: 4, backgroundColor: '#f1f5f9', padding: 6, borderRadius: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 14, lineHeight: 16 },
  availBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  availLabel: { fontSize: 13, color: '#475569', fontWeight: '600' },
  availVal: { fontSize: 15, color: '#0f766e', fontWeight: '800' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#334155', marginTop: 8, marginBottom: 4 },
  amountInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  maxBtn: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
  },
  maxBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  modalButtons: { flexDirection: 'row', marginTop: 20, gap: 10 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: { backgroundColor: '#e2e8f0' },
  modalCancelText: { color: '#334155', fontWeight: '700', fontSize: 13 },
  modalSubmitBtn: { backgroundColor: '#059669' },
  modalSubmitText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
