import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@lib/theme';

interface TagProps {
  label: string;
  size?: 'sm' | 'md';
}

export default function Tag({ label, size = 'md' }: TagProps) {
  const { colors } = useTheme();
  const isSmall = size === 'sm';

  return <Text style={[styles.tag, isSmall ? styles.tagSm : styles.tagMd, { backgroundColor: colors.surface }, styles.label, isSmall ? styles.labelSm : styles.labelMd, { color: colors.surfaceText }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  tagSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagMd: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  labelSm: {
    fontSize: 11,
  },
  labelMd: {
    fontSize: 13,
  },
});
