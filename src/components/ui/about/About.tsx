import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '@components/ui/bottom-sheet';
import { useTheme } from '@lib/theme';

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
}

function About({ isOpen, onClose }: AboutProps) {
  const { colors } = useTheme();
  const appVersion = Constants.expoConfig?.version ?? '0.0.0';

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>EasyBuy</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Desarrollado por Rodney Marín</Text>
        <Text style={[styles.version, { color: colors.placeholderText }]}>V{appVersion}</Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default About;
