import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

interface ActionBarProps {
  children: ReactNode;
}

export default function ActionBar({ children }: ActionBarProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
});
