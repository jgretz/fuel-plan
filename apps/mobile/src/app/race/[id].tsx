import {useLocalSearchParams, useRouter, Stack} from 'expo-router';
import {View, Text, ScrollView, Pressable, Switch, Alert} from 'react-native';

import {useFuelSources} from '../../hooks/useFuelSources';
import {usePlanSummary} from '../../hooks/usePlanSummary';
import {useRace, useDeleteRace, useArchiveRace} from '../../hooks/useRaces';
import {useRacePlan, usePlanEntries, useUpdatePlanSettings} from '../../hooks/useRacePlan';
import {useExecutionLog} from '../../hooks/useExecutionLog';
import {useWatchConnectivity} from '../../services/watchConnectivity';
import {buildWatchPayload} from '../../services/watchPayload';
import {createThemedStyles, useColors} from '../../theme';
import {formatDate, formatMinutesAsTime} from '../../utils/format';

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  raceName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  raceDate: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 4,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    color: colors.text,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  logSummary: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
}));

export default function RaceDetailScreen() {
  const styles = useStyles();
  const colors = useColors();
  const {id} = useLocalSearchParams<{id: string}>();
  const router = useRouter();

  const {data: race} = useRace(id);
  const {data: plan} = useRacePlan(id);
  const {data: entries = []} = usePlanEntries(plan?.id);
  const {data: fuelSources = []} = useFuelSources();
  const {data: executionLog} = useExecutionLog(id);
  const updateSettings = useUpdatePlanSettings();
  const deleteRace = useDeleteRace();
  const archiveRace = useArchiveRace();
  const {sendPlanToWatch} = useWatchConnectivity();

  const summary = usePlanSummary(entries, fuelSources);

  function handleSendToWatch() {
    const payload = buildWatchPayload(race!, plan!, entries, fuelSources);
    sendPlanToWatch(payload);
    Alert.alert('Sent', 'Plan sent to Apple Watch');
  }

  if (!race || !plan) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  function handleToggleSilent(value: boolean) {
    updateSettings.mutate({planId: plan!.id, silent: value, alarmSound: plan!.alarmSound});
  }

  function handleDelete() {
    Alert.alert('Delete Race', `Delete "${race!.name}"? This cannot be undone.`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRace.mutate(id, {onSuccess: () => router.back()}),
      },
    ]);
  }

  function handleArchive() {
    archiveRace.mutate(id, {onSuccess: () => router.back()});
  }

  return (
    <>
      <Stack.Screen options={{title: race.name}} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.raceName}>{race.name}</Text>
          <Text style={styles.raceDate}>{formatDate(race.date)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entries</Text>
            <Text style={styles.summaryValue}>{summary.entryCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{formatMinutesAsTime(summary.durationMinutes)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Calories</Text>
            <Text style={styles.summaryValue}>{summary.totalCalories}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Carbs</Text>
            <Text style={styles.summaryValue}>{summary.totalCarbs}g</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={() => router.push(`/race/${id}/plan`)}>
          <Text style={styles.buttonText}>Edit Plan</Text>
        </Pressable>

        {entries.length > 0 && (
          <Pressable style={styles.button} onPress={handleSendToWatch}>
            <Text style={styles.buttonText}>Send to Watch</Text>
          </Pressable>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Silent Mode</Text>
            <Switch
              value={plan.silent}
              onValueChange={handleToggleSilent}
              trackColor={{true: colors.primary}}
            />
          </View>
        </View>

        {executionLog && (
          <Pressable style={styles.section} onPress={() => router.push(`/race/${id}/log`)}>
            <Text style={styles.sectionTitle}>Race Log</Text>
            <Text style={styles.logSummary}>
              {executionLog.entries.filter((e) => e.status === 'taken').length} taken,{' '}
              {executionLog.entries.filter((e) => e.status === 'skipped').length} skipped
            </Text>
          </Pressable>
        )}

        {race.status === 'finished' && (
          <Pressable style={styles.dangerButton} onPress={handleArchive}>
            <Text style={styles.dangerButtonText}>Archive Race</Text>
          </Pressable>
        )}

        <Pressable style={styles.dangerButton} onPress={handleDelete}>
          <Text style={styles.dangerButtonText}>Delete Race</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
