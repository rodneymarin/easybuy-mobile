import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [isOpen]);

  function handleBackdropPress() {
    if (isOpen) onClose();
  }

  if (!isRendered) return null;

  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = percentage ? screenHeight * percentage : undefined;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { backgroundColor: colors.cardBackground, transform: [{ translateY }] }, sheetHeight ? { height: sheetHeight } : undefined]}>
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
