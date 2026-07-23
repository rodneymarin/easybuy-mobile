import { StyleSheet, Text } from 'react-native';
import { BottomSheet, Button } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface DeleteSelectedSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isLoading: boolean;
}

function DeleteSelectedSheet({ isOpen, onClose, onConfirm, selectedCount, isLoading }: DeleteSelectedSheetProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text }]}>{t('listDetail.confirmDeleteSelected')}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{t('listDetail.confirmDeleteSelectedMessage', { count: selectedCount })}</Text>
      <Button variant="destructive" style={styles.button} onPress={onConfirm} isLoading={isLoading}>
        <Text style={[styles.buttonText, { color: colors.destructiveBorder }]}>{t('listDetail.removeConfirm')}</Text>
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
    marginBottom: 24,
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

export default DeleteSelectedSheet;
