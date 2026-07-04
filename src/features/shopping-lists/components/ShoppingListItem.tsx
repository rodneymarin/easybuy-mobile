import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableCard } from '@components/ui/pressable-card';
import { Tag } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface ShoppingListItemProps {
	title: string;
	itemCount: number;
	totalAmount: number;
}

export default function ShoppingListItem({ title, itemCount, totalAmount }: ShoppingListItemProps) {
	const { colors } = useTheme();
	const { t } = useI18n();

	return (
		<PressableCard style={[styles.card, { borderColor: colors.border }]}>
			<View style={styles.cardContent}>
				<View style={styles.cardLeft}>
					<Text style={[styles.title, { color: colors.text }]}>{title}</Text>
					<View style={styles.tags}>
						<Tag label={t('list.items', { count: itemCount })} />
						<Tag label={t('list.total', { amount: totalAmount.toFixed(2) })} />
					</View>
				</View>
				<Pressable style={styles.removeButton}>
					<Ionicons name="close" size={18} color={colors.textSecondary} />
				</Pressable>
			</View>
		</PressableCard>
	);
}

const styles = StyleSheet.create({
	card: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 10,
		marginHorizontal: 16,
		marginBottom: 12,
	},
	cardContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	cardLeft: {
		flex: 1,
	},
	title: {
		fontSize: 17,
		fontWeight: '500',
		marginBottom: 8,
	},
	tags: {
		flexDirection: 'row',
		gap: 8,
	},
	removeButton: {
		width: 32,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
