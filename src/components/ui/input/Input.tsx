import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@lib/theme';

interface InputProps extends TextInputProps {}

const Input = forwardRef<TextInput, InputProps>(function Input({ style, onFocus, onBlur, ...props }, ref) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = typeof props.value === 'string' && props.value.length > 0;

  return (
    <View style={[styles.container, style]}>
      <TextInput ref={ref} style={[styles.input, { color: colors.text, borderColor: isFocused ? colors.primary : colors.border, borderWidth: isFocused ? 2 : 1, paddingHorizontal: isFocused ? 13 : 14, backgroundColor: colors.background }, hasValue && { paddingRight: 44 }]} placeholderTextColor={colors.placeholderText} onFocus={(e) => { setIsFocused(true); onFocus?.(e); }} onBlur={(e) => { setIsFocused(false); onBlur?.(e); }} {...props} />
      {hasValue && (
        <Pressable style={styles.clearButton} onPress={() => props.onChangeText?.('')} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    padding: 4,
  },
});
