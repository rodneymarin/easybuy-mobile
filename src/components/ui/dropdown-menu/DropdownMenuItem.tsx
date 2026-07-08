import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@lib/theme';
import { useDropdownMenuContext } from './DropdownMenu';

interface DropdownMenuItemProps {
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
}

export default function DropdownMenuItem({ label, onSelect, disabled }: DropdownMenuItemProps) {
  const { colors } = useTheme();
  const { close } = useDropdownMenuContext();

  function handlePress() {
    if (disabled) return;
    close();
    onSelect?.();
  }

  return (
    <Pressable onPress={handlePress} disabled={disabled} style={[styles.item, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.itemText, { color: disabled ? colors.placeholderText : colors.text, opacity: disabled ? 0.4 : 1 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
