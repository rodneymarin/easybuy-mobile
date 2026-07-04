import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@lib/theme';

interface InputProps extends TextInputProps {}

export default function Input({ style, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }, style]}
      placeholderTextColor={colors.placeholderText} {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
});
