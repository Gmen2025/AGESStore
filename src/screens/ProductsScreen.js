import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Modal,
  TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { demoProducts } from '../data/demoData';
import { COLORS, SPACING } from '../theme/colors';
import { Badge, money } from '../components/common';

const stockStatus = (p) => {
  if (p.stock <= 0) return { label: 'Out of Stock', color: COLORS.danger };
  if (p.stock <= p.minStock) return { label: 'Low Stock', color: COLORS.warning };
  return { label: 'Available', color: COLORS.success };
};

const EMPTY_FORM = { name: '', sku: '', category: '', description: '', price: '', stock: '', minStock: '10', brand: '', weight: '' };

export default function ProductsScreen({ route }) {
  const { owner } = useStore();
  const [products, setProducts] = useState(demoProducts);
  const [filter, setFilter] = useState(route?.params?.filter ?? 'all');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!owner?.storeId) return;
    try {
      const result = await api.getProducts(owner.storeId);
      if (result?.products) setProducts(result.products.length ? result.products : demoProducts);
    } catch (e) {
      console.warn('products load failed', e.message);
    }
  }, [owner?.storeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const filtered = useMemo(() => {
    if (filter === 'low') return products.filter((p) => p.stock <= p.minStock);
    if (filter === 'out') return products.filter((p) => p.stock <= 0);
    return products;
  }, [products, filter]);

  const addProduct = async () => {
    if (!form.name || !form.price) {
      Alert.alert('Missing fields', 'Product name and selling price are required.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock, 10) || 0,
      minStock: parseInt(form.minStock, 10) || 0,
    };
    try {
      const result = await api.createProduct(owner?.storeId, payload);
      const created = result?.product
        ? { ...result.product, sold: result.product.sold ?? 0, category: form.category }
        : { ...payload, id: `p-${Date.now()}`, sold: 0 };
      setProducts((list) => [created, ...list]);
      setModal(false);
      setForm(EMPTY_FORM);
    } catch (e) {
      Alert.alert('Could not add product', e.message);
    } finally {
      setSaving(false);
    }
  };

  const adjustStock = async (product, delta) => {
    const next = Math.max(0, product.stock + delta);
    setProducts((list) => list.map((p) => (p.id === product.id ? { ...p, stock: next } : p)));
    try {
      await api.adjustStock(owner?.storeId, product.id, { delta, reason: delta > 0 ? 'restock' : 'manual adjustment' });
    } catch (e) {
      // revert on failure
      setProducts((list) => list.map((p) => (p.id === product.id ? { ...p, stock: product.stock } : p)));
      Alert.alert('Stock update failed', e.message);
    }
  };

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'low', label: 'Low Stock' },
    { key: 'out', label: 'Out of Stock' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={styles.addBtnText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.key} style={[styles.filterBtn, filter === f.key && styles.filterActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: 0 }}
        ListEmptyComponent={<Text style={styles.empty}>No products in this view yet.</Text>}
        renderItem={({ item }) => {
          const status = stockStatus(item);
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productMeta}>{item.category} · {money(item.price)}</Text>
                <View style={{ marginTop: 8 }}><Badge text={status.label} color={status.color} /></View>
              </View>
              <View style={styles.stockBox}>
                <Text style={styles.stockNumber}>{item.stock}</Text>
                <Text style={styles.stockLabel}>left of {item.sold + item.stock}</Text>
                <Text style={styles.soldLabel}>{item.sold} sold</Text>
                <View style={styles.stockActions}>
                  <TouchableOpacity style={styles.stockBtn} onPress={() => adjustStock(item, -1)}>
                    <Text style={styles.stockBtnText}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.stockBtn} onPress={() => adjustStock(item, 1)}>
                    <Text style={styles.stockBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.modal} contentContainerStyle={{ padding: SPACING.lg }}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            {[
              ['Product Name *', 'name', 'default', 'e.g. Nido Milk 400g'],
              ['SKU / Code', 'sku', 'default', 'e.g. NIDO-400'],
              ['Category', 'category', 'default', 'e.g. Dairy'],
              ['Brand', 'brand', 'default', 'e.g. Nestlé'],
              ['Selling Price *', 'price', 'decimal-pad', 'e.g. 25'],
              ['Starting Inventory', 'stock', 'number-pad', 'e.g. 100'],
              ['Low-Stock Alert Level', 'minStock', 'number-pad', 'e.g. 10'],
              ['Weight / Size', 'weight', 'default', 'e.g. 400g'],
            ].map(([label, key, keyboard, placeholder]) => (
              <View key={key} style={styles.field}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[key]}
                  onChangeText={set(key)}
                  keyboardType={keyboard}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            ))}
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={form.description}
                onChangeText={set('description')}
                multiline
                placeholder="Product details shown to customers"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={addProduct} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Product'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40 },
  card: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 14, padding: SPACING.md, marginBottom: SPACING.sm },
  productName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  productMeta: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  stockBox: { alignItems: 'center', marginLeft: SPACING.md, minWidth: 80 },
  stockNumber: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  stockLabel: { fontSize: 11, color: COLORS.textSecondary },
  soldLabel: { fontSize: 11, color: COLORS.accent, fontWeight: '700', marginTop: 2 },
  stockActions: { flexDirection: 'row', marginTop: 8 },
  stockBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
  stockBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg, marginTop: SPACING.md },
  field: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { backgroundColor: COLORS.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: SPACING.sm },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { alignItems: 'center', paddingVertical: 14, marginBottom: SPACING.xl },
  cancelText: { color: COLORS.textSecondary, fontWeight: '600' },
});
