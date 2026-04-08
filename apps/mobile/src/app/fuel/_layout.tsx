import {Stack} from 'expo-router';

import {useColors} from '../../theme';

export default function FuelLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {backgroundColor: colors.surface},
        headerTintColor: colors.text,
      }}
    />
  );
}
