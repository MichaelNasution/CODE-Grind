import React, { forwardRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useNKStore } from '../../store/useNKStore';
import { Colors, Typography, Spacing, Radii } from '../../constants/theme';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];

interface AddTransactionSheetProps {
  onClose: () => void;
}

export const AddTransactionSheet = forwardRef<BottomSheet, AddTransactionSheetProps>(
  ({ onClose }, ref) => {
    const { addTransaction } = useNKStore();
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const snapPoints = ['60%', '85%'];

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
      const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''));
      if (!parsed || isNaN(parsed)) return;

      setLoading(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await addTransaction(type, parsed, category, note);
      setLoading(false);
      setAmount('');
      setNote('');
      setCategory('Other');
      onClose();
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        onClose={onClose}
      >
        <BottomSheetView style={styles.container}>
          <Text style={styles.title}>Add Transaction</Text>

          {/* Type Toggle */}
          <View style={styles.toggle}>
            {(['income', 'expense'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  Haptics.selectionAsync();
                  setType(t);
                }}
                style={[
                  styles.toggleBtn,
                  type === t && {
                    backgroundColor:
                      t === 'income' ? Colors.green : Colors.red,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleLabel,
                    type === t && styles.toggleLabelActive,
                  ]}
                >
                  {t === 'income' ? '↑ Income' : '↓ Expense'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCategory(c);
                }}
                style={[
                  styles.chip,
                  category === c && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === c && styles.chipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note */}
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note..."
            placeholderTextColor={Colors.textTertiary}
            value={note}
            onChangeText={setNote}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !amount}
            style={[styles.submitBtn, { opacity: loading || !amount ? 0.5 : 1 }]}
          >
            <Text style={styles.submitText}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AddTransactionSheet.displayName = 'AddTransactionSheet';

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
    marginBottom: Spacing.sm,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardElevated,
    borderRadius: Radii.sm,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm - 2,
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  toggleLabelActive: {
    color: Colors.textPrimary,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
    letterSpacing: -2,
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
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  chipTextActive: {
    color: Colors.gold,
    fontWeight: Typography.fontWeight.semibold,
  },
  noteInput: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radii.sm,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    borderWidth: 1,
    borderColor: Colors.border,
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
    letterSpacing: 0.3,
  },
});
