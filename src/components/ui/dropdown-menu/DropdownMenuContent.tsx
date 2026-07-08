import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal as RNModal, Pressable, StyleSheet, type ReactNode, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@lib/theme';
import { useDropdownMenuContext } from './DropdownMenu';

interface DropdownMenuContentProps {
  children: ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
}

export default function DropdownMenuContent({ children, cardStyle }: DropdownMenuContentProps) {
  const { colors } = useTheme();
  const { isOpen, close, triggerRef } = useDropdownMenuContext();
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0, minWidth: 0 });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOpen) return;

    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 100, useNativeDriver: true }),
    ]).start();

    return () => {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0);
    };
  }, [isOpen, opacityAnim, scaleAnim]);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    triggerRef.current.measureInWindow((x, y, width, height) => {
      const { height: screenHeight } = Dimensions.get('window');
      const menuHeight = 200;
      const gap = 4;
      let top: number;

      if (y + height + gap + menuHeight < screenHeight) {
        top = y + height + gap;
      } else {
        top = Math.max(gap, y - menuHeight - gap);
      }

      setMenuPosition({ top, right: Dimensions.get('window').width - x - width, minWidth: width });
    });
  }, [isOpen, triggerRef]);

  return (
    <RNModal visible={isOpen} transparent animationType="none" onRequestClose={close}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close}>
        <Animated.View style={[styles.menu, { top: menuPosition.top, right: menuPosition.right, minWidth: menuPosition.minWidth, backgroundColor: colors.cardBackground, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }, cardStyle]}>
          {children}
        </Animated.View>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    borderRadius: 14,
    paddingVertical: 4,
    overflow: 'hidden',
    transformOrigin: 'top right',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
