import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@lib/theme';
import { useSelectContext } from './Select';

interface SelectItemProps {
  label: string;
  value: string;
  hasIndicator?: boolean;
}

export default function SelectItem({ label, value, hasIndicator }: SelectItemProps) {
  const { colors } = useTheme();
  const { value: selectedValue, onValueChange, close } = useSelectContext();

  const isSelected = selectedValue === value;

  function handlePress() {
    onValueChange(value);
    close();
  }

  return (
    <Pressable onPress={handlePress} style={[styles.item, { borderColor: colors.border, backgroundColor: isSelected ? colors.surface : 'transparent' }]}>
      <Text style={[styles.itemText, { color: colors.text }, isSelected && styles.itemTextSelected]}>{label}</Text>
      {hasIndicator && <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
  },
  itemTextSelected: {
    fontWeight: '600',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
