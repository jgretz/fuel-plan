import {useRouter, useLocalSearchParams, Stack} from 'expo-router';
import {Text, View} from 'react-native';

import FuelSourceForm from '../../components/FuelSourceForm';
import {useFuelSource, useUpdateFuelSource} from '../../hooks/useFuelSources';

export default function EditFuelSourceScreen() {
  const router = useRouter();
  const {id} = useLocalSearchParams<{id: string}>();
  const {data: fuelSource} = useFuelSource(id);
  const updateFuelSource = useUpdateFuelSource();

  if (!fuelSource) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  function handleSubmit(values: {name: string; calories: number; carbs: number}) {
    updateFuelSource.mutate(
      {id, ...values},
      {onSuccess: () => router.back()},
    );
  }

  return (
    <>
      <Stack.Screen options={{title: 'Edit Fuel Source'}} />
      <FuelSourceForm
        initialValues={{
          name: fuelSource.name,
          calories: String(fuelSource.calories),
          carbs: String(fuelSource.carbs),
        }}
        onSubmit={handleSubmit}
        submitLabel='Save'
      />
    </>
  );
}
