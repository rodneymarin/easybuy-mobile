import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@lib/theme';
import { useSelectContext } from './Select';

interface SelectItemProps {
  label: string;
  value: string;
}

export default function SelectItem({ label, value }: SelectItemProps) {
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 15,
  },
  itemTextSelected: {
    fontWeight: '600',
  },
});
