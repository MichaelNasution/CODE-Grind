import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowRight, Plus } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNKStore } from '../store/useNKStore';
import { Header } from '../components/ui/Header';
import { FinanceWidget } from '../components/modules/FinanceWidget';
import { HabitGrid } from '../components/modules/HabitGrid';
import { TaskItem } from '../components/modules/TaskItem';
import { Card, CardTitle } from '../components/ui/Card';
import { AddTransactionSheet } from '../components/sheets/AddTransactionSheet';
import { Colors, Typography, Spacing, Radii, Animation } from '../constants/theme';

function SectionHeader({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={styles.sectionHeader}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <ArrowRight size={16} color={Colors.gold} strokeWidth={2} />
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { taskList, isLoading } = useNKStore();
  const txSheetRef = useRef<BottomSheet>(null);

  const today = new Date().toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const pendingTasks = taskList.filter((t) => !t.isCompleted).slice(0, 3);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>NK</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="NK" subtitle={today} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Finance Widget */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...Animation.spring, delay: 50 }}
        >
          <SectionHeader title="Finance" onPress={() => router.push('/finance')} />
          <FinanceWidget />
        </MotiView>

        {/* Quick Add FAB */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...Animation.spring, delay: 100 }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              txSheetRef.current?.expand();
            }}
            style={styles.fab}
          >
            <Plus size={18} color="#000" strokeWidth={2.5} />
            <Text style={styles.fabText}>Log Transaction</Text>
          </TouchableOpacity>
        </MotiView>

        {/* Habits Widget */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...Animation.spring, delay: 150 }}
        >
          <SectionHeader title="Habits" onPress={() => router.push('/habits')} />
          <HabitGrid />
        </MotiView>

        {/* Tasks Widget */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...Animation.spring, delay: 200 }}
        >
          <SectionHeader title="Tasks" onPress={() => router.push('/tasks')} />
          <Card noPadding>
            {pendingTasks.length === 0 ? (
              <Text style={styles.noTasks}>All tasks done! 🎉</Text>
            ) : (
              pendingTasks.map((task, i) => (
                <View key={task.id}>
                  <TaskItem task={task} />
                  {i < pendingTasks.length - 1 && (
                    <View style={styles.taskSep} />
                  )}
                </View>
              ))
            )}
          </Card>
          {taskList.length > 3 && (
            <TouchableOpacity
              onPress={() => router.push('/tasks')}
              style={styles.showMore}
            >
              <Text style={styles.showMoreText}>
                +{taskList.filter((t) => !t.isCompleted).length - 3} more tasks →
              </Text>
            </TouchableOpacity>
          )}
        </MotiView>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <AddTransactionSheet
        ref={txSheetRef}
        onClose={() => txSheetRef.current?.close()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.gold,
    letterSpacing: -2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 120,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    gap: 6,
    alignSelf: 'flex-start',
  },
  fabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#000',
  },
  noTasks: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
    padding: Spacing.xl,
  },
  taskSep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
    marginLeft: Spacing.base + 28 + Spacing.md,
  },
  showMore: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  showMoreText: {
    color: Colors.gold,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  bottomPadding: {
    height: 100,
  },
});
