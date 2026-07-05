import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@lib/theme';

interface ToggleProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function Toggle({ label, isSelected, onPress }: ToggleProps) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.toggle, { backgroundColor: isSelected ? colors.primary : 'transparent', borderColor: isSelected ? colors.primary : colors.border, borderWidth: 1 }]}>
      <Text style={[styles.label, { color: isSelected ? '#fff' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
