import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useMigrations} from 'drizzle-orm/expo-sqlite/migrator';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {Text, View} from 'react-native';

import {db} from '../db';
import migrations from '../db/migrations/migrations';
import WatchConnectivityProvider from '../services/WatchConnectivityProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
  const {success, error} = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WatchConnectivityProvider>
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name='(tabs)' />
          <Stack.Screen name='fuel' options={{headerShown: true, presentation: 'modal'}} />
          <Stack.Screen name='race' options={{headerShown: true}} />
        </Stack>
        <StatusBar style='auto' />
      </WatchConnectivityProvider>
    </QueryClientProvider>
  );
}
