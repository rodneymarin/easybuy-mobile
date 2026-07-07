import { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function FadeIn({ children, style }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }).start();
  }, [opacity]);

  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
}
