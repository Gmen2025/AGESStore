import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useStore } from '../context/StoreContext';
import { COLORS, SPACING } from '../theme/colors';

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

export default function StoreProfileScreen() {
  const { owner, logout } = useStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(owner?.storeName ?? 'S').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.storeName}>{owner?.storeName ?? 'My Store'}</Text>
        <Text style={styles.ownerName}>{owner?.fullName ?? owner?.email}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="Email" value={owner?.email} />
        <InfoRow label="Phone" value={owner?.phone} />
        <InfoRow label="Category" value={owner?.category} />
        <InfoRow label="Address" value={owner?.address} />
        <InfoRow label="City" value={owner?.city} />
        <InfoRow label="Country" value={owner?.country} />
        <InfoRow
          label="GPS Location"
          value={owner?.latitude != null ? `${Number(owner.latitude).toFixed(5)}, ${Number(owner.longitude).toFixed(5)}` : null}
        />
        <InfoRow label="Business Hours" value={owner?.openHour ? `${owner.openHour} – ${owner.closeHour}` : null} />
        <InfoRow label="Payout Account" value={owner?.bankAccount} />
        <InfoRow label="Description" value={owner?.description} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  avatarWrap: { alignItems: 'center', marginVertical: SPACING.lg },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '800' },
  storeName: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: SPACING.sm },
  ownerName: { color: COLORS.textSecondary, marginTop: 2 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: SPACING.md },
  infoRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  logoutBtn: { backgroundColor: '#FFE5EA', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING.xl },
  logoutText: { color: COLORS.danger, fontWeight: '800', fontSize: 15 },
});
