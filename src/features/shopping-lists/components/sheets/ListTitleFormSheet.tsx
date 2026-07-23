import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet, Button, Input } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface ListTitleFormSheetProps {
  isOpen: boolean;
  initialTitle?: string;
  onSave: (title: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ListTitleFormSheet({ isOpen, initialTitle, onSave, onClose, isLoading }: ListTitleFormSheetProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [title, setTitle] = useState(initialTitle ?? '');

  const isFormValid = title.trim().length > 0;

  function handleSave() {
    if (!isFormValid) return;
    onSave(title.trim());
    setTitle('');
  }

  function handleClose() {
    setTitle('');
    onClose();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} percentage={0.75}>
      <Text style={[styles.title, { color: colors.text }]}>{initialTitle !== undefined ? t('listForm.editTitle') : t('listForm.newTitle')}</Text>
      <Input value={title} onChangeText={setTitle} placeholder={t('listForm.placeholder')} autoFocus returnKeyType="done" onSubmitEditing={handleSave} />
      <Button variant="primary" style={styles.saveButton} onPress={handleSave} disabled={!isFormValid} isLoading={isLoading}>
        <Text style={styles.buttonTextPrimary}>{initialTitle !== undefined ? t('common.save') : t('common.create')}</Text>
      </Button>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  saveButton: {
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
