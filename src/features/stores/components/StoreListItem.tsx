import { StyleSheet, Text } from 'react-native';
import { PressableCard } from '@components/common/pressable-card';
import { useTheme } from '@lib/theme';

interface StoreListItemProps {
	description: string;
}

export default function StoreListItem({ description }: StoreListItemProps) {
	const { colors } = useTheme();

	return (
		<PressableCard style={[styles.card, { borderColor: colors.border }]}>
			<Text style={[styles.title, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">{description}</Text>
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
	title: {
		fontSize: 20,
		fontWeight: '600',
	},
});
