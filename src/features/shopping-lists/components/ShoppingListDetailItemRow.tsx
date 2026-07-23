import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SelectionIndicator, Tag } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import ShoppingListCheckCircle from './ShoppingListCheckCircle';
import ShoppingListItemCard from './ShoppingListItemCard';
import ShoppingListItemTitle from './ShoppingListItemTitle';

export interface ItemDisplayData {
	rowId: number;
	productName: string;
	quantity: number;
	unitLabel: string;
	storeId?: string;
	storeDescription?: string;
	storeColor?: number;
	price: number;
	isDone: boolean;
	isPinned: boolean;
}

interface ShoppingListDetailItemRowProps {
	item: ItemDisplayData;
	isSelectionMode: boolean;
	isSelected: boolean;
	onPress: () => void;
	onLongPress: () => void;
	onToggleDone: () => void;
}

function ShoppingListDetailItemRow({ item, isSelectionMode, isSelected, onPress, onLongPress, onToggleDone }: ShoppingListDetailItemRowProps) {
	const { colors, isDark } = useTheme();
	const { t } = useI18n();
	const noStoreColor = isDark ? colors.placeholderText : colors.textSecondary;
	const showPin = !item.isDone && item.isPinned;

	return (
		<ShoppingListItemCard onPress={onPress} onLongPress={onLongPress}>
			{showPin && <MaterialCommunityIcons name="pin" size={14} color={colors.primary} style={styles.pinIconAbsolute} />}
			<View style={styles.itemRow}>
				{isSelectionMode && <SelectionIndicator isSelected={isSelected} />}
				<View style={styles.itemContent}>
					<ShoppingListItemTitle name={item.productName} isDone={item.isDone} />
					<View style={styles.itemTags}>
						{item.storeDescription ? (
							<Tag size="sm" label={item.storeDescription} colorIndex={item.storeColor} />
						) : (
							<Text style={[styles.noStoreTag, { color: noStoreColor, borderColor: colors.border }]}>{t('listDetail.noStore')}</Text>
						)}
						<View style={styles.itemTagsRight}>
							{item.price * item.quantity > 0 ? (
								<Tag size="sm" label={`$${(item.price * item.quantity).toFixed(2)}`} />
							) : null}
							<Tag size="sm" label={`${item.quantity} ${item.unitLabel}`} />
						</View>
					</View>
				</View>
				{!isSelectionMode && <ShoppingListCheckCircle isDone={item.isDone} onToggle={onToggleDone} />}
			</View>
		</ShoppingListItemCard>
	);
}

const styles = StyleSheet.create({
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	itemContent: {
		flex: 1,
		marginRight: 8,
		paddingLeft: 8,
	},
	itemTags: {
		flexDirection: 'row',
		gap: 6,
	},
	itemTagsRight: {
		flexDirection: 'row',
		gap: 6,
		marginLeft: 'auto',
	},
	noStoreTag: {
		fontSize: 11,
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 999,
		fontStyle: 'italic',
		alignSelf: 'flex-start',
		borderWidth: 1,
		backgroundColor: 'transparent',
	},
	pinIconAbsolute: {
		position: 'absolute',
		top: 2,
		left: 18,
		zIndex: 1,
	},
});

export default ShoppingListDetailItemRow;
