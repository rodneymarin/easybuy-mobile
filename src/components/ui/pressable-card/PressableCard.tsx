import { type ReactNode, useRef } from 'react';
import { Animated, type GestureResponderEvent, Pressable, type PressableProps } from 'react-native';
import { useTheme } from '@lib/theme';

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

interface PressableCardProps extends PressableProps {
  children: ReactNode;
  bgColor?: string;
}

export default function PressableCard({ children, onPressIn, onPressOut, bgColor, ...props }: PressableCardProps) {
  const { colors } = useTheme();
  const darkAnim = useRef(new Animated.Value(0)).current;
  const baseColor = bgColor ?? colors.cardBackground;

  const backgroundColor = darkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseColor, darkenColor(baseColor, 0.1)],
  });

  function handlePressIn(event: GestureResponderEvent) {
    Animated.timing(darkAnim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    Animated.timing(darkAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    onPressOut?.(event);
  }

  return (
    <AnimatedPressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...props} style={[props.style as object, { backgroundColor }]}>
      {children}
    </AnimatedPressable>
  );
}
