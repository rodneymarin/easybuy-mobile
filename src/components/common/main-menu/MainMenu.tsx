import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from '@lib/drawer';
import { useI18n, type Language } from '@lib/i18n';
import { useTheme, type ThemeMode } from '@lib/theme';

const PANEL_WIDTH = 280;

interface ThemeOption {
  mode: ThemeMode;
  icon: string;
  labelKey: string;
}

const themeOptions: ThemeOption[] = [
  { mode: 'light', icon: 'sunny-outline', labelKey: 'menu.light' },
  { mode: 'dark', icon: 'moon-outline', labelKey: 'menu.dark' },
  { mode: 'system', icon: 'phone-portrait-outline', labelKey: 'menu.system' },
];

const languageOptions: { lang: Language; labelKey: string }[] = [
  { lang: 'en', labelKey: 'menu.switchToEnglish' },
  { lang: 'es', labelKey: 'menu.switchToSpanish' },
];

function MainMenu() {
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const { themeMode, colors, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useI18n();
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

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('menu.theme')}</Text>

        {themeOptions.map((option) => {
          const isSelected = option.mode === themeMode;
          return (
            <Pressable key={option.mode} style={styles.menuItem} onPress={() => { setThemeMode(option.mode); closeDrawer(); }}>
              <Ionicons name={option.icon as keyof typeof Ionicons.glyphMap} size={22} color={isSelected ? colors.primary : colors.panelText} />
              <Text style={[styles.menuItemText, styles.menuItemTextFlex, { color: colors.panelText }]}>{t(option.labelKey)}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </Pressable>
          );
        })}

        <View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('menu.language')}</Text>

        {languageOptions.map((option) => {
          const isSelected = option.lang === language;
          return (
            <Pressable key={option.lang} style={styles.menuItem} onPress={async () => { await setLanguage(option.lang); closeDrawer(); }}>
              <Ionicons name="language-outline" size={22} color={isSelected ? colors.primary : colors.panelText} />
              <Text style={[styles.menuItemText, styles.menuItemTextFlex, { color: colors.panelText }]}>{t(option.labelKey)}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </Pressable>
          );
        })}

        <View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />

        <Pressable style={styles.menuItem} onPress={closeDrawer}>
          <Ionicons name="download-outline" size={22} color={colors.panelText} />
          <Text style={[styles.menuItemText, { color: colors.panelText }]}>{t('menu.exportData')}</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={closeDrawer}>
          <Ionicons name="cloud-upload-outline" size={22} color={colors.panelText} />
          <Text style={[styles.menuItemText, { color: colors.panelText }]}>{t('menu.importData')}</Text>
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
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
  menuItemTextFlex: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});

export default MainMenu;
