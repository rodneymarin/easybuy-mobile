import { type ReactNode, useRef } from 'react';
import { Animated, type GestureResponderEvent, Pressable, type PressableProps } from 'react-native';
import { darkenColor, useTheme } from '@lib/theme';

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
    <AnimatedPressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...props} style={[{ position: 'relative', flexDirection: 'column', borderWidth: 1, borderRadius: 12, padding: 10, marginHorizontal: 16, marginBottom: 12, borderColor: colors.border }, props.style, { backgroundColor }]}>
      {children}
    </AnimatedPressable>
  );
}
