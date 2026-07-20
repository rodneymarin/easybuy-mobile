import { StyleSheet, Text } from 'react-native';
import { BottomSheet } from '@components/ui/bottom-sheet';
import Button from '@components/ui/button';
import { useTheme } from '@lib/theme';

interface ConfirmDeleteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  warning?: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteSheet({ isOpen, onClose, onConfirm, title, message, warning, confirmLabel, isLoading }: ConfirmDeleteSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {warning && <Text style={[styles.warning, { color: colors.textSecondary }]}>{warning}</Text>}
      <Button variant="destructive" style={styles.button} onPress={onConfirm} isLoading={isLoading}>
        <Text style={[styles.buttonText, { color: colors.destructiveBorder }]}>{confirmLabel}</Text>
      </Button>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  warning: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  button: {
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
