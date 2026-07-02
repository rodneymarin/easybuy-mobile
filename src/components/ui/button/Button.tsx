import { type ReactNode } from 'react';
import { Pressable, type PressableProps, StyleSheet } from 'react-native';

interface ButtonProps extends PressableProps {
  children: ReactNode;
}

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <Pressable style={styles.button} {...props}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    gap: 4,
  },
});
