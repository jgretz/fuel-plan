import {useLocalSearchParams, Stack} from 'expo-router';
import {View, Text, FlatList} from 'react-native';

import {useExecutionLog} from '../../../hooks/useExecutionLog';
import {useFuelSources} from '../../../hooks/useFuelSources';
import {useRacePlan, usePlanEntries} from '../../../hooks/useRacePlan';
import {createThemedStyles} from '../../../theme';
import {formatMinutesAsTime} from '../../../utils/format';

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTime: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    width: 50,
  },
  entryFuel: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
    marginLeft: 12,
  },
  statusTaken: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  statusSkipped: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  statusPending: {
    color: colors.textSecondary,
    fontSize: 13,
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
}));

export default function ExecutionLogScreen() {
  const styles = useStyles();
  const {id: raceId} = useLocalSearchParams<{id: string}>();
  const {data: executionLog} = useExecutionLog(raceId);
  const {data: plan} = useRacePlan(raceId);
  const {data: planEntries = []} = usePlanEntries(plan?.id);
  const {data: fuelSources = []} = useFuelSources();

  if (!executionLog) {
    return (
      <>
        <Stack.Screen options={{title: 'Race Log'}} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No execution log yet</Text>
        </View>
      </>
    );
  }

  const fuelSourceMap = new Map(fuelSources.map((fs) => [fs.id, fs]));
  const planEntryMap = new Map(planEntries.map((pe) => [pe.id, pe]));

  const taken = executionLog.entries.filter((e) => e.status === 'taken').length;
  const skipped = executionLog.entries.filter((e) => e.status === 'skipped').length;

  const totalSeconds = executionLog.finishedAt
    ? Math.floor(
        (new Date(executionLog.finishedAt).getTime() -
          new Date(executionLog.startedAt).getTime()) /
          1000,
      ) - executionLog.pauseDurationSeconds
    : 0;

  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  return (
    <>
      <Stack.Screen options={{title: 'Race Log'}} />
      <View style={styles.container}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Race Time</Text>
            <Text style={styles.summaryValue}>
              {hours}h {mins}m
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taken</Text>
            <Text style={styles.summaryValue}>{taken}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Skipped</Text>
            <Text style={styles.summaryValue}>{skipped}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pause Time</Text>
            <Text style={styles.summaryValue}>
              {Math.floor(executionLog.pauseDurationSeconds / 60)}m{' '}
              {executionLog.pauseDurationSeconds % 60}s
            </Text>
          </View>
        </View>

        <FlatList
          data={executionLog.entries}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => {
            const planEntry = planEntryMap.get(item.planEntryId);
            const fuelNames = planEntry
              ? planEntry.fuelSourceIds
                  .map((fsId) => fuelSourceMap.get(fsId)?.name ?? 'Unknown')
                  .join(', ')
              : 'Unknown';

            const statusStyle =
              item.status === 'taken'
                ? styles.statusTaken
                : item.status === 'skipped'
                  ? styles.statusSkipped
                  : styles.statusPending;

            return (
              <View style={styles.entryCard}>
                <Text style={styles.entryTime}>
                  {planEntry ? formatMinutesAsTime(planEntry.timeMinutes) : '—'}
                </Text>
                <Text style={styles.entryFuel} numberOfLines={1}>
                  {fuelNames}
                </Text>
                <Text style={statusStyle}>{item.status.toUpperCase()}</Text>
              </View>
            );
          }}
        />
      </View>
    </>
  );
}
