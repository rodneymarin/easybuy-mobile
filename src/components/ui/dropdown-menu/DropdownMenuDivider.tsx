import { StyleSheet, View } from 'react-native';
import { useTheme } from '@lib/theme';

export default function DropdownMenuDivider() {
  const { colors } = useTheme();

  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
