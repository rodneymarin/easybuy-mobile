import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableCard, Tag } from '@components/ui';
import { useTheme } from '@lib/theme';

interface ShoppingListItemCardProps {
  productName: string;
  quantity: number;
  unitLabel: string;
  totalPrice: number;
  storeDescription?: string;
  isDone: boolean;
  isFilteredByStore: boolean;
  onToggleDone: () => void;
  onRemove: () => void;
  onEditPress: () => void;
}

export default function ShoppingListItemCard({
  productName,
  quantity,
  unitLabel,
  totalPrice,
  storeDescription,
  isDone,
  isFilteredByStore,
  onToggleDone,
  onRemove,
  onEditPress,
}: ShoppingListItemCardProps) {
  const { colors } = useTheme();

  return (
    <PressableCard onPress={onEditPress} style={[styles.card, { borderColor: colors.border }]}>
      <Pressable onPress={onToggleDone} style={styles.checkCircle} hitSlop={6}>
        {isDone ? (
          <View style={[styles.circleFilled, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        ) : (
          <View style={[styles.circleEmpty, { borderColor: colors.textSecondary }]} />
        )}
      </Pressable>
      <View style={styles.content}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { color: isDone ? colors.textSecondary : colors.text }, isDone && styles.titleDone]}>
          {productName}
        </Text>
        <View style={styles.tags}>
          {!isFilteredByStore && storeDescription ? (
            <Tag size="sm" label={storeDescription} />
          ) : null}
          <Tag size="sm" label={`${quantity} ${unitLabel}`} />
          {totalPrice > 0 ? (
            <Tag size="sm" label={`$${totalPrice.toFixed(2)}`} />
          ) : null}
        </View>
      </View>
      <Pressable onPress={onRemove} style={styles.removeButton} hitSlop={8}>
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </Pressable>
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
  checkCircle: {
    marginRight: 10,
  },
  circleEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  circleFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 6,
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
