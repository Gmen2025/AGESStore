import React, { useEffect, useState } from 'react';
import { Modal, Platform, ActionSheetIOS, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import {
  COUNTRY_DB_MAP,
  DB_COUNTRY_MAP,
  getDatabaseNameFromStorage,
  setDatabaseNameInStorage,
} from '../databaseConfig';
import { COLORS } from '../theme/colors';

const COUNTRIES = [
  { id: 1, label: 'Ethiopia', value: 'Ethio', flag: '🇪🇹', currency: 'ETB' },
  { id: 2, label: 'USA', value: 'USA', flag: '🇺🇸', currency: '$' },
];

// Lets a store owner choose which country's database their account/store data lives in.
export default function CountrySwitcher({ onChange }) {
  const [visible, setVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Ethio');

  useEffect(() => {
    (async () => {
      const savedDb = await getDatabaseNameFromStorage();
      setSelectedCountry(DB_COUNTRY_MAP[savedDb] || 'Ethio');
    })();
  }, []);

  const selectCountry = async (country) => {
    setVisible(false);
    if (country.value === selectedCountry) {
      return;
    }
    const dbName = COUNTRY_DB_MAP[country.value];
    await setDatabaseNameInStorage(dbName);
    setSelectedCountry(country.value);
    if (typeof onChange === 'function') {
      onChange(dbName);
    }
  };

  const open = () => {
    if (Platform.OS === 'ios') {
      const options = COUNTRIES.map((c) => `${c.flag} ${c.label} (${c.currency})`);
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...options, 'Cancel'], cancelButtonIndex: options.length },
        (index) => {
          if (index < COUNTRIES.length) selectCountry(COUNTRIES[index]);
        }
      );
      return;
    }
    setVisible(true);
  };

  const current = COUNTRIES.find((c) => c.value === selectedCountry) || COUNTRIES[0];

  return (
    <View>
      <TouchableOpacity style={styles.pill} onPress={open}>
        <Text style={styles.pillText}>{current.flag} {current.value}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity key={c.id} style={styles.option} onPress={() => selectCountry(c)}>
                  <Text style={styles.optionText}>{c.flag} {c.label} ({c.currency})</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border, alignSelf: 'flex-start',
  },
  pillText: { fontWeight: '700', color: COLORS.text },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: COLORS.card, borderRadius: 14, overflow: 'hidden' },
  option: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  optionText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
