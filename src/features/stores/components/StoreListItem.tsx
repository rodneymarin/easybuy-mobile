import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableCard } from '@components/ui/pressable-card';
import { useTheme } from '@lib/theme';
import { getStoreColor } from '@lib/store-colors';

interface StoreListItemProps {
  id: string;
  description: string;
  color: number;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export default function StoreListItem({ id, description, color, isSelected, isSelectionMode, onPress, onLongPress }: StoreListItemProps) {
  const { colors, isDark } = useTheme();
  const resolvedColor = getStoreColor(color, isDark);

  return (
    <PressableCard style={[styles.card, { borderColor: colors.border, borderRightColor: resolvedColor, borderRightWidth: 6 }]} onPress={() => onPress(id)} onLongPress={onLongPress ? () => onLongPress(id) : undefined}>
      <View style={styles.cardContent}>
        {isSelectionMode && (
          <>
            {isSelected ? (
              <View style={[styles.circleFilled, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            ) : (
              <View style={[styles.circleEmpty, { borderColor: colors.textSecondary }]} />
            )}
          </>
        )}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">{description}</Text>
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
  },
  circleEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 2,
  },
  circleFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
});
