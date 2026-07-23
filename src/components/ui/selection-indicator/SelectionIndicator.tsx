import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@lib/theme';

interface SelectionIndicatorProps {
  isSelected: boolean;
}

function SelectionIndicator({ isSelected }: SelectionIndicatorProps) {
  const { colors } = useTheme();

  if (isSelected) {
    return (
      <View style={[styles.circleFilled, { backgroundColor: colors.primary }]}>
        <Ionicons name="checkmark" size={14} color="#fff" />
      </View>
    );
  }

  return <View style={[styles.circleEmpty, { borderColor: colors.textSecondary }]} />;
}

const styles = StyleSheet.create({
  circleEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
  },
  circleFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});

export default SelectionIndicator;
