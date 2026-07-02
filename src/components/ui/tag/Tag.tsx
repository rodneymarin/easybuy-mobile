import { StyleSheet, Text } from 'react-native';

interface TagProps {
  label: string;
}

export default function Tag({ label }: TagProps) {
  return <Text style={[styles.tag, styles.label]}>{label}</Text>;
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 13,
    color: '#555',
  },
});
