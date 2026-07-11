import { useEffect, useCallback, useState, useRef, type PropsWithChildren } from 'react';
import { Animated, Dimensions, Easing, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@lib/theme';

interface BottomSheetProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  percentage?: number;
}

export default function BottomSheet({ isOpen, onClose, children, percentage }: BottomSheetProps) {
  const { colors } = useTheme();
  const [isRendered, setIsRendered] = useState(false);
  const translateY = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 300, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: false }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 300, duration: 250, easing: Easing.bezier(0.4, 0, 1, 1), useNativeDriver: false }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [isOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          backdropOpacity.setValue(1 - gestureState.dy / 300);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.parallel([
            Animated.timing(translateY, { toValue: 300, duration: 200, easing: Easing.bezier(0.4, 0, 1, 1), useNativeDriver: false }),
            Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
          ]).start(() => {
            onCloseRef.current();
          });
        } else {
          Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: 250, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: false }),
            Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: false }),
          ]).start();
        }
      },
    })
  ).current;

  if (!isRendered) return null;

  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = percentage ? screenHeight * percentage : undefined;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View {...panResponder.panHandlers} style={[styles.sheet, { transform: [{ translateY }] }, { backgroundColor: colors.cardBackground }, sheetHeight ? { height: sheetHeight } : undefined]}>
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
