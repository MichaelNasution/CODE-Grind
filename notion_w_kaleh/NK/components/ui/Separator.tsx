import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/theme';

interface SeparatorProps {
  style?: ViewStyle;
  inset?: number;
}

export function Separator({ style, inset = 0 }: SeparatorProps) {
  return (
    <View
      style={[
        styles.separator,
        { marginLeft: inset },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
  },
});
