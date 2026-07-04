import { type PropsWithChildren } from 'react';
import { StyleSheet, Text } from 'react-native';

interface ScreenTitleProps extends PropsWithChildren {}

export default function ScreenTitle({ children }: ScreenTitleProps) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
});
