import React, { PropsWithChildren } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import theme from '@theme';

type Props = PropsWithChildren<{ title: string; right?: React.ReactNode }>;

export default function Section({ title, right, children }: Props) {
  return (
    <View style={{ marginBottom: theme.spacing(3) }}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {right}
      </View>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700'
  }
});










