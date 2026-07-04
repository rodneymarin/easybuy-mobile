import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@lib/theme';

interface InputProps extends TextInputProps {}

export default function Input({ style, onFocus, onBlur, ...props }: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput style={[styles.input, { color: colors.text, borderColor: isFocused ? colors.primary : colors.border, borderWidth: isFocused ? 2 : 1, paddingHorizontal: isFocused ? 13 : 14, backgroundColor: colors.background }, style]}
      placeholderTextColor={colors.placeholderText}
      onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
});
