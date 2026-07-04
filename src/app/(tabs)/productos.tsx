import { StyleSheet, View } from 'react-native';
import { ScreenTitle } from '@components/common/screen-title';
import { useTheme } from '@lib/theme';

export default function ProductosScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTitle>Productos</ScreenTitle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
});
