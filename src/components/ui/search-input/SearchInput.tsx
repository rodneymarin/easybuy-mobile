import { StyleSheet } from 'react-native';
import { Input } from '@components/ui/input';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function SearchInput({ value, onChangeText, placeholder }: SearchInputProps) {
  return (
    <Input style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} />
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
  },
});
