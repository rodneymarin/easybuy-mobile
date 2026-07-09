import { type ReactNode, useRef } from 'react';
import { Animated, type GestureResponderEvent, Pressable, type PressableProps, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { darkenColor, useTheme } from '@lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';
type ButtonSize = 'default' | 'icon';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({ children, onPressIn, onPressOut, style, variant = 'primary', size = 'default', disabled, ...props }: ButtonProps) {
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
    <AnimatedPressable onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled} {...props} style={[styles.button, size === 'icon' && styles.icon, { backgroundColor, borderColor, borderWidth, opacity: disabled ? 0.35 : 1 }, style]}>
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 4,
  },
  icon: {
    width: 40,
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
});
