import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tag } from '@components/ui';

interface ShoppingListItemProps {
	title: string;
	itemCount: number;
	totalAmount: number;
}

export default function ShoppingListItem({ title, itemCount, totalAmount }: ShoppingListItemProps) {
	return (
		<View style={styles.card}>
			<View style={styles.cardContent}>
				<View style={styles.cardLeft}>
					<Text style={styles.title}>{title}</Text>
					<View style={styles.tags}>
						<Tag label={`${itemCount} items`} />
						<Tag label={`Total: ${totalAmount.toFixed(2)}`} />
					</View>
				</View>
				<Pressable style={styles.removeButton}>
					<Text style={styles.removeIcon}>×</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 12,
		padding: 16,
		marginHorizontal: 16,
		marginBottom: 12,
		backgroundColor: '#fff',
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
		color: '#999',
	},
});
