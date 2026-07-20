import { type ReactNode, useRef } from 'react';
import { Animated, type GestureResponderEvent, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { darkenColor, useTheme } from '@lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableCardProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  bgColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function PressableCard({ children, onPressIn, onPressOut, bgColor, style: styleProp, ...otherProps }: PressableCardProps) {
  const { colors } = useTheme();
  const darkAnim = useRef(new Animated.Value(0)).current;
  const baseColor = bgColor ?? colors.surface;

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
    <AnimatedPressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...otherProps} style={[{ position: 'relative', flexDirection: 'column', padding: 12, paddingHorizontal: 21, marginBottom: 4 }, styleProp, { backgroundColor }]}>
      {children}
    </AnimatedPressable>
  );
}
