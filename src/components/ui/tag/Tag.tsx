import { StyleSheet, Text, View } from 'react-native';

interface TagProps {
  label: string;
}

export default function Tag({ label }: TagProps) {
  return (
    <View style={styles.tag}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
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
