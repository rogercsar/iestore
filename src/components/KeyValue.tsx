import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@theme';

type Props = { label: string; value: string };

export default function KeyValue({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1)
  },
  label: {
    color: theme.colors.muted
  },
  value: {
    color: theme.colors.text,
    fontWeight: '600'
  }
});










