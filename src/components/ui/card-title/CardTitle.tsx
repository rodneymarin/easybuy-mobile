import { type ReactNode } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '@lib/theme';

interface CardTitleProps extends Pick<TextProps, 'numberOfLines' | 'ellipsizeMode'> {
  children: ReactNode;
  style?: TextProps['style'];
}

function CardTitle({ children, numberOfLines = 1, ellipsizeMode = 'tail', style }: CardTitleProps) {
  const { colors } = useTheme();

  return (
    <Text numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode} style={[styles.title, { color: colors.text }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: '400',
  },
});

export default CardTitle;
