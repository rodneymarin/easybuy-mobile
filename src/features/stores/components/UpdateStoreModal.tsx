import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, ModalTitle, ModalContent, ModalFooter, Button, Input } from '@components/ui';
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
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  const isEditMode = store !== undefined;

  useEffect(() => {
    if (isOpen) {
      setDescription(store?.description ?? '');
      setIsDeleteConfirming(false);
    }
  }, [isOpen, store]);

  function handleSave() {
    const trimmed = description.trim();
    if (!trimmed) return;
    if (store) {
      onUpdate(store.id, trimmed);
    } else {
      onSave(trimmed);
    }
    setDescription('');
  }

  function handleDeletePress() {
    setIsDeleteConfirming(true);
  }

  function handleConfirmDelete() {
    if (!store) return;
    onDelete(store.id);
    setIsDeleteConfirming(false);
  }

  function handleCancelDelete() {
    setIsDeleteConfirming(false);
  }

  function handleClose() {
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {isDeleteConfirming ? (
        <>
          <ModalTitle>{t('stores.deleteModal.title')}</ModalTitle>
          <ModalContent>
            <Text style={[styles.confirmMessage, { color: colors.text }]}>{t('stores.deleteModal.confirmMessage', { store: store?.description ?? '' })}</Text>
            <Text style={[styles.warning, { color: colors.textSecondary }]}>{t('stores.deleteModal.warning')}</Text>
          </ModalContent>
          <ModalFooter>
            <Button variant="secondary" style={styles.cancelButton} onPress={handleCancelDelete}>
              <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>{t('stores.deleteModal.cancel')}</Text>
            </Button>
            <Button variant="destructive" style={styles.deleteButton} onPress={handleConfirmDelete}>
              <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('stores.deleteModal.confirm')}</Text>
            </Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalTitle>{isEditMode ? t('stores.edit') : t('stores.add')}</ModalTitle>
          <ModalContent>
            <Input value={description} onChangeText={setDescription} placeholder={t('stores.addModal.placeholder')} autoFocus returnKeyType="done" onSubmitEditing={handleSave} />
          </ModalContent>
          <ModalFooter>
            {isEditMode && (
              <Button variant="destructive" style={styles.deleteButton} onPress={handleDeletePress}>
                <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('stores.delete')}</Text>
              </Button>
            )}
            <Button variant="secondary" style={styles.cancelButton} onPress={handleClose}>
              <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>{t('stores.addModal.cancel')}</Text>
            </Button>
            <Button variant="primary" style={styles.saveButton} onPress={handleSave} disabled={!description.trim()}>
              <Text style={styles.buttonTextPrimary}>{t('stores.addModal.save')}</Text>
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  confirmMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  warning: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
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
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
  },
  destructiveButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
