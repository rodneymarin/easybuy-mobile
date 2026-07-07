import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface ShoppingListTotalsProps {
  globalTotal: number;
  cartTotal: number;
  onAddPress?: () => void;
}

export default function ShoppingListTotals({ globalTotal, cartTotal, onAddPress }: ShoppingListTotalsProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.totalBlock}>
          <Text style={[styles.totalText, { color: colors.text }]}>{t('listDetail.globalTotal')}:</Text>
          <Text style={[styles.totalText, { color: colors.text }]}>${globalTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalBlock}>
          <Text style={[styles.cartText, { color: colors.textSecondary }]}>{t('listDetail.cartTotal')}:</Text>
          <Text style={[styles.cartText, { color: colors.textSecondary }]}>${cartTotal.toFixed(2)}</Text>
        </View>
      </View>
      <Button onPress={onAddPress} size="icon">
        <Ionicons name="add" size={20} color="#fff" />
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    paddingHorizontal: 4,
  },
  left: {
    gap: 4,
  },
  totalBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  totalText: {
    fontSize: 17,
    fontWeight: '500',
  },
  cartText: {
    fontSize: 14,
    fontWeight: '500',
  },

});
