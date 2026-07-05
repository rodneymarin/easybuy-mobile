import { type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from '@lib/drawer';
import { useTheme } from '@lib/theme';

interface ScreenTitleProps extends PropsWithChildren {}

export default function ScreenTitle({ children }: ScreenTitleProps) {
  const { openDrawer } = useDrawer();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.title, { color: colors.text }]}>{children}</Text>
      <Pressable style={styles.hamburger} onPress={openDrawer}>
        <Ionicons name="menu-outline" size={28} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 52,
  },
  hamburger: {
    position: 'absolute',
    right: 16,
    top: -6,
    padding: 4,
  },
});
