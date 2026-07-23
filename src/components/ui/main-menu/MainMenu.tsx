import { useState, useEffect, useRef } from 'react';
import { Animated, Easing, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from '@lib/drawer';
import { useI18n, type Language } from '@lib/i18n';
import { useTheme, type ThemeMode } from '@lib/theme';
import { useDataSource, type DataSourceType } from '@lib/data-source';
import { useAuth } from '@lib/auth';
import { useToast } from '@components/ui/toast';
import { ConfirmDeleteSheet } from '@components/ui/confirm-delete-sheet';

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

const languageOptions: { lang: Language; labelKey: string; }[] = [
	{ lang: 'en', labelKey: 'menu.switchToEnglish' },
	{ lang: 'es', labelKey: 'menu.switchToSpanish' },
];

const dataSourceOptions: { source: DataSourceType; icon: string; labelKey: string; }[] = [
	{ source: 'local', icon: 'phone-portrait-outline', labelKey: 'menu.local' },
	{ source: 'cloud', icon: 'cloud-outline', labelKey: 'menu.cloud' },
];

interface MainMenuProps {
	onOpenAbout: () => void;
	onOpenAuth: () => void;
}

function MainMenu({ onOpenAbout, onOpenAuth }: MainMenuProps) {
	const { isDrawerOpen, closeDrawer } = useDrawer();
	const { themeMode, colors, setThemeMode } = useTheme();
	const { language, setLanguage, t } = useI18n();
	const { dataSource, setDataSource, resetLocalData } = useDataSource();
	const { isAuthenticated, user, signOut } = useAuth();
	const toast = useToast();
	const [isLogoutSheetOpen, setIsLogoutSheetOpen] = useState(false);
	const [isResetSheetOpen, setIsResetSheetOpen] = useState(false);
	const [isResetting, setIsResetting] = useState(false);

	const translateX = useRef(new Animated.Value(PANEL_WIDTH)).current;
	const backdropOpacity = useRef(new Animated.Value(0)).current;
	const closeDrawerRef = useRef(closeDrawer);
	closeDrawerRef.current = closeDrawer;

	useEffect(() => {
		const toValue = isDrawerOpen ? 0 : PANEL_WIDTH;
		const backdropTo = isDrawerOpen ? 0.5 : 0;
		const duration = isDrawerOpen ? 300 : 250;
		const easing = isDrawerOpen ? Easing.bezier(0.16, 1, 0.3, 1) : Easing.bezier(0.4, 0, 1, 1);

		Animated.parallel([
			Animated.timing(translateX, { toValue, duration, easing, useNativeDriver: false }),
			Animated.timing(backdropOpacity, { toValue: backdropTo, duration, useNativeDriver: false }),
		]).start();
	}, [isDrawerOpen]);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => false,
			onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5,
			onPanResponderMove: (_, gestureState) => {
				const offset = Math.max(0, gestureState.dx);
				translateX.setValue(offset);
				backdropOpacity.setValue(0.5 * (1 - offset / PANEL_WIDTH));
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dx > PANEL_WIDTH * 0.3 || gestureState.vx > 0.3) {
					Animated.parallel([
						Animated.timing(translateX, { toValue: PANEL_WIDTH, duration: 200, easing: Easing.bezier(0.4, 0, 1, 1), useNativeDriver: false }),
						Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
					]).start(() => {
						closeDrawerRef.current();
					});
				} else {
					Animated.parallel([
						Animated.timing(translateX, { toValue: 0, duration: 250, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: false }),
						Animated.timing(backdropOpacity, { toValue: 0.5, duration: 250, useNativeDriver: false }),
					]).start();
				}
			},
		})
	).current;

	async function handleSelectDataSource(source: DataSourceType) {
		if (source === dataSource) return;
		if (source === 'cloud' && !isAuthenticated) {
			onOpenAuth();
			return;
		}
		await setDataSource(source);
		closeDrawer();
	}

	async function handleLogout() {
		setIsLogoutSheetOpen(false);
		await signOut();
		await setDataSource('local');
		toast.show({ message: t('toast.signedOut'), type: 'success' });
		closeDrawer();
	}

	async function handleResetData() {
		setIsResetSheetOpen(false);
		setIsResetting(true);
		await resetLocalData();
		setIsResetting(false);
		toast.show({ message: t('toast.dataReset'), type: 'info' });
		closeDrawer();
	}

	return (
		<View style={styles.overlay} pointerEvents={isDrawerOpen ? 'box-none' : 'none'}>
			<Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
				<Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
			</Animated.View>

			<Animated.View {...panResponder.panHandlers} style={[styles.panel, { transform: [{ translateX }] }, { backgroundColor: colors.panelBackground }]}>
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<View style={styles.panelHeader}>
						<Text style={[styles.panelTitle, { color: colors.panelText }]}>EasyBuy</Text>
					</View>

					<Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('menu.theme')}</Text>

					{themeOptions.map((option) => {
						const isSelected = option.mode === themeMode;
						return (
							<Pressable key={option.mode} style={styles.menuItem} onPress={() => { setThemeMode(option.mode); closeDrawer(); }}>
								<Ionicons name={option.icon as keyof typeof Ionicons.glyphMap} style={styles.menuItemIcon} color={isSelected ? colors.primary : colors.panelText} />
								<Text style={[styles.menuItemText, styles.menuItemTextFlex, { color: isSelected ? colors.primary : colors.panelText }]}>{t(option.labelKey)}</Text>
								{isSelected && <Ionicons name="checkmark-circle" style={styles.menuItemIcon} color={colors.primary} />}
							</Pressable>
						);
					})}

					<View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />

					<Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('menu.language')}</Text>

					{languageOptions.map((option) => {
						const isSelected = option.lang === language;
						return (
							<Pressable key={option.lang} style={styles.menuItem} onPress={async () => { await setLanguage(option.lang); closeDrawer(); }}>
								<Ionicons name="language-outline" style={styles.menuItemIcon} color={isSelected ? colors.primary : colors.panelText} />
								<Text style={[styles.menuItemText, styles.menuItemTextFlex, { color: isSelected ? colors.primary : colors.panelText }]}>{t(option.labelKey)}</Text>
								{isSelected && <Ionicons name="checkmark-circle" style={styles.menuItemIcon} color={colors.primary} />}
							</Pressable>
						);
					})}

					<View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />

					<Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('menu.dataSource')}</Text>

					{dataSourceOptions.map((option) => {
						const isSelected = option.source === dataSource;
						const isCloudWithoutAuth = option.source === 'cloud' && !isAuthenticated;
						return (
							<Pressable key={option.source} style={styles.menuItem} onPress={() => handleSelectDataSource(option.source)}>
								<Ionicons name={option.icon as keyof typeof Ionicons.glyphMap} style={styles.menuItemIcon} color={isSelected ? colors.primary : colors.panelText} />
								<Text style={[styles.menuItemText, styles.menuItemTextFlex, { color: isSelected ? colors.primary : colors.panelText }]}>{t(option.labelKey)}</Text>
								{isSelected && <Ionicons name="checkmark-circle" style={styles.menuItemIcon} color={colors.primary} />}
								{isCloudWithoutAuth && <Ionicons name="alert-circle-outline" style={styles.menuItemIcon} color={colors.destructive} />}
							</Pressable>
						);
					})}

					{dataSource === 'cloud' && isAuthenticated && user && (
						<>
							<View style={[styles.loggedInSection, { borderTopColor: colors.panelBorder }]}>
								<Ionicons name="person-circle-outline" style={styles.menuItemIcon} color={colors.textSecondary} />
								<Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>{user.email}</Text>
							</View>
							<Pressable style={styles.menuItem} onPress={() => setIsLogoutSheetOpen(true)}>
								<Ionicons name="log-out-outline" style={styles.menuItemIcon} color={colors.destructiveBorder} />
								<Text style={[styles.menuItemText, { color: colors.destructiveBorder }]}>{t('menu.signOut')}</Text>
							</Pressable>
						</>
					)}

					<View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />

					{dataSource === 'local' && (
						<>
							<Pressable style={styles.menuItem} onPress={() => setIsResetSheetOpen(true)}>
								<Ionicons name="refresh-outline" style={styles.menuItemIcon} color={colors.destructiveBorder} />
								<Text style={[styles.menuItemText, { color: colors.destructiveBorder }]}>{t('menu.resetToDefaults')}</Text>
							</Pressable>
							<View style={[styles.divider, { backgroundColor: colors.panelBorder }]} />
						</>
					)}

					<Pressable style={styles.menuItem} onPress={() => { onOpenAbout(); closeDrawer(); }}>
						<Ionicons name="information-circle-outline" style={styles.menuItemIcon} color={colors.panelText} />
						<Text style={[styles.menuItemText, { color: colors.panelText }]}>{t('menu.about')}</Text>
					</Pressable>
				</ScrollView>
			</Animated.View>

			<ConfirmDeleteSheet
				isOpen={isLogoutSheetOpen}
				onClose={() => setIsLogoutSheetOpen(false)}
				onConfirm={handleLogout}
				title={t('menu.signOutTitle')}
				message={t('menu.signOutMessage')}
				warning={t('menu.signOutWarning')}
				confirmLabel={t('menu.signOut')}
			/>

			<ConfirmDeleteSheet
				isOpen={isResetSheetOpen}
				onClose={() => setIsResetSheetOpen(false)}
				onConfirm={handleResetData}
				title={t('menu.resetToDefaultsTitle')}
				message={t('menu.resetToDefaultsMessage')}
				warning={t('menu.resetToDefaultsWarning')}
				confirmLabel={t('menu.reset')}
				isLoading={isResetting}
			/>
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
		borderTopLeftRadius: 16,
		borderBottomLeftRadius: 16,
	},
	scrollContent: {
		paddingTop: 60,
		paddingHorizontal: 20,
		paddingBottom: 40,
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
		paddingVertical: 10,
	},
	menuItemIcon: {
		fontSize: 16,
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
	loggedInSection: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 10,
		marginTop: 4,
		borderTopWidth: 1,
	},
	userEmail: {
		fontSize: 13,
		flex: 1,
	},
});

export default MainMenu;
