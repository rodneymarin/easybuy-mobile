import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@lib/theme';
import { useI18n } from '@lib/i18n';
import { useAuth } from '@lib/auth';
import { useToast } from '@components/ui/toast';
import BottomSheet from '@components/ui/bottom-sheet/BottomSheet';
import Input from '@components/ui/input/Input';
import Button from '@components/ui/button/Button';

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  sessionExpired?: boolean;
  onUseLocalData?: () => void;
}

function AuthSheet({ isOpen, onClose, onAuthenticated, sessionExpired, onUseLocalData }: AuthSheetProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleClose() {
    setEmail('');
    setPassword('');
    setIsSignUp(false);
    setErrorMessage(null);
    if (sessionExpired) {
      onUseLocalData?.();
    } else {
      onClose();
    }
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    if (isSignUp) {
      const { error, user } = await signUp(email.trim(), password);

      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error.message);
        toast.show({ message: error.message, type: 'error' });
        return;
      }

      if (user?.identities?.length === 0) {
        setErrorMessage('auth.checkEmail');
        return;
      }

      setEmail('');
      setPassword('');
      toast.show({ message: t('toast.signedIn'), type: 'success' });
      onAuthenticated();
      onClose();
    } else {
      const { error } = await signIn(email.trim(), password);

      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error.message);
        toast.show({ message: error.message, type: 'error' });
        return;
      }

      setEmail('');
      setPassword('');
      toast.show({ message: t('toast.signedIn'), type: 'success' });
      onAuthenticated();
      onClose();
    }
  }

  function handleToggleMode() {
    setIsSignUp(!isSignUp);
    setErrorMessage(null);
  }

  function handleUseLocalData() {
    setEmail('');
    setPassword('');
    setIsSignUp(false);
    setErrorMessage(null);
    onUseLocalData?.();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} percentage={0.825}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={[styles.title, { color: colors.text }]}>{isSignUp ? t('auth.createAccount') : t('auth.signIn')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {sessionExpired ? t('auth.sessionExpiredDescription') : t('auth.enterCredentials')}
        </Text>

        <View style={styles.form}>
          <Input placeholder={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <View style={styles.spacer} />
          <Input placeholder={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry />

          {errorMessage && (
            <Text style={[styles.error, { color: colors.destructive }]}>
              {errorMessage.startsWith('auth.') ? t(errorMessage) : errorMessage}
            </Text>
          )}

          <View style={styles.spacer} />

          <Button onPress={handleSubmit} disabled={isSubmitting || !email.trim() || !password.trim()} style={styles.submitButton} isLoading={isSubmitting}>
            <Text style={[styles.submitText, { color: '#fff' }]}>{isSignUp ? t('auth.createAccount') : t('auth.signIn')}</Text>
          </Button>

          <Button onPress={handleToggleMode} variant="secondary" style={styles.toggleButton}>
            <Text style={{ color: colors.primary }}>{isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}</Text>
          </Button>

          {sessionExpired && (
            <Button onPress={handleUseLocalData} variant="secondary" style={styles.useLocalButton}>
              <Text style={[styles.useLocalText, { color: colors.textSecondary }]}>{t('auth.useLocalData')}</Text>
            </Button>
          )}
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  form: {
    gap: 0,
  },
  spacer: {
    height: 12,
  },
  error: {
    fontSize: 13,
    marginTop: 8,
  },
  submitButton: {
    justifyContent: 'center',
    marginTop: 4,
  },
  submitText: {
    fontWeight: '600',
    fontSize: 15,
  },
  toggleButton: {
    justifyContent: 'center',
    marginTop: 8,
  },
  useLocalButton: {
    justifyContent: 'center',
    marginTop: 4,
  },
  useLocalText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthSheet;
