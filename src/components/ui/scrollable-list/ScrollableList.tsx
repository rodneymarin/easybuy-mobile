import { type ReactElement } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import type { FlatListProps } from 'react-native';

export default function ScrollableList<T>({ style, contentContainerStyle, children, ...props }: FlatListProps<T> & { children?: ReactElement }) {
  return (
    <FlatList style={[styles.body, style]} contentContainerStyle={[styles.content, contentContainerStyle]} ListFooterComponent={children} {...props} />
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  content: {
    paddingTop: 4,
    paddingBottom: 8,
  },
});
