import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@lib/theme';

interface ShoppingListCheckCircleProps {
  isDone: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function ShoppingListCheckCircle({ isDone, onToggle, disabled }: ShoppingListCheckCircleProps) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={disabled ? undefined : onToggle} style={styles.circle} hitSlop={6}>
      {isDone ? (
        <View style={[styles.circleFilled, { backgroundColor: disabled ? colors.textSecondary : colors.primary }]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      ) : (
        <View style={[styles.circleEmpty, { borderColor: disabled ? colors.border : colors.textSecondary }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    marginRight: 10,
  },
  circleEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  circleFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShoppingListCheckCircle;
