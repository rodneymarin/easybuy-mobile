import { useEffect, useCallback, useState, type PropsWithChildren } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, Extrapolation, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@lib/theme';

const EASE_OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN_EXPO = Easing.bezier(0.4, 0, 1, 1);

interface BottomSheetProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  percentage?: number;
}

export default function BottomSheet({ isOpen, onClose, children, percentage }: BottomSheetProps) {
  const { colors } = useTheme();
  const [isRendered, setIsRendered] = useState(false);
  const translateY = useSharedValue(300);
  const backdropOpacity = useSharedValue(0);

  const onCloseJS = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      translateY.value = withTiming(0, { duration: 300, easing: EASE_OUT_EXPO });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(300, { duration: 250, easing: EASE_IN_EXPO }, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOpen]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = interpolate(event.translationY, [0, 300], [1, 0], Extrapolation.CLAMP);
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(300, { duration: 200, easing: EASE_IN_EXPO });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onCloseJS)();
      } else {
        translateY.value = withTiming(0, { duration: 250, easing: EASE_OUT_EXPO });
        backdropOpacity.value = withTiming(1, { duration: 250 });
      }
    });

  if (!isRendered) return null;

  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = percentage ? screenHeight * percentage : undefined;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle, { backgroundColor: colors.cardBackground }, sheetHeight ? { height: sheetHeight } : undefined]}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
          {percentage ? (
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.scroll}>
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  scroll: {
    flex: 1,
  },
});
