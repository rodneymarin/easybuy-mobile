import { type ReactNode } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';
import { useTheme } from '@lib/theme';

interface ModalTitleProps {
  children: ReactNode;
  style?: TextStyle;
}

export default function ModalTitle({ children, style }: ModalTitleProps) {
  const { colors } = useTheme();
  return <Text style={[styles.title, { color: colors.text }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
});
