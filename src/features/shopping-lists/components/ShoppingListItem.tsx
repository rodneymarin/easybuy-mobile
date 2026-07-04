import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PressableCard } from '@components/common/pressable-card';
import { Tag } from '@components/ui';
import { useTheme } from '@lib/theme';

interface ShoppingListItemProps {
	title: string;
	itemCount: number;
	totalAmount: number;
}

export default function ShoppingListItem({ title, itemCount, totalAmount }: ShoppingListItemProps) {
	const { colors } = useTheme();

	return (
		<PressableCard style={[styles.card, { borderColor: colors.border }]}>
			<View style={styles.cardContent}>
				<View style={styles.cardLeft}>
					<Text style={[styles.title, { color: colors.text }]}>{title}</Text>
					<View style={styles.tags}>
						<Tag label={`${itemCount} items`} />
						<Tag label={`Total: ${totalAmount.toFixed(2)}`} />
					</View>
				</View>
				<Pressable style={styles.removeButton}>
					<Text style={[styles.removeIcon, { color: colors.textSecondary }]}>×</Text>
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
		fontSize: 20,
		fontWeight: '600',
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
	removeIcon: {
		fontSize: 22,
	},
});
