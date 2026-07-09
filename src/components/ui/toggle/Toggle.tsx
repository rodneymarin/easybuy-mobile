import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@lib/theme';

interface ToggleProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export default function Toggle({ label, isSelected, onPress, disabled }: ToggleProps) {
  const { colors } = useTheme();

  const dynamicStyle = {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: 1,
  };

  if (isSelected) {
    dynamicStyle.backgroundColor = disabled ? colors.textSecondary : colors.primary;
    dynamicStyle.borderColor = disabled ? colors.textSecondary : colors.primary;
  } else if (disabled) {
    dynamicStyle.borderColor = colors.border;
  }

  const labelColor = (() => {
    if (isSelected) return '#fff';
    if (disabled) return colors.textSecondary;
    return colors.text;
  })();

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.toggle, dynamicStyle]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
