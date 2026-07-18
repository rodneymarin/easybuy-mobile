import { StyleSheet } from 'react-native';
import { CardTitle } from '@components/ui';
import { useTheme } from '@lib/theme';

interface ShoppingListItemTitleProps {
  name: string;
  isDone: boolean;
}

function ShoppingListItemTitle({ name, isDone }: ShoppingListItemTitleProps) {
  const { colors } = useTheme();

  return (
    <CardTitle style={[isDone && { color: colors.placeholderText }, isDone && styles.titleDone, { marginBottom: 6 }]}>
      {name}
    </CardTitle>
  );
}

const styles = StyleSheet.create({
  titleDone: {
    textDecorationLine: 'line-through',
  },
});

export default ShoppingListItemTitle;
