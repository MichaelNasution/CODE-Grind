import React, { forwardRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useNKStore } from '../../store/useNKStore';
import { Colors, Typography, Spacing, Radii } from '../../constants/theme';
import type { Task } from '../../lib/schema';

type Category = Task['category'];
type Priority = Task['priority'];

const CATEGORIES: { key: Category; label: string; color: string }[] = [
  { key: 'personal', label: 'Personal', color: Colors.blue },
  { key: 'work', label: 'Work', color: Colors.purple },
  { key: 'health', label: 'Health', color: Colors.green },
  { key: 'finance', label: 'Finance', color: Colors.gold },
  { key: 'other', label: 'Other', color: Colors.textSecondary },
];

const PRIORITIES: { key: Priority; label: string; color: string }[] = [
  { key: 'high', label: '🔴 High', color: Colors.red },
  { key: 'medium', label: '🟡 Medium', color: Colors.gold },
  { key: 'low', label: '⚪ Low', color: Colors.textSecondary },
];

interface AddTaskSheetProps {
  onClose: () => void;
}

export const AddTaskSheet = forwardRef<BottomSheet, AddTaskSheetProps>(
  ({ onClose }, ref) => {
    const { addTask } = useNKStore();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category>('personal');
    const [priority, setPriority] = useState<Priority>('medium');
    const [loading, setLoading] = useState(false);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
        />
      ),
      []
    );

    const handleSubmit = async () => {
      if (!title.trim()) return;
      setLoading(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await addTask(title.trim(), category, priority);
      setLoading(false);
      setTitle('');
      setCategory('personal');
      setPriority('medium');
      onClose();
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={['60%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        onClose={onClose}
      >
        <BottomSheetView style={styles.container}>
          <Text style={styles.title}>New Task</Text>

          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            multiline
            autoFocus
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.key}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCategory(c.key);
                }}
                style={[
                  styles.chip,
                  category === c.key && {
                    backgroundColor: `${c.color}22`,
                    borderColor: c.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === c.key && { color: c.color, fontWeight: '600' },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.chips}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.key}
                onPress={() => {
                  Haptics.selectionAsync();
                  setPriority(p.key);
                }}
                style={[
                  styles.chip,
                  priority === p.key && {
                    backgroundColor: `${p.color}22`,
                    borderColor: p.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    priority === p.key && { color: p.color, fontWeight: '600' },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !title.trim()}
            style={[styles.submitBtn, { opacity: loading || !title.trim() ? 0.5 : 1 }]}
          >
            <Text style={styles.submitText}>
              {loading ? 'Adding...' : 'Add Task'}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AddTaskSheet.displayName = 'AddTaskSheet';

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
  },
  handle: {
    backgroundColor: Colors.separator,
    width: 36,
  },
  container: {
    flex: 1,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radii.sm,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radii.md,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#000',
  },
});
