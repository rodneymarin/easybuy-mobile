import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from '@lib/drawer';
import { useTheme } from '@lib/theme';

const PANEL_WIDTH = 280;

function MainMenu() {
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const { isDark, colors, toggleTheme } = useTheme();
  const [isEnglish, setIsEnglish] = useState(false);
  const translateX = useRef(new Animated.Value(PANEL_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isDrawerOpen ? 0 : PANEL_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: isDrawerOpen ? 0.5 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDrawerOpen]);

  return (
    <View style={styles.overlay} pointerEvents={isDrawerOpen ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </Animated.View>

      <Animated.View style={[styles.panel, { transform: [{ translateX }], backgroundColor: colors.panelBackground }]}>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: colors.panelText }]}>EasyBuy</Text>
          <Pressable onPress={closeDrawer}>
            <Ionicons name="close" size={24} color={colors.panelText} />
          </Pressable>
        </View>

        <Pressable style={styles.menuItem} onPress={() => { toggleTheme(); closeDrawer(); }}>
          <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.panelText} />
          <Text style={[styles.menuItemText, { color: colors.panelText }]}>
            Usar tema {isDark ? 'Light' : 'Dark'}
          </Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => { setIsEnglish(!isEnglish); closeDrawer(); }}>
          <Ionicons name="language-outline" size={22} color={colors.panelText} />
          <Text style={[styles.menuItemText, { color: colors.panelText }]}>
            Cambiar a idioma {isEnglish ? 'Español' : 'Inglés'}
          </Text>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />

        <Pressable style={styles.menuItem} onPress={closeDrawer}>
          <Ionicons name="download-outline" size={22} color={colors.panelText} />
          <Text style={[styles.menuItemText, { color: colors.panelText }]}>Exportar datos</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={closeDrawer}>
          <Ionicons name="cloud-upload-outline" size={22} color={colors.panelText} />
          <Text style={[styles.menuItemText, { color: colors.panelText }]}>Importar datos</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});

export default MainMenu;
