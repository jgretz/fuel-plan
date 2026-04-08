import {useRouter, Stack} from 'expo-router';
import {Pressable, Text} from 'react-native';

import FuelSourceForm from '../../components/FuelSourceForm';
import {useCreateFuelSource} from '../../hooks/useFuelSources';

export default function NewFuelSourceScreen() {
  const router = useRouter();
  const createFuelSource = useCreateFuelSource();

  function handleSubmit(values: {name: string; calories: number; carbs: number}) {
    createFuelSource.mutate(values, {
      onSuccess: () => router.back(),
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Fuel Source',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text style={{color: '#2563eb', fontSize: 16}}>Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <FuelSourceForm onSubmit={handleSubmit} submitLabel='Create' />
    </>
  );
}
