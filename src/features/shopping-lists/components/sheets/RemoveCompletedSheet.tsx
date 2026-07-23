import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet, Button } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface RemoveCompletedSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function RemoveCompletedSheet({ isOpen, onClose, onConfirm, isLoading }: RemoveCompletedSheetProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text }]}>{t('listDetail.removeCompleted')}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{t('listDetail.removeCompletedConfirmMessage')}</Text>
      <View style={styles.actions}>
        <Button variant="destructive" style={styles.button} onPress={onConfirm} isLoading={isLoading}>
          <Text style={[styles.buttonText, { color: colors.destructiveBorder }]}>{t('listDetail.removeConfirm')}</Text>
        </Button>
        <Button variant="secondary" style={styles.button} onPress={onClose} disabled={isLoading}>
          <Text style={[styles.buttonText, { color: colors.text }]}>{t('products.addModal.cancel')}</Text>
        </Button>
      </View>
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
    marginBottom: 24,
  },
  actions: {
    gap: 8,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RemoveCompletedSheet;
