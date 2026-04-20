import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { useNKStore } from '../../store/useNKStore';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Colors, Typography, Spacing, Animation } from '../../constants/theme';
import type { Habit } from '../../lib/schema';

interface HabitRowProps {
  habit: Habit;
}

function HabitRow({ habit }: HabitRowProps) {
  const { toggleHabit, isHabitCompletedToday } = useNKStore();
  const done = isHabitCompletedToday(habit.id);

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleHabit(habit.id);
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.7}
      style={styles.row}
    >
      <MotiView
        animate={{
          scale: done ? 1 : 1,
          opacity: done ? 1 : 0.7,
        }}
        transition={Animation.springSnappy}
        style={styles.iconBox}
      >
        {done ? (
          <CheckCircle2 size={22} color={habit.color} strokeWidth={2} />
        ) : (
          <Circle size={22} color={Colors.textTertiary} strokeWidth={1.5} />
        )}
      </MotiView>

      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            done && { color: Colors.textSecondary, textDecorationLine: 'line-through' },
          ]}
        >
          {habit.name}
        </Text>
      </View>

      <MotiView
        animate={{ scale: done ? 1 : 0.8, opacity: done ? 1 : 0 }}
        transition={Animation.spring}
      >
        <Badge label={`🔥 ${habit.streak}`} variant="gold" />
      </MotiView>
    </TouchableOpacity>
  );
}

export function HabitGrid() {
  const { habitList } = useNKStore();
  const completedToday = habitList.filter(
    (h) => useNKStore.getState().isHabitCompletedToday(h.id)
  ).length;

  return (
    <Card>
      <CardTitle
        subtitle={`${completedToday}/${habitList.length} completed today`}
      >
        Habits
      </CardTitle>

      {habitList.length === 0 ? (
        <Text style={styles.empty}>No habits yet. Add your first one!</Text>
      ) : (
        habitList.map((habit, i) => (
          <View key={habit.id}>
            <HabitRow habit={habit} />
            {i < habitList.length - 1 && (
              <View style={styles.separator} />
            )}
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  iconBox: {
    width: 28,
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  empty: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
    marginLeft: 40,
  },
});
