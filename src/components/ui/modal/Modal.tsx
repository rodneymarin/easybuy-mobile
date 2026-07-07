import { Modal as RNModal, Pressable, StyleSheet, View, type ReactNode, type StyleProp, type ViewStyle } from 'react-native';
import { FadeIn } from '@components/ui/fade-in';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
}

export default function Modal({ isOpen, onClose, children, cardStyle, backdropStyle }: ModalProps) {
  return (
    <RNModal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <FadeIn style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.card, cardStyle]}>
          {children}
        </View>
      </FadeIn>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  card: {
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
});
