import { useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastViewProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  onDismiss: () => void;
}

const TOAST_COLORS: Record<ToastViewProps['type'], { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: '#4CAF50', text: '#fff', icon: 'checkmark-circle' },
  error: { bg: '#F44336', text: '#fff', icon: 'alert-circle' },
  info: { bg: '#2196F3', text: '#fff', icon: 'information-circle' },
  warning: { bg: '#FF9800', text: '#fff', icon: 'warning' },
};

const SWIPE_THRESHOLD = 60;

export default function ToastView({ message, type, duration, onDismiss }: ToastViewProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDismissingRef = useRef(false);

  const colors = TOAST_COLORS[type];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
          opacity.setValue(1 + gestureState.dy / 120);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -SWIPE_THRESHOLD) {
          dismiss();
        } else {
          Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  function dismiss() {
    if (isDismissingRef.current) return;
    isDismissingRef.current = true;
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      onDismiss();
    });
  }

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 200 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    dismissTimerRef.current = setTimeout(() => {
      dismiss();
    }, duration);

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Animated.View style={[styles.toast, { backgroundColor: colors.bg, transform: [{ translateY }], opacity }]} {...panResponder.panHandlers}>
        <Ionicons name={colors.icon} size={20} color={colors.text} style={styles.icon} />
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: '100%',
  },
  icon: {
    marginRight: 10,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
});
