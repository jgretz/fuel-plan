import {Ionicons} from '@expo/vector-icons';
import {Tabs} from 'expo-router';

import {useColors} from '../../theme';

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {backgroundColor: colors.surface, borderTopColor: colors.border},
        headerStyle: {backgroundColor: colors.surface},
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Races',
          tabBarIcon: ({color, size}) => <Ionicons name='trophy-outline' size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name='fuel'
        options={{
          title: 'Fuel',
          tabBarIcon: ({color, size}) => <Ionicons name='nutrition-outline' size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({color, size}) => <Ionicons name='settings-outline' size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
