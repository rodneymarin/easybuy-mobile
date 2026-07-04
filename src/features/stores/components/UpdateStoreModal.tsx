import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, Button, Input } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { StoreListData } from '@features/stores';

interface UpdateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string) => void;
  onUpdate: (id: string, description: string) => void;
  onDelete: (id: string) => void;
  store?: StoreListData;
}

export default function UpdateStoreModal({ isOpen, onClose, onSave, onUpdate, onDelete, store }: UpdateStoreModalProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [description, setDescription] = useState('');

  const isEditMode = store !== undefined;

  useEffect(() => {
    if (isOpen) {
      setDescription(store?.description ?? '');
    }
  }, [isOpen, store]);

  function handleSave() {
    const trimmed = description.trim();
    if (!trimmed) return;
    if (isEditMode) {
      onUpdate(store.id, trimmed);
    } else {
      onSave(trimmed);
    }
    setDescription('');
  }

  function handleDelete() {
    if (!store) return;
    onDelete(store.id);
    setDescription('');
  }

  function handleClose() {
    setDescription('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Text style={[styles.title, { color: colors.text }]}>{isEditMode ? t('stores.edit') : t('stores.add')}</Text>
      <Input style={styles.input} value={description} onChangeText={setDescription}
        placeholder={t('stores.addModal.placeholder')} autoFocus returnKeyType="done" onSubmitEditing={handleSave}
      />
      <View style={styles.actions}>
        {isEditMode && (
          <Button variant="destructive" style={styles.deleteButton} onPress={handleDelete}>
            <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('stores.delete')}</Text>
          </Button>
        )}
        <Button variant="secondary" style={styles.cancelButton} onPress={handleClose}>
          <Text style={[styles.buttonText, { color: colors.text }]}>{t('stores.addModal.cancel')}</Text>
        </Button>
        <Button variant="primary" style={[styles.saveButton, { opacity: description.trim() ? 1 : 0.5 }]}
          onPress={handleSave} disabled={!description.trim()}
        >
          <Text style={styles.buttonText}>{t('stores.addModal.save')}</Text>
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  destructiveButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
