import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MotiView } from 'moti';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react-native';
import { useNKStore } from '../../store/useNKStore';
import { Badge } from '../ui/Badge';
import { Colors, Typography, Spacing, Animation } from '../../constants/theme';
import type { Task } from '../../lib/schema';

const categoryColors: Record<Task['category'], { variant: any; label: string }> = {
  personal: { variant: 'blue', label: 'Personal' },
  work: { variant: 'purple', label: 'Work' },
  health: { variant: 'green', label: 'Health' },
  finance: { variant: 'gold', label: 'Finance' },
  other: { variant: 'muted', label: 'Other' },
};

const priorityDot: Record<Task['priority'], string> = {
  high: Colors.red,
  medium: Colors.gold,
  low: Colors.textTertiary,
};

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask } = useNKStore();
  const cat = categoryColors[task.category];

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleTask(task.id);
  };

  const handleDelete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteTask(task.id);
  };

  const renderRightActions = () => (
    <TouchableOpacity onPress={handleDelete} style={styles.deleteAction}>
      <Trash2 size={20} color="#fff" strokeWidth={2} />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <MotiView
        animate={{
          opacity: task.isCompleted ? 0.5 : 1,
        }}
        transition={Animation.timing}
        style={styles.container}
      >
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.7}
          style={styles.checkBtn}
        >
          <MotiView animate={{ scale: task.isCompleted ? 1.1 : 1 }} transition={Animation.springSnappy}>
            {task.isCompleted ? (
              <CheckCircle2 size={22} color={Colors.green} strokeWidth={2} />
            ) : (
              <Circle size={22} color={Colors.textTertiary} strokeWidth={1.5} />
            )}
          </MotiView>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: priorityDot[task.priority] },
              ]}
            />
            <Text
              style={[
                styles.title,
                task.isCompleted && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </View>
          <Badge label={cat.label} variant={cat.variant} style={styles.badge} />
        </View>
      </MotiView>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.card,
    gap: Spacing.md,
  },
  checkBtn: {
    marginTop: 1,
    width: 28,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  deleteAction: {
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  deleteText: {
    color: '#fff',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
});
