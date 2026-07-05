import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, BottomSheet, ScreenTitle } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface StoreFormScreenProps {
  store?: { id: string; description: string };
  onBack: () => void;
  onSave: (description: string) => void;
  onUpdate: (id: string, description: string) => void;
  onDelete: (id: string) => void;
}

export default function StoreFormScreen({ store, onBack, onSave, onUpdate, onDelete }: StoreFormScreenProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [description, setDescription] = useState('');
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);

  const isEditMode = store !== undefined;
  const isFormValid = description.trim().length > 0;

  useEffect(() => {
    setDescription(store?.description ?? '');
  }, [store]);

  function handleSave() {
    if (!isFormValid) return;
    Keyboard.dismiss();
    if (store) {
      onUpdate(store.id, description.trim());
    } else {
      onSave(description.trim());
    }
  }

  function handleDeletePress() {
    Keyboard.dismiss();
    setIsDeleteSheetOpen(true);
  }

  function handleConfirmDelete() {
    if (!store) return;
    Keyboard.dismiss();
    onDelete(store.id);
    setIsDeleteSheetOpen(false);
  }

  function handleGoBack() {
    Keyboard.dismiss();
    onBack();
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding">
      <View style={styles.headerWrapper}>
        <ScreenTitle>{isEditMode ? t('stores.editTitle') : t('stores.addTitle')}</ScreenTitle>
        <Pressable onPress={handleGoBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Input value={description} onChangeText={setDescription} placeholder={t('stores.addModal.placeholder')} autoFocus returnKeyType="done" onSubmitEditing={handleSave} />
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {isEditMode && (
          <Button variant="destructive" style={styles.actionButton} onPress={handleDeletePress}>
            <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('stores.delete')}</Text>
          </Button>
        )}
        <Button variant="secondary" style={styles.actionButton} onPress={handleGoBack}>
          <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>{t('stores.addModal.cancel')}</Text>
        </Button>
        <Button variant="primary" style={styles.actionButton} onPress={handleSave} disabled={!isFormValid}>
          <Text style={styles.buttonTextPrimary}>{t('stores.addModal.save')}</Text>
        </Button>
      </View>

      <BottomSheet isOpen={isDeleteSheetOpen} onClose={() => setIsDeleteSheetOpen(false)}>
        <Text style={[styles.deleteSheetTitle, { color: colors.text }]}>{t('stores.deleteModal.title')}</Text>
        <Text style={[styles.deleteSheetMessage, { color: colors.text }]}>{t('stores.deleteModal.confirmMessage', { store: store?.description ?? '' })}</Text>
        <Text style={[styles.deleteSheetWarning, { color: colors.textSecondary }]}>{t('stores.deleteModal.warning')}</Text>
        <Button variant="destructive" style={styles.deleteSheetButton} onPress={handleConfirmDelete}>
          <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('stores.deleteModal.confirm')}</Text>
        </Button>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  headerWrapper: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: -6,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  footer: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
  },
  actionButton: {
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
  deleteSheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteSheetMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteSheetWarning: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  deleteSheetButton: {
    justifyContent: 'center',
  },
});
