import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@lib/theme';

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const { colors } = useTheme();
  const [isRendered, setIsRendered] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [isOpen]);

  const handleBackdropPress = useCallback(() => {
    if (isOpen) onClose();
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
      </Animated.View>
      <KeyboardAvoidingView style={styles.contentContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[styles.content, { backgroundColor: colors.cardBackground, transform: [{ scale }] }]}>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: 32,
  },
  content: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
