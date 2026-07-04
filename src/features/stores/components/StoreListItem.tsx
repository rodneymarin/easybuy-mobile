import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@lib/theme';

interface StoreListItemProps {
	description: string;
}

export default function StoreListItem({ description }: StoreListItemProps) {
	const { colors } = useTheme();

	return (
		<View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
			<Text style={[styles.title, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">{description}</Text>
		</View>
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
	title: {
		fontSize: 20,
		fontWeight: '600',
	},
});
