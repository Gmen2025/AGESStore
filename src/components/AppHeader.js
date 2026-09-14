import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountrySwitcher from './CountrySwitcher';
import { COLORS, SPACING } from '../theme/colors';
import { useStore } from '../context/StoreContext';

// Fixed bar shown above every screen so the database switcher never scrolls out of view.
export default function AppHeader() {
  const { bumpDb } = useStore() || {};
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.bar}>
        <CountrySwitcher onChange={bumpDb} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: COLORS.card },
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
});
