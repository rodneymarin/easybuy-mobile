import { StyleSheet, Text, View } from 'react-native';
import { CloseButton, PressableCard, Tag } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface ShoppingListItemProps {
	title: string;
	itemCount: number;
	completedCount: number;
	totalAmount: number;
	onPress?: () => void;
	onRemove?: () => void;
}

export default function ShoppingListItem({ title, itemCount, completedCount, totalAmount, onPress, onRemove }: ShoppingListItemProps) {
	const { colors } = useTheme();
	const { t } = useI18n();

	return (
		<PressableCard onPress={onPress}>
			<View style={styles.cardContent}>
				<View style={styles.cardLeft}>
					<Text style={[styles.title, { color: colors.text }]}>{title}</Text>
					<View style={styles.tags}>
						<Tag size="sm" label={t('list.items', { completed: completedCount, count: itemCount })} />
						<Tag size="sm" label={t('list.total', { amount: totalAmount.toFixed(2) })} />
					</View>
				</View>
				<CloseButton onPress={onRemove} />
			</View>
		</PressableCard>
	);
}

const styles = StyleSheet.create({
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
		gap: 6,
	},

});
