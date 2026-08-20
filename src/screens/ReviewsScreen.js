import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { demoReviews } from '../data/demoData';
import { COLORS, SPACING } from '../theme/colors';
import { Stars } from '../components/common';

export default function ReviewsScreen() {
  const [reviews] = useState(demoReviews);

  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Reviews</Text>

      <View style={styles.summaryCard}>
        <View style={{ alignItems: 'center', marginRight: SPACING.lg }}>
          <Text style={styles.avgNumber}>{avg}</Text>
          <Stars rating={Number(avg)} size={18} />
          <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
        </View>
        <View style={{ flex: 1 }}>
          {distribution.map(({ star, count }) => (
            <View key={star} style={styles.distRow}>
              <Text style={styles.distStar}>{star}★</Text>
              <View style={styles.distTrack}>
                <View style={[styles.distFill, { width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }]} />
              </View>
              <Text style={styles.distCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: 0 }}
        ListEmptyComponent={<Text style={styles.empty}>No reviews yet. Reviews appear after verified purchases.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.customer}>{item.customer}</Text>
                <Text style={styles.product}>on {item.product} · {item.date}</Text>
              </View>
              <Stars rating={item.rating} />
            </View>
            <Text style={styles.comment}>"{item.comment}"</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, padding: SPACING.md, paddingBottom: SPACING.md },
  summaryCard: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 14, padding: SPACING.lg, marginHorizontal: SPACING.md, marginBottom: SPACING.md, alignItems: 'center' },
  avgNumber: { fontSize: 40, fontWeight: '800', color: COLORS.text },
  totalReviews: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  distStar: { width: 26, fontSize: 12, color: COLORS.textSecondary },
  distTrack: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginHorizontal: 8 },
  distFill: { height: 6, backgroundColor: COLORS.star, borderRadius: 3 },
  distCount: { width: 20, fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: SPACING.md, marginBottom: SPACING.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  customer: { fontWeight: '700', color: COLORS.text },
  product: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  comment: { color: COLORS.text, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
});
