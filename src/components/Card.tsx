import React, { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '@theme';

type Props = PropsWithChildren<{
  padding?: number;
  shadow?: 'sm' | 'md' | 'lg';
}>;

export default function Card({ children, padding = theme.spacing(2), shadow = 'md' }: Props) {
  return <View style={[styles.card, { padding }, theme.shadows[shadow]]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border
  }
});


