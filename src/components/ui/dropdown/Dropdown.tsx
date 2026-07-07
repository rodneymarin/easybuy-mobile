import { FlatList, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@components/ui/select';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  value: string | null;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
}

export default function Dropdown({ value, options, onSelect, placeholder, style }: DropdownProps) {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger placeholder={placeholder} label={selectedOption?.label} style={style} />
      <SelectContent cardStyle={styles.modal}>
        <FlatList data={options} keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <SelectItem label={item.label} value={item.value} />
          )}
        />
      </SelectContent>
    </Select>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: 8,
  },
});
