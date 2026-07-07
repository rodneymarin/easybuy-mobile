import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button, Input, BottomSheet, ScreenTitle } from '@components/ui';
import { createStore, updateStore, deleteStore } from '@lib/repositories/stores';
import { STORE_COLORS, getStoreColor } from '@lib/store-colors';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

function generateUUID(): string {
  let d = new Date().getTime();
  let d2 = 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function StoreFormScreen() {
  const route = useRoute<{ key: string; name: string; params: { store?: { id: string; description: string; color?: number } } }>();
  const navigation = useNavigation();
  const { store } = route.params;
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);

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
    } else {
      await createStore(generateUUID(), description.trim(), selectedColor);
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
    marginBottom: 20,
    lineHeight: 18,
  },
  deleteSheetButton: {
    justifyContent: 'center',
  },
});
