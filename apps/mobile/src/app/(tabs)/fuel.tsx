import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {View, Text, FlatList, Pressable, Alert} from 'react-native';

import {useFuelSources, useDeleteFuelSource} from '../../hooks/useFuelSources';
import {createThemedStyles, useColors} from '../../theme';

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  stats: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
}));

export default function FuelScreen() {
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const {data: fuelSources = []} = useFuelSources();
  const deleteFuelSource = useDeleteFuelSource();

  function handleDelete(id: string, name: string) {
    Alert.alert('Delete Fuel Source', `Delete "${name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteFuelSource.mutate(id),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {fuelSources.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No fuel sources yet</Text>
        </View>
      ) : (
        <FlatList
          data={fuelSources}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/fuel/${item.id}`)}
              onLongPress={() => handleDelete(item.id, item.name)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.stats}>
                  {item.calories} cal &middot; {item.carbs}g carbs
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
      <Pressable style={styles.fab} onPress={() => router.push('/fuel/new')}>
        <Ionicons name='add' size={28} color={colors.primaryText} />
      </Pressable>
    </View>
  );
}
