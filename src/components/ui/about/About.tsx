import Constants from 'expo-constants';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '@components/ui/bottom-sheet';
import { useTheme } from '@lib/theme';
import { useI18n } from '@lib/i18n';

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
}

function About({ isOpen, onClose }: AboutProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const appVersion = Constants.expoConfig?.version ?? '0.0.0';

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} percentage={0.4}>
      <View style={styles.container}>
        <Image source={require('@assets/logo.png')} style={[styles.logo, { width: 100, height: 100 }]} />
        <Text style={[styles.title, { color: colors.text }]}>EasyBuy</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('about.developedBy')}</Text>
        <Text style={[styles.version, { color: colors.placeholderText }]}>{t('about.version')}{appVersion}</Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logo: {
    marginBottom: 12,
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
