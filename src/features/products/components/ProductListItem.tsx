import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableCard } from '@components/ui/pressable-card';
import { CardTitle, Tag } from '@components/ui';
import { tUnit, useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface ProductListItemProps {
	productName: string;
	unitOfMeasurement: string;
	isSelected?: boolean;
	isSelectionMode?: boolean;
	onPress?: () => void;
	onLongPress?: () => void;
}

export default function ProductListItem({ productName, unitOfMeasurement, isSelected, isSelectionMode, onPress, onLongPress }: ProductListItemProps) {
	const { colors } = useTheme();
	const { t } = useI18n();

	const unitLabel = tUnit(t, unitOfMeasurement);

	return (
		<PressableCard onPress={onPress} onLongPress={onLongPress}>
			<View style={styles.cardContent}>
				{isSelectionMode && (
					<>
						{isSelected ? (
							<View style={[styles.circleFilled, { backgroundColor: colors.primary }]}>
								<Ionicons name="checkmark" size={14} color="#fff" />
							</View>
						) : (
							<View style={[styles.circleEmpty, { borderColor: colors.textSecondary }]} />
						)}
					</>
				)}
				<CardTitle style={{ flex: 1 }}>{productName}</CardTitle>
				<Tag label={unitLabel} />
			</View>
		</PressableCard>
	);
}

const styles = StyleSheet.create({
	cardContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	circleEmpty: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		marginRight: 2,
	},
	circleFilled: {
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 2,
	},
});
