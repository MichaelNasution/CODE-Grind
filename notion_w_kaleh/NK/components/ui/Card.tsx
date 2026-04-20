import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radii, Spacing, Shadow } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  glow?: boolean;
}

export function Card({ children, style, noPadding, glow }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        noPadding && styles.noPadding,
        glow && styles.glow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardTitleProps {
  children: string;
  subtitle?: string;
  style?: TextStyle;
}

export function CardTitle({ children, subtitle, style }: CardTitleProps) {
  return (
    <View style={styles.titleBlock}>
      <Text style={[styles.title, style]}>{children}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  noPadding: {
    padding: 0,
    overflow: 'hidden',
  },
  glow: {
    ...Shadow.glow,
    borderColor: Colors.goldMuted,
  },
  titleBlock: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
