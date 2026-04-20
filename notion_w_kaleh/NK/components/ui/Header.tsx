import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function Header({ title, subtitle, right, style }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={80}
      tint="dark"
      style={[styles.blurContainer, { paddingTop: insets.top }, style]}
    >
      <View style={styles.inner}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {right && <View style={styles.right}>{right}</View>}
      </View>
      <View style={styles.separator} />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.glass,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: {
    marginLeft: Spacing.md,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
  },
});
