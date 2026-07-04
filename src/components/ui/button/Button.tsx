import { type ReactNode, useRef } from 'react';
import { Animated, type GestureResponderEvent, Pressable, type PressableProps, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}

function darkenColor(hex: string, amount: number): string {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((c) => c + c).join('');
  }
  const num = parseInt(normalized, 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({ children, onPressIn, onPressOut, style, variant = 'primary', disabled, ...props }: ButtonProps) {
  const { colors } = useTheme();
  const darkAnim = useRef(new Animated.Value(0)).current;

  const bgColor = variant === 'primary' ? colors.primary
    : variant === 'secondary' ? colors.surface
    : colors.destructive;

  const borderColor = variant === 'primary' ? 'transparent'
    : variant === 'secondary' ? colors.border
    : colors.destructiveBorder;

  const borderWidth = 0;

  const backgroundColor = darkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [bgColor, darkenColor(bgColor, 0.15)],
  });

  function handlePressIn(event: GestureResponderEvent) {
    if (disabled) return;
    Animated.timing(darkAnim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    if (disabled) return;
    Animated.timing(darkAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    onPressOut?.(event);
  }

  return (
    <AnimatedPressable onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled} {...props} style={[styles.button, { backgroundColor, borderColor, borderWidth, opacity: disabled ? 0.35 : 1 }, style]}>
      {children}
    </AnimatedPressable>
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
