import { StyleSheet, Text, View } from 'react-native';
import { PressableCard } from '@components/common/pressable-card';
import { Tag } from '@components/ui';
import { UNIT_OF_MEASUREMENT } from '@models/product.model';
import { useTheme } from '@lib/theme';

interface ProductListItemProps {
	productName: string;
	unitOfMeasurement: string;
}

function getUnitLabel(unitId: string): string {
	const unit = UNIT_OF_MEASUREMENT.find((u) => u.id === unitId);
	return unit?.label ?? unitId;
}

export default function ProductListItem({ productName, unitOfMeasurement }: ProductListItemProps) {
	const { colors } = useTheme();

	return (
		<PressableCard style={[styles.card, { borderColor: colors.border }]}>
			<View style={styles.cardContent}>
				<Text style={[styles.title, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">{productName}</Text>
				<Tag label={getUnitLabel(unitOfMeasurement)} />
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
		fontSize: 20,
		fontWeight: '600',
	},
});
