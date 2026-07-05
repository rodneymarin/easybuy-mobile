import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@lib/theme';

interface CloseButtonProps {
  onPress?: () => void;
  size?: number;
  hitSlop?: number;
}

function CloseButton({ onPress, size = 18, hitSlop = 8 }: CloseButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.button} hitSlop={hitSlop}>
      <Ionicons name="close" size={size} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CloseButton;
