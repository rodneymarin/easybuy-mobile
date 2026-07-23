import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface MoveItemsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  availableLists: { id: string; title: string }[];
  isMoving: boolean;
  onMoveToList: (targetListId: string) => void;
}

function MoveItemsSheet({ isOpen, onClose, availableLists, isMoving, onMoveToList }: MoveItemsSheetProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text }]}>{t('listDetail.moveSelectedTitle')}</Text>
      {availableLists.length === 0 ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{t('listDetail.moveNoLists')}</Text>
      ) : (
        <View style={styles.listContainer}>
          {isMoving ? (
            <ActivityIndicator size="large" color={colors.text} style={styles.loader} />
          ) : (
            availableLists.map((list) => (
              <Pressable key={list.id} style={[styles.listItem, { borderColor: colors.border }]} onPress={() => onMoveToList(list.id)}>
                <Text style={[styles.listItemText, { color: colors.text }]}>{list.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            ))
          )}
        </View>
      )}
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
  listContainer: {
    gap: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 4,
  },
  loader: {
    paddingVertical: 20,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MoveItemsSheet;
