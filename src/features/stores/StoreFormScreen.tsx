import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button, ConfirmDeleteSheet, Input, ScreenTitle, useToast } from '@components/ui';
import { createStore, updateStore, deleteStore } from '@lib/repositories/stores';
import { STORE_COLORS, getStoreColor } from '@lib/store-colors';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import { generateUUID } from '@lib/uuid';

export default function StoreFormScreen() {
  const route = useRoute<{ key: string; name: string; params: { store?: { id: string; description: string; color?: number } } }>();
  const navigation = useNavigation();
  const { store } = route.params;
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const toast = useToast();

  const isEditMode = store !== undefined;
  const isFormValid = description.trim().length > 0;

  useEffect(() => {
    setDescription(store?.description ?? '');
    if (store?.color !== undefined) {
      setSelectedColor(store.color);
    }
  }, [store]);

  async function handleSave() {
    if (!isFormValid) return;
    Keyboard.dismiss();
    if (store) {
      await updateStore(store.id, description.trim(), selectedColor);
      toast.show({ message: t('toast.storeUpdated'), type: 'success' });
    } else {
      await createStore(generateUUID(), description.trim(), selectedColor);
      toast.show({ message: t('toast.storeCreated'), type: 'success' });
    }
    navigation.goBack();
  }

  function handleDeletePress() {
    Keyboard.dismiss();
    setIsDeleteSheetOpen(true);
  }

  async function handleConfirmDelete() {
    if (!store) return;
    Keyboard.dismiss();
    await deleteStore(store.id);
    setIsDeleteSheetOpen(false);
    toast.show({ message: t('toast.storeDeleted'), type: 'success' });
    navigation.goBack();
  }

  function handleGoBack() {
    Keyboard.dismiss();
    navigation.goBack();
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

        <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>{t('stores.colorLabel')}</Text>
        <View style={styles.colorRow}>
          {STORE_COLORS.map((entry, index) => (
            <Pressable key={index} style={[styles.colorSwatch, { backgroundColor: getStoreColor(index, isDark) }, selectedColor === index && styles.colorSwatchSelected, selectedColor === index && { borderColor: colors.text }]} onPress={() => setSelectedColor(index)} hitSlop={6} />
          ))}
        </View>
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

      <ConfirmDeleteSheet isOpen={isDeleteSheetOpen} onClose={() => setIsDeleteSheetOpen(false)} onConfirm={handleConfirmDelete} title={t('stores.deleteModal.title')} message={t('stores.deleteModal.confirmMessage', { store: store?.description ?? '' })} warning={t('stores.deleteModal.warning')} confirmLabel={t('stores.deleteModal.confirm')} />
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
  colorLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSwatchSelected: {
    borderWidth: 3,
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
});
