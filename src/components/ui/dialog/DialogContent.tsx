import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View, type ReactNode, type StyleProp, type ViewStyle } from 'react-native';
import { FadeIn } from '@components/ui/fade-in';
import { useTheme } from '@lib/theme';
import { useDialogContext } from './Dialog';

const MAX_CARD_HEIGHT = 350;

interface DialogContentProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function DialogContent({ children, style }: DialogContentProps) {
  const { colors } = useTheme();
  const { onClose } = useDialogContext();
  const [isContentTall, setIsContentTall] = useState(false);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    if (e.nativeEvent.layout.height >= MAX_CARD_HEIGHT) {
      setIsContentTall(true);
    }
  }, []);

  return (
    <FadeIn style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View onLayout={handleLayout} style={[styles.card, { backgroundColor: colors.cardBackground }, style, isContentTall && { height: MAX_CARD_HEIGHT }]}>
        {children}
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 32,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    maxHeight: 350,
    overflow: 'hidden',
  },
});
