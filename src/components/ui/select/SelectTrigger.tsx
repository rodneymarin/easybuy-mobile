import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@lib/theme';
import { useSelectContext } from './Select';

interface SelectTriggerProps {
	placeholder: string;
	label?: string;
	style?: StyleProp<ViewStyle>;
}

export default function SelectTrigger({ placeholder, label, style }: SelectTriggerProps) {
	const { colors } = useTheme();
	const { open, value } = useSelectContext();

	return (
		<Pressable onPress={open} style={[styles.trigger, { borderColor: colors.border, backgroundColor: colors.background }, style]}>
			<Text style={[styles.text, { color: value ? colors.text : colors.placeholderText }]} numberOfLines={1}>
				{label ?? placeholder}
			</Text>
			<Ionicons name="chevron-down" size={14} color={colors.text} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	trigger: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		height: 48,
	},
	text: {
		flex: 1,
		fontSize: 14,
	},
});
