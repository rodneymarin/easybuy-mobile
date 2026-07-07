import { useState } from 'react';
import { FlatList, Modal as RNModal, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn } from '@components/ui';
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
      <RNModal visible={isOpen} transparent animationType="none" onRequestClose={() => setIsOpen(false)}>
        <FadeIn style={styles.backdrop}><Pressable style={styles.backdropInner} onPress={() => setIsOpen(false)}>
          <View style={[styles.modal, { backgroundColor: colors.cardBackground }]}>
            <FlatList data={options} keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleSelect(item.value)} style={[styles.item, { borderColor: colors.border, backgroundColor: value === item.value ? colors.surface : 'transparent' }]}>
                  <Text style={[styles.itemText, { color: colors.text }]}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
        </FadeIn>
      </RNModal>
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
  arrow: {
    marginLeft: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  backdropInner: {
    flex: 1,
    justifyContent: 'center',
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
