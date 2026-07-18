import { FlatList, StyleSheet } from 'react-native';
import type { FlatListProps } from 'react-native';
import type { ReactElement } from 'react';

interface ScrollableListProps<T> extends FlatListProps<T> {
  children?: ReactElement;
}

export default function ScrollableList<T>({ style, contentContainerStyle, children, ...props }: ScrollableListProps<T>) {
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
