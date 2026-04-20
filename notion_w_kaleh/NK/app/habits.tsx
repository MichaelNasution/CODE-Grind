import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Plus, Flame, CheckCircle2, Circle, Trash2 } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { useNKStore } from '../store/useNKStore';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { AddHabitSheet } from '../components/sheets/AddHabitSheet';
import { Colors, Typography, Spacing, Radii, Animation } from '../constants/theme';
import type { Habit } from '../lib/schema';

function HabitCard({ habit, index }: { habit: Habit; index: number }) {
  const { toggleHabit, deleteHabit, isHabitCompletedToday } = useNKStore();
  const done = isHabitCompletedToday(habit.id);

  const handleToggle = async () => {
    const completed = await toggleHabit(habit.id);
    if (completed) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Habit', `Delete "${habit.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) },
    ]);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 24 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ ...Animation.spring, delay: index * 60 }}
    >
      <Card style={[styles.habitCard, done && { borderColor: habit.color, borderWidth: 1 }]}>
        <View style={styles.habitHeader}>
          <Text style={styles.habitIcon}>{habit.icon}</Text>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{habit.name}</Text>
            <View style={styles.streakRow}>
              <Flame size={12} color={habit.color} strokeWidth={2} />
              <Text style={[styles.streakText, { color: habit.color }]}>{habit.streak} day streak</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Trash2 size={14} color={Colors.textTertiary} strokeWidth={1.5} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
            <MotiView animate={{ scale: done ? 1.1 : 1 }} transition={Animation.springSnappy}>
              {done ? (
                <CheckCircle2 size={28} color={habit.color} strokeWidth={2} />
              ) : (
                <Circle size={28} color={Colors.textTertiary} strokeWidth={1.5} />
              )}
            </MotiView>
          </TouchableOpacity>
        </View>
        {done && (
          <MotiView
            from={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={Animation.spring}
            style={[styles.completedBar, { backgroundColor: habit.color }]}
          />
        )}
      </Card>
    </MotiView>
  );
}

export default function HabitsScreen() {
  const { habitList } = useNKStore();
  const sheetRef = useRef<BottomSheet>(null);
  const completedToday = habitList.filter((h) =>
    useNKStore.getState().isHabitCompletedToday(h.id)
  ).length;

  return (
    <View style={styles.screen}>
      <Header
        title="Habits"
        subtitle={`${completedToday}/${habitList.length} today`}
        right={
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); sheetRef.current?.expand(); }}
            style={styles.addBtn}
          >
            <Plus size={20} color={Colors.gold} strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      <FlashList
        data={habitList}
        keyExtractor={(h) => h.id}
        estimatedItemSize={100}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          habitList.length > 0 ? (
            <Card style={styles.progressCard}>
              <Text style={styles.progressLabel}>Today's Progress</Text>
              <View style={styles.progressBar}>
                <MotiView
                  from={{ width: '0%' as any }}
                  animate={{ width: `${habitList.length > 0 ? (completedToday / habitList.length) * 100 : 0}%` as any }}
                  transition={Animation.spring}
                  style={styles.progressFill}
                />
              </View>
              <Text style={styles.progressText}>{completedToday} of {habitList.length} completed</Text>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚡</Text>
            <Text style={styles.emptyTitle}>Build Your Habits</Text>
            <Text style={styles.emptySubtitle}>Track daily habits and build streaks.</Text>
            <TouchableOpacity onPress={() => sheetRef.current?.expand()} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Add First Habit</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item, index }) => <HabitCard habit={item} index={index} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <AddHabitSheet ref={sheetRef} onClose={() => sheetRef.current?.close()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingTop: 120, paddingHorizontal: Spacing.base },
  progressCard: { gap: Spacing.sm, marginBottom: Spacing.md },
  progressLabel: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  progressBar: { height: 6, backgroundColor: Colors.cardElevated, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 3 },
  progressText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  habitCard: { gap: Spacing.sm, overflow: 'hidden' },
  habitHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  habitIcon: { fontSize: 28 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  streakText: { fontSize: Typography.fontSize.xs, fontWeight: '600' },
  deleteBtn: { padding: Spacing.xs },
  completedBar: { height: 3, borderRadius: 2, marginTop: Spacing.xs },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  emptySubtitle: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.gold, borderRadius: Radii.pill, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, marginTop: Spacing.sm },
  emptyBtnText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: '#000' },
});
