import { type ReactNode } from 'react';
import { Pressable, type PressableProps, StyleSheet } from 'react-native';
import { useTheme } from '@lib/theme';

interface ButtonProps extends PressableProps {
  children: ReactNode;
}

export default function Button({ children, ...props }: ButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable style={[styles.button, { backgroundColor: colors.primary }]} {...props}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    gap: 4,
  },
});
