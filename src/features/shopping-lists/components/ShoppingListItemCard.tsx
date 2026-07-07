import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableCard } from '@components/ui';
import { useTheme } from '@lib/theme';

interface ShoppingListItemCardProps {
  children: ReactNode;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

function ShoppingListItemCard({ children, isSelected, isSelectionMode, onPress, onLongPress }: ShoppingListItemCardProps) {
  const { colors } = useTheme();

  return (
    <PressableCard onPress={onPress} onLongPress={onLongPress} style={[styles.card, { borderColor: colors.border }]}>
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
      {children}
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  circleEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
  },
  circleFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});

export default ShoppingListItemCard;
