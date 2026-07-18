import { StyleSheet, View } from 'react-native';
import { CardTitle, CloseButton, PressableCard, Tag } from '@components/ui';
import { useI18n } from '@lib/i18n';

interface ShoppingListItemProps {
	title: string;
	itemCount: number;
	completedCount: number;
	totalAmount: number;
	onPress?: () => void;
	onRemove?: () => void;
}

export default function ShoppingListItem({ title, itemCount, completedCount, totalAmount, onPress, onRemove }: ShoppingListItemProps) {
	const { t } = useI18n();

	return (
		<PressableCard onPress={onPress}>
			<View style={styles.cardContent}>
				<View style={styles.cardLeft}>
					<CardTitle style={{ marginBottom: 8 }}>{title}</CardTitle>
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
	tags: {
		flexDirection: 'row',
		gap: 6,
	},

});
