import { StyleSheet, View } from 'react-native';
import { ScreenTitle } from '@components/common/screen-title';

export default function TiendasScreen() {
  return (
    <View style={styles.container}>
      <ScreenTitle>Tiendas</ScreenTitle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
});
