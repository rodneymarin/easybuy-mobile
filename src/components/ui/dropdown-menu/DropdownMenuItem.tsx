import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@lib/theme';
import { useDropdownMenuContext } from './DropdownMenu';

interface DropdownMenuItemProps {
  label: string;
  onSelect?: () => void;
}

export default function DropdownMenuItem({ label, onSelect }: DropdownMenuItemProps) {
  const { colors } = useTheme();
  const { close } = useDropdownMenuContext();

  function handlePress() {
    close();
    onSelect?.();
  }

  return (
    <Pressable onPress={handlePress} style={[styles.item, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.itemText, { color: colors.text }]}>{label}</Text>
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
