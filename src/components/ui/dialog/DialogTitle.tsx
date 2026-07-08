import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '@lib/theme';

interface DialogTitleProps extends TextProps {
  children: string;
}

export default function DialogTitle({ children, style, ...props }: DialogTitleProps) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.title, { color: colors.text }, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
});
