import {useState} from 'react';
import {View, Text, TextInput, Pressable} from 'react-native';

import {createThemedStyles} from '../theme';

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

type Props = {
  initialValues?: {name: string; calories: string; carbs: string};
  onSubmit: (values: {name: string; calories: number; carbs: number}) => void;
  submitLabel: string;
};

export default function FuelSourceForm({initialValues, onSubmit, submitLabel}: Props) {
  const styles = useStyles();
  const [name, setName] = useState(initialValues?.name ?? '');
  const [calories, setCalories] = useState(initialValues?.calories ?? '');
  const [carbs, setCarbs] = useState(initialValues?.carbs ?? '');

  function handleSubmit() {
    const cal = parseFloat(calories);
    const c = parseFloat(carbs);
    if (!name.trim() || isNaN(cal) || isNaN(c)) return;
    onSubmit({name: name.trim(), calories: cal, carbs: c});
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder='e.g. Maurten Gel 100'
        autoFocus
      />

      <Text style={styles.label}>Calories</Text>
      <TextInput
        style={styles.input}
        value={calories}
        onChangeText={setCalories}
        placeholder='0'
        keyboardType='decimal-pad'
      />

      <Text style={styles.label}>Carbs (g)</Text>
      <TextInput
        style={styles.input}
        value={carbs}
        onChangeText={setCarbs}
        placeholder='0'
        keyboardType='decimal-pad'
      />

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
}
