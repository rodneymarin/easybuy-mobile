import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '@components/ui/modal';
import { useTheme } from '@lib/theme';

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
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  function handleSelect(optionValue: string) {
    onSelect(optionValue);
    setIsOpen(false);
  }

  return (
    <>
      <Pressable onPress={() => setIsOpen(true)} style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.background }, style]}>
        <Text style={[styles.text, { color: selectedOption ? colors.text : colors.placeholderText }]} numberOfLines={1}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.text} />
      </Pressable>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} cardStyle={[styles.modal, { backgroundColor: colors.cardBackground }]}>
        <FlatList data={options} keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSelect(item.value)} style={[styles.item, { borderColor: colors.border, backgroundColor: value === item.value ? colors.surface : 'transparent' }]}>
              <Text style={[styles.itemText, { color: colors.text }]}>{item.label}</Text>
            </Pressable>
          )}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  text: {
    flex: 1,
    fontSize: 15,
  },
  modal: {
    borderRadius: 16,
    padding: 20,
    maxHeight: 350,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 15,
  },
});
