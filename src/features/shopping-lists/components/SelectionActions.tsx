import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface SelectionActionsProps {
  selectedCount: number;
  onClose: () => void;
  onMove: () => void;
  onPin: () => void;
  onDelete: () => void;
  isAllPinned: boolean;
  hasAvailableLists: boolean;
  isLoading?: boolean;
}

export default function SelectionActions({ selectedCount, onClose, onMove, onPin, onDelete, isAllPinned, hasAvailableLists, isLoading }: SelectionActionsProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Pressable onPress={onClose} hitSlop={8} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.count, { color: colors.text }]}>{selectedCount} {t('common.selected')}</Text>
      </View>
      <View style={styles.actions}>
        {hasAvailableLists && (
          <Button onPress={onMove} disabled={isLoading}>
            <Text style={[styles.actionText, { color: '#fff' }]}>{t('listDetail.moveSelected')}</Text>
          </Button>
        )}
        <Button onPress={onPin} isLoading={isLoading}>
          <MaterialCommunityIcons name={isAllPinned ? 'pin-off' : 'pin'} size={16} color="#fff" />
          <Text style={[styles.actionText, { color: '#fff' }]}>{t(isAllPinned ? 'listDetail.unpinSelected' : 'listDetail.pinSelected')}</Text>
        </Button>
        <Button variant="destructive" style={styles.deleteButton} onPress={onDelete} disabled={isLoading}>
          <Text style={[styles.actionText, { color: colors.destructiveBorder }]}>{t('listDetail.removeConfirm')} ({selectedCount})</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 10,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  deleteButton: {
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});