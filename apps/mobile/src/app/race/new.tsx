import {useRouter, Stack} from 'expo-router';
import {useState} from 'react';
import {View, Text, TextInput, Pressable} from 'react-native';

import {useCreateRace} from '../../hooks/useRaces';
import {createThemedStyles} from '../../theme';

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: '600',
  },
}));

export default function NewRaceScreen() {
  const styles = useStyles();
  const router = useRouter();
  const createRace = useCreateRace();

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] ?? '');

  function handleSubmit() {
    if (!name.trim() || !date.trim()) return;
    createRace.mutate(
      {name: name.trim(), date},
      {onSuccess: (raceId) => router.replace(`/race/${raceId}`)},
    );
  }

  return (
    <>
      <Stack.Screen options={{title: 'New Race'}} />
      <View style={styles.container}>
        <Text style={styles.label}>Race Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder='e.g. Ironman 70.3 Eagleman'
          autoFocus
        />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder='2026-06-15'
          keyboardType='numbers-and-punctuation'
        />

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Create Race</Text>
        </Pressable>
      </View>
    </>
  );
}
