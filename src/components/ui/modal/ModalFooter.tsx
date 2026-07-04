import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export default function ModalFooter({ children }: PropsWithChildren) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
});
