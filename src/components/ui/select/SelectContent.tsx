import { Modal as RNModal, Pressable, StyleSheet, Text, View, type ReactNode, type StyleProp, type ViewStyle } from 'react-native';
import { FadeIn } from '@components/ui/fade-in';
import { useTheme } from '@lib/theme';
import { useSelectContext } from './Select';

interface SelectContentProps {
  children: ReactNode;
  title?: string;
  cardStyle?: StyleProp<ViewStyle>;
}

export default function SelectContent({ children, title, cardStyle }: SelectContentProps) {
  const { colors } = useTheme();
  const { isOpen, close } = useSelectContext();

  return (
    <RNModal visible={isOpen} transparent animationType="none" onRequestClose={close}>
      <FadeIn style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={[styles.card, { backgroundColor: colors.cardBackground }, cardStyle]}>
          {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
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
    paddingHorizontal: 32,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    maxHeight: 350,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
});
