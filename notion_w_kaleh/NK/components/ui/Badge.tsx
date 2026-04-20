import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';

type BadgeVariant = 'gold' | 'blue' | 'green' | 'red' | 'purple' | 'muted';

interface BadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  gold: { bg: Colors.goldMuted, text: Colors.gold },
  blue: { bg: 'rgba(10,132,255,0.15)', text: Colors.blue },
  green: { bg: 'rgba(48,209,88,0.15)', text: Colors.green },
  red: { bg: 'rgba(255,69,58,0.15)', text: Colors.red },
  purple: { bg: 'rgba(191,90,242,0.15)', text: Colors.purple },
  muted: { bg: Colors.cardElevated, text: Colors.textSecondary },
};

export function Badge({ label, variant = 'gold', style }: BadgeProps) {
  const { bg, text } = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.3,
  },
});
