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

const HABIT_ICONS = ['⚡', '💪', '📚', '🧘', '💧', '🏃', '🎯', '✍️', '🌿', '💊'];
const HABIT_COLORS = [
  Colors.gold, Colors.blue, Colors.green,
  Colors.red, Colors.purple, '#FF9F0A', '#5AC8FA',
];

interface AddHabitSheetProps {
  onClose: () => void;
}

export const AddHabitSheet = forwardRef<BottomSheet, AddHabitSheetProps>(
  ({ onClose }, ref) => {
    const { addHabit } = useNKStore();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('⚡');
    const [color, setColor] = useState<string>(Colors.gold);
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
      if (!name.trim()) return;
      setLoading(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await addHabit(name.trim(), icon, color);
      setLoading(false);
      setName('');
      setIcon('⚡');
      setColor(Colors.gold);
      onClose();
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={['55%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        onClose={onClose}
      >
        <BottomSheetView style={styles.container}>
          <Text style={styles.title}>New Habit</Text>

          {/* Preview */}
          <View style={[styles.preview, { borderColor: color }]}>
            <Text style={styles.previewIcon}>{icon}</Text>
            <Text style={styles.previewName}>{name || 'Habit Name'}</Text>
          </View>

          {/* Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Name your habit..."
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          {/* Icon picker */}
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconRow}>
            {HABIT_ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                onPress={() => {
                  Haptics.selectionAsync();
                  setIcon(ic);
                }}
                style={[styles.iconBtn, icon === ic && { borderColor: color, borderWidth: 2 }]}
              >
                <Text style={styles.iconEmoji}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Color picker */}
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {HABIT_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  Haptics.selectionAsync();
                  setColor(c);
                }}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  color === c && styles.colorDotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !name.trim()}
            style={[styles.submitBtn, { opacity: loading || !name.trim() ? 0.5 : 1, backgroundColor: color }]}
          >
            <Text style={styles.submitText}>
              {loading ? 'Creating...' : 'Create Habit'}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AddHabitSheet.displayName = 'AddHabitSheet';

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
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewIcon: {
    fontSize: 28,
  },
  previewName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radii.sm,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconEmoji: {
    fontSize: 22,
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorDotActive: {
    transform: [{ scale: 1.3 }],
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  submitBtn: {
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
