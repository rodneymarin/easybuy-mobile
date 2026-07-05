import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@lib/theme';

interface ShoppingListItemTitleProps {
  name: string;
  isDone: boolean;
}

function ShoppingListItemTitle({ name, isDone }: ShoppingListItemTitleProps) {
  const { colors } = useTheme();

  return (
    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { color: isDone ? colors.textSecondary : colors.text }, isDone && styles.titleDone]}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 6,
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
});

export default ShoppingListItemTitle;
