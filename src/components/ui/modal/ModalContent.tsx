import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export default function ModalContent({ children }: PropsWithChildren) {
  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  content: {
    marginBottom: 20,
  },
});
