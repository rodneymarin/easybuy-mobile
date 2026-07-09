import { FlatList, StyleSheet } from 'react-native';
import type { FlatListProps } from 'react-native';

export default function ListFlatList<T>({ style, contentContainerStyle, ...props }: FlatListProps<T>) {
  return (
    <FlatList style={[styles.body, style]} contentContainerStyle={[styles.content, contentContainerStyle]} {...props} />
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
