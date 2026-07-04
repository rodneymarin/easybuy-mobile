import { StyleSheet, Text, View } from 'react-native';
import { PressableCard } from '@components/ui/pressable-card';
import { Tag } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface ProductListItemProps {
	productName: string;
	unitOfMeasurement: string;
}

export default function ProductListItem({ productName, unitOfMeasurement }: ProductListItemProps) {
	const { colors } = useTheme();
	const { t } = useI18n();

	const unitLabel = (() => {
		const label = t(`unit.${unitOfMeasurement}`);
		return label !== `unit.${unitOfMeasurement}` ? label : unitOfMeasurement;
	})();

	return (
		<PressableCard style={[styles.card, { borderColor: colors.border }]}>
			<View style={styles.cardContent}>
				<Text style={[styles.title, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">{productName}</Text>
				<Tag label={unitLabel} />
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
		gap: 12,
	},
	title: {
		flex: 1,
		fontSize: 17,
		fontWeight: '500',
	},
});
