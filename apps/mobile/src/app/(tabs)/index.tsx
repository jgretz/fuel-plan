import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {View, Text, FlatList, Pressable, Alert} from 'react-native';

import {useRaces, useDeleteRace, useArchiveRace} from '../../hooks/useRaces';
import {createThemedStyles, useColors} from '../../theme';
import {formatDate} from '../../utils/format';

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
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
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

export default function RacesScreen() {
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const {data: races = []} = useRaces();
  const deleteRace = useDeleteRace();
  const archiveRace = useArchiveRace();

  const activeRaces = races.filter((r) => r.status === 'upcoming' || r.status === 'active');
  const finishedRaces = races.filter((r) => r.status === 'finished');

  function handleLongPress(id: string, name: string) {
    Alert.alert(name, 'What would you like to do?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Archive', onPress: () => archiveRace.mutate(id)},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRace.mutate(id),
      },
    ]);
  }

  function renderRace(race: (typeof races)[0]) {
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/race/${race.id}`)}
        onLongPress={() => handleLongPress(race.id, race.name)}
      >
        <Text style={styles.name}>{race.name}</Text>
        <Text style={styles.date}>{formatDate(race.date)}</Text>
      </Pressable>
    );
  }

  const allVisible = [...activeRaces, ...finishedRaces];

  return (
    <View style={styles.container}>
      {allVisible.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No races yet</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(activeRaces.length > 0
              ? [{type: 'header' as const, title: 'Upcoming', id: 'h-upcoming'}]
              : []),
            ...activeRaces.map((r) => ({type: 'race' as const, ...r})),
            ...(finishedRaces.length > 0
              ? [{type: 'header' as const, title: 'Finished', id: 'h-finished'}]
              : []),
            ...finishedRaces.map((r) => ({type: 'race' as const, ...r})),
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({item}) =>
            item.type === 'header' ? (
              <Text style={styles.sectionHeader}>{item.title}</Text>
            ) : (
              renderRace(item)
            )
          }
        />
      )}
      <Pressable style={styles.fab} onPress={() => router.push('/race/new')}>
        <Ionicons name='add' size={28} color={colors.primaryText} />
      </Pressable>
    </View>
  );
}
