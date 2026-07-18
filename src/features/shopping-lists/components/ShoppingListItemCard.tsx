import { type ReactNode } from 'react';
import { PressableCard } from '@components/ui';

interface ShoppingListItemCardProps {
  children: ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
}

function ShoppingListItemCard({ children, onPress, onLongPress }: ShoppingListItemCardProps) {
  return (
    <PressableCard onPress={onPress} onLongPress={onLongPress}>
      {children}
    </PressableCard>
  );
}

export default ShoppingListItemCard;
