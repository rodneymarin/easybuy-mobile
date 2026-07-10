import { useState, useEffect, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, Extrapolation, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { About } from '@components/ui/about';
import { useDrawer } from '@lib/drawer';
import { useI18n, type Language } from '@lib/i18n';
import { useTheme, type ThemeMode } from '@lib/theme';

const PANEL_WIDTH = 280;

const EASE_OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN_EXPO = Easing.bezier(0.4, 0, 1, 1);

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

const languageOptions: { lang: Language; labelKey: string; }[] = [
	{ lang: 'en', labelKey: 'menu.switchToEnglish' },
	{ lang: 'es', labelKey: 'menu.switchToSpanish' },
];

function MainMenu() {
	const { isDrawerOpen, closeDrawer } = useDrawer();
	const { themeMode, colors, setThemeMode } = useTheme();
	const { language, setLanguage, t } = useI18n();
	const [isAboutOpen, setIsAboutOpen] = useState(false);

	const translateX = useSharedValue(PANEL_WIDTH);
	const backdropOpacity = useSharedValue(0);

	const closeDrawerJS = useCallback(() => {
		closeDrawer();
	}, [closeDrawer]);

	useEffect(() => {
		const toValue = isDrawerOpen ? 0 : PANEL_WIDTH;
		const backdropTo = isDrawerOpen ? 0.5 : 0;
		const duration = isDrawerOpen ? 300 : 250;
		const easing = isDrawerOpen ? EASE_OUT_EXPO : EASE_IN_EXPO;

		translateX.value = withTiming(toValue, { duration, easing });
		backdropOpacity.value = withTiming(backdropTo, { duration });
	}, [isDrawerOpen]);

	const panelStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: backdropOpacity.value,
	}));

	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			const offset = Math.max(0, event.translationX);
			translateX.value = offset;
			backdropOpacity.value = interpolate(offset, [0, PANEL_WIDTH], [0.5, 0], Extrapolation.CLAMP);
		})
		.onEnd((event) => {
			if (event.translationX > PANEL_WIDTH * 0.3 || event.velocityX > 300) {
				translateX.value = withTiming(PANEL_WIDTH, { duration: 200, easing: EASE_IN_EXPO });
				backdropOpacity.value = withTiming(0, { duration: 200 });
				runOnJS(closeDrawerJS)();
			} else {
				translateX.value = withTiming(0, { duration: 250, easing: EASE_OUT_EXPO });
				backdropOpacity.value = withTiming(0.5, { duration: 250 });
			}
		});

	return (
		<View style={styles.overlay} pointerEvents={isDrawerOpen ? 'box-none' : 'none'}>
			<Animated.View style={[styles.backdrop, backdropStyle]}>
				<Pressable style={StyleSheet.absoluteFill} onPress={closeDrawerJS} />
			</Animated.View>

			<GestureDetector gesture={panGesture}>
				<Animated.View style={[styles.panel, panelStyle, { backgroundColor: colors.panelBackground }]}>
					<View style={styles.panelHeader}>
						<Text style={[styles.panelTitle, { color: colors.panelText }]}>EasyBuy</Text>
					</View>

					<Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('menu.theme')}</Text>

					{themeOptions.map((option) => {
						const isSelected = option.mode === themeMode;
						return (
							<Pressable key={option.mode} style={styles.menuItem} onPress={() => { setThemeMode(option.mode); closeDrawerJS(); }}>
								<Ionicons name={option.icon as keyof typeof Ionicons.glyphMap} size={22} color={isSelected ? colors.primary : colors.panelText} />
								<Text style={[styles.menuItemText, styles.menuItemTextFlex, { color: isSelected ? colors.primary : colors.panelText }]}>{t(option.labelKey)}</Text>
								{isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
							</Pressable>
						);
					})}

					<View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />

					<Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('menu.language')}</Text>

					{languageOptions.map((option) => {
						const isSelected = option.lang === language;
						return (
							<Pressable key={option.lang} style={styles.menuItem} onPress={async () => { await setLanguage(option.lang); closeDrawerJS(); }}>
								<Ionicons name="language-outline" size={22} color={isSelected ? colors.primary : colors.panelText} />
								<Text style={[styles.menuItemText, styles.menuItemTextFlex, { color: isSelected ? colors.primary : colors.panelText }]}>{t(option.labelKey)}</Text>
								{isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
							</Pressable>
						);
					})}

					<View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />

					<Pressable style={styles.menuItem} onPress={() => { setIsAboutOpen(true); }}>
						<Ionicons name="information-circle-outline" size={22} color={colors.panelText} />
						<Text style={[styles.menuItemText, { color: colors.panelText }]}>{t('menu.about')}</Text>
					</Pressable>

					{/* <View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />

          <Pressable style={styles.menuItem} onPress={closeDrawer}>
            <Ionicons name="download-outline" size={22} color={colors.panelText} />
            <Text style={[styles.menuItemText, { color: colors.panelText }]}>{t('menu.exportData')}</Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={closeDrawer}>
            <Ionicons name="cloud-upload-outline" size={22} color={colors.panelText} />
            <Text style={[styles.menuItemText, { color: colors.panelText }]}>{t('menu.importData')}</Text>
          </Pressable> */}
				</Animated.View>
			</GestureDetector>

			<About isOpen={isAboutOpen} onClose={() => { setIsAboutOpen(false); }} />
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
		borderTopLeftRadius: 16,
		borderBottomLeftRadius: 16,
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
		opacity: 0.6,
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
