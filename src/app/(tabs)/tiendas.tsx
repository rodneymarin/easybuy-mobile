import { StyleSheet, View } from 'react-native';
import { ScreenTitle } from '@components/common/screen-title';
import { useTheme } from '@lib/theme';

export default function TiendasScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTitle>Tiendas</ScreenTitle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
});
