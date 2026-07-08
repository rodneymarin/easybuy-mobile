import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@lib/theme';
import { getStoreColor, hexToRgba, shadeColor } from '@lib/store-colors';

interface TagProps {
  label: string;
  size?: 'sm' | 'md';
  color?: string;
  colorIndex?: number;
}

export default function Tag({ label, size = 'md', color, colorIndex }: TagProps) {
  const { colors, isDark } = useTheme();
  const isSmall = size === 'sm';

  const resolvedColor = color ?? (colorIndex !== undefined ? getStoreColor(colorIndex, isDark) : undefined);

  if (resolvedColor) {
    const textColor = isDark ? shadeColor(resolvedColor, 0.75) : shadeColor(resolvedColor, -0.55);
    const bgAlpha = isDark ? 0.2 : 0.35;
    return <Text style={[styles.tag, isSmall ? styles.tagSm : styles.tagMd, { backgroundColor: hexToRgba(resolvedColor, bgAlpha), borderColor: hexToRgba(resolvedColor, 0.4), borderWidth: 1 }, isSmall ? styles.labelSm : styles.labelMd, { color: textColor }]}>{label}</Text>;
  }

  return <Text style={[styles.tag, isSmall ? styles.tagSm : styles.tagMd, { backgroundColor: colors.surface }, isSmall ? styles.labelSm : styles.labelMd, { color: colors.surfaceText }]}>{label}</Text>;
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
