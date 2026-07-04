import { StyleSheet, TextInput } from 'react-native';
import { useTheme } from '@lib/theme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function SearchInput({ value, onChangeText, placeholder }: SearchInputProps) {
  const { colors } = useTheme();

  return (
    <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder={placeholder} placeholderTextColor={colors.placeholderText} value={value} onChangeText={onChangeText} />
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
});
