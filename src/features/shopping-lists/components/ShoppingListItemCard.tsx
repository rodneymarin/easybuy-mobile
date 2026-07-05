import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { PressableCard } from '@components/ui';
import { useTheme } from '@lib/theme';

interface ShoppingListItemCardProps {
  children: ReactNode;
  onEditPress: () => void;
}

function ShoppingListItemCard({ children, onEditPress }: ShoppingListItemCardProps) {
  const { colors } = useTheme();

  return (
    <PressableCard onPress={onEditPress} style={[styles.card, { borderColor: colors.border }]}>
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
});

export default ShoppingListItemCard;
