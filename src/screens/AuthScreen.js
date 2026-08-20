import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useStore } from '../context/StoreContext';
import { COLORS, SPACING } from '../theme/colors';

function Field({ label, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={COLORS.textSecondary} {...props} />
    </View>
  );
}

export default function AuthScreen() {
  const { login, register } = useStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    fullName: '', storeName: '', phone: '', email: '', password: '',
    category: '', address: '', city: '', country: '', description: '',
    bankAccount: '', openHour: '', closeHour: '',
    latitude: null, longitude: null,
  });

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

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
      // Try to pre-fill address fields via reverse geocoding
      try {
        const [addr] = await Location.reverseGeocodeAsync(pos.coords);
        if (addr) {
          setForm((f) => ({
            ...f,
            address: f.address || [addr.streetNumber, addr.street].filter(Boolean).join(' '),
            city: f.city || addr.city || '',
            country: f.country || addr.country || '',
          }));
        }
      } catch { /* reverse geocode is best-effort */ }
    } catch (e) {
      Alert.alert('Location error', e.message);
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'login') {
        if (!form.email || !form.password) throw new Error('Enter your email and password.');
        await login(form.email.trim(), form.password);
      } else {
        if (!form.fullName || !form.storeName || !form.email || !form.password)
          throw new Error('Fill in at least name, store name, email and password.');
        if (form.latitude == null)
          throw new Error('Please capture your store GPS location — it is required for delivery matching.');
        await register(form);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.lg }}>
        <Text style={styles.brand}>AGES Store Owner</Text>
        <Text style={styles.tagline}>Sell locally. Deliver fast. Get paid.</Text>

        <View style={styles.switch}>
          {['login', 'register'].map((m) => (
            <TouchableOpacity key={m} style={[styles.switchBtn, mode === m && styles.switchActive]} onPress={() => setMode(m)}>
              <Text style={[styles.switchText, mode === m && styles.switchTextActive]}>
                {m === 'login' ? 'Login' : 'Register Store'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'register' && (
          <>
            <Field label="Full Name" value={form.fullName} onChangeText={set('fullName')} placeholder="e.g. Abel Kebede" />
            <Field label="Store Name" value={form.storeName} onChangeText={set('storeName')} placeholder="e.g. AGES Market" />
            <Field label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="+251 ..." />
            <Field label="Business Category" value={form.category} onChangeText={set('category')} placeholder="Grocery, Pharmacy..." />
          </>
        )}

        <Field label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" placeholder="owner@store.com" />
        <Field label="Password" value={form.password} onChangeText={set('password')} secureTextEntry placeholder="••••••••" />

        {mode === 'register' && (
          <>
            <Field label="Store Address" value={form.address} onChangeText={set('address')} placeholder="Street / area" />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Field label="City" value={form.city} onChangeText={set('city')} placeholder="Addis Ababa" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Country" value={form.country} onChangeText={set('country')} placeholder="Ethiopia" />
              </View>
            </View>

            <TouchableOpacity style={styles.locationBtn} onPress={captureLocation} disabled={locating}>
              {locating ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.locationBtnText}>
                  {form.latitude != null
                    ? `📍 Location captured (${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)})`
                    : '📍 Capture Store GPS Location'}
                </Text>
              )}
            </TouchableOpacity>

            <Field label="Business Description" value={form.description} onChangeText={set('description')} placeholder="What does your store sell?" multiline />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Field label="Opens At" value={form.openHour} onChangeText={set('openHour')} placeholder="08:00" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Closes At" value={form.closeHour} onChangeText={set('closeHour')} placeholder="21:00" />
              </View>
            </View>
            <Field label="Bank / Payout Account" value={form.bankAccount} onChangeText={set('bankAccount')} placeholder="Account for receiving payouts" />
          </>
        )}

        <TouchableOpacity style={styles.submit} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.submitText}>{mode === 'login' ? 'Login' : 'Create Store Account'}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Demo mode: any credentials work — the app uses local demo data until you connect the backend in src/api.js.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  brand: { fontSize: 28, fontWeight: '800', color: COLORS.primary, marginTop: SPACING.xl },
  tagline: { color: COLORS.textSecondary, marginBottom: SPACING.lg, marginTop: 4 },
  switch: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 12, padding: 4, marginBottom: SPACING.lg },
  switchBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  switchActive: { backgroundColor: COLORS.card },
  switchText: { color: COLORS.textSecondary, fontWeight: '600' },
  switchTextActive: { color: COLORS.primary },
  field: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, fontSize: 15,
  },
  row: { flexDirection: 'row' },
  locationBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  locationBtnText: { color: '#fff', fontWeight: '700' },
  submit: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: SPACING.sm,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { color: COLORS.textSecondary, fontSize: 12, marginTop: SPACING.md, textAlign: 'center', marginBottom: SPACING.xl },
});
