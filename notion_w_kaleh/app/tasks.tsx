import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNKStore } from '../store/useNKStore';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TaskItem } from '../components/modules/TaskItem';
import { AddTaskSheet } from '../components/sheets/AddTaskSheet';
import { Colors, Typography, Spacing, Radii, Animation } from '../constants/theme';
import type { Task } from '../lib/schema';

type FilterKey = 'all' | 'personal' | 'work' | 'health' | 'finance' | 'other';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'personal', label: 'Personal' },
  { key: 'work', label: 'Work' },
  { key: 'health', label: 'Health' },
  { key: 'finance', label: 'Finance' },
];

export default function TasksScreen() {
  const { taskList } = useNKStore();
  const sheetRef = useRef<BottomSheet>(null);
  const [filter, setFilter] = useState<FilterKey>('all');

  const pending = taskList.filter((t) => !t.isCompleted);
  const completed = taskList.filter((t) => t.isCompleted);

  const filtered = filter === 'all'
    ? taskList
    : taskList.filter((t) => t.category === filter);

  const filteredPending = filtered.filter((t) => !t.isCompleted);
  const filteredDone = filtered.filter((t) => t.isCompleted);

  const data: (Task | { type: 'section'; label: string })[] = [
    ...(filteredPending.length > 0 ? [{ type: 'section' as const, label: `Pending (${filteredPending.length})` }, ...filteredPending] : []),
    ...(filteredDone.length > 0 ? [{ type: 'section' as const, label: `Completed (${filteredDone.length})` }, ...filteredDone] : []),
  ];

  return (
    <GestureHandlerRootView style={styles.screen}>
      <Header
        title="Tasks"
        subtitle={`${pending.length} remaining`}
        right={
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              sheetRef.current?.expand();
            }}
            style={styles.addBtn}
          >
            <Plus size={20} color={Colors.gold} strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      <FlashList
        data={data}
        keyExtractor={(item, i) => ('id' in item ? item.id : `section-${i}`)}
        estimatedItemSize={72}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Summary Card */}
            <MotiView from={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={Animation.spring}>
              <Card style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{pending.length}</Text>
                    <Text style={styles.summaryLabel}>Pending</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: Colors.green }]}>{completed.length}</Text>
                    <Text style={styles.summaryLabel}>Done</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{taskList.length}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                  </View>
                </View>
                {taskList.length > 0 && (
                  <View style={styles.progressBar}>
                    <MotiView
                      from={{ width: '0%' as any }}
                      animate={{ width: `${(completed.length / taskList.length) * 100}%` as any }}
                      transition={Animation.spring}
                      style={styles.progressFill}
                    />
                  </View>
                )}
              </Card>
            </MotiView>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => { Haptics.selectionAsync(); setFilter(f.key); }}
                  style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptySubtitle}>No tasks here. Add one to get started.</Text>
            <TouchableOpacity onPress={() => sheetRef.current?.expand()} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          if ('type' in item) {
            return <Text style={styles.sectionLabel}>{item.label}</Text>;
          }
          return (
            <View style={styles.taskWrapper}>
              <TaskItem task={item} />
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.separator, marginLeft: 16 + 28 + 12 }} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <AddTaskSheet ref={sheetRef} onClose={() => sheetRef.current?.close()} />
    </GestureHandlerRootView>
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
  summaryCard: { marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryNum: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  summaryLabel: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryDivider: { width: 1, height: 40, backgroundColor: Colors.separator },
  progressBar: { height: 4, backgroundColor: Colors.cardElevated, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 2 },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.gold },
  filterText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.gold, fontWeight: '600' },
  sectionLabel: {
    fontSize: Typography.fontSize.xs, fontWeight: '600',
    color: Colors.textSecondary, textTransform: 'uppercase',
    letterSpacing: 0.8, paddingVertical: Spacing.sm,
  },
  taskWrapper: { backgroundColor: Colors.card, borderRadius: Radii.sm, overflow: 'hidden', marginVertical: 1 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  emptySubtitle: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.gold, borderRadius: Radii.pill, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, marginTop: Spacing.sm },
  emptyBtnText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: '#000' },
});
