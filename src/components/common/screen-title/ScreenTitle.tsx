import { type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from '@lib/drawer';

interface ScreenTitleProps extends PropsWithChildren {}

export default function ScreenTitle({ children }: ScreenTitleProps) {
  const { openDrawer } = useDrawer();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{children}</Text>
      <Pressable style={styles.hamburger} onPress={openDrawer}>
        <Ionicons name="menu-outline" size={28} color="#000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  hamburger: {
    position: 'absolute',
    right: 16,
    top: -6,
    padding: 4,
  },
});
