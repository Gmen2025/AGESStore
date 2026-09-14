import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
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

function Field({ label, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={COLORS.textSecondary} {...props} />
    </View>
  );
}

const EDIT_FIELDS = [
  ['storeName', 'Store Name'],
  ['phone', 'Phone'],
  ['category', 'Business Category'],
  ['address', 'Store Address'],
  ['city', 'City'],
  ['country', 'Country'],
  ['openHour', 'Opens At'],
  ['closeHour', 'Closes At'],
  ['bankAccount', 'Payout Account'],
  ['description', 'Business Description'],
];

export default function StoreProfileScreen() {
  const { owner, logout, updateProfile } = useStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState(null);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const startEditing = () => {
    setForm({
      storeName: owner?.storeName ?? '', phone: owner?.phone ?? '',
      category: owner?.category ?? '', address: owner?.address ?? '',
      city: owner?.city ?? '', country: owner?.country ?? '',
      openHour: owner?.openHour ?? '', closeHour: owner?.closeHour ?? '',
      bankAccount: owner?.bankAccount ?? '', description: owner?.description ?? '',
      latitude: owner?.latitude ?? null, longitude: owner?.longitude ?? null,
    });
    setEditing(true);
  };

  const captureLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required so customers near your store can find it.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
    } catch (e) {
      Alert.alert('Location error', e.message);
    } finally {
      setLocating(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
      Alert.alert('Saved', 'Your store information has been updated.');
    } catch (e) {
      Alert.alert('Update failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
          <Text style={styles.storeName}>Update Store Info</Text>
          {EDIT_FIELDS.map(([key, label]) => (
            <Field key={key} label={label} value={form[key]} onChangeText={set(key)} multiline={key === 'description'} />
          ))}
          <TouchableOpacity style={styles.locationBtn} onPress={captureLocation} disabled={locating}>
            {locating ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.locationBtnText}>
                {form.latitude != null
                  ? `📍 Location updated (${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)})`
                  : '📍 Capture Store GPS Location'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)} disabled={saving}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
    <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
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

      <TouchableOpacity style={styles.updateBtn} onPress={startEditing}>
        <Text style={styles.updateBtnText}>Update Store Info</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
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
  updateBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: SPACING.lg },
  updateBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  field: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, fontSize: 15,
  },
  locationBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  locationBtnText: { color: '#fff', fontWeight: '700' },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.sm },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 14, marginBottom: SPACING.xl },
  cancelText: { color: COLORS.textSecondary, fontWeight: '600' },
});
