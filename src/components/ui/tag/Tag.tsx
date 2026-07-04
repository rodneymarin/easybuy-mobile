import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@lib/theme';

interface TagProps {
  label: string;
}

export default function Tag({ label }: TagProps) {
  const { colors } = useTheme();

  return <Text style={[styles.tag, { backgroundColor: colors.surface }, styles.label, { color: colors.surfaceText }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 13,
  },
});
