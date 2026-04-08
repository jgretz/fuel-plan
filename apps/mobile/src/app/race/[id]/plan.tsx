import {Ionicons} from '@expo/vector-icons';
import {useLocalSearchParams, Stack} from 'expo-router';
import {useState, useCallback} from 'react';
import {View, Text, FlatList, Pressable, Alert} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import type {GeneratedEntry} from '@fuel-plan/schedule-builder';

import ScheduleBuilderModal from '../../../components/ScheduleBuilderModal';
import {useFuelSources} from '../../../hooks/useFuelSources';
import {
  useRacePlan,
  usePlanEntries,
  useAddPlanEntry,
  useRemovePlanEntry,
  useClearPlanEntries,
} from '../../../hooks/useRacePlan';
import {usePlanSummary} from '../../../hooks/usePlanSummary';
import {createThemedStyles, useColors} from '../../../theme';
import {formatMinutesAsTime} from '../../../utils/format';

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  entryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryTime: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    width: 50,
  },
  entryFuels: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
    marginLeft: 12,
  },
  entryStats: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: 8,
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  toolbarButtonText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  clearButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
}));

export default function PlanEditorScreen() {
  const styles = useStyles();
  const colors = useColors();
  const {id: raceId} = useLocalSearchParams<{id: string}>();

  const {data: plan} = useRacePlan(raceId);
  const {data: entries = []} = usePlanEntries(plan?.id);
  const {data: fuelSources = []} = useFuelSources();
  const addPlanEntry = useAddPlanEntry();
  const removePlanEntry = useRemovePlanEntry();
  const clearPlanEntries = useClearPlanEntries();
  const summary = usePlanSummary(entries, fuelSources);

  const [showBuilder, setShowBuilder] = useState(false);
  const insets = useSafeAreaInsets();

  const fuelSourceMap = new Map(fuelSources.map((fs) => [fs.id, fs]));

  const handleApplySchedule = useCallback(
    async function (generated: GeneratedEntry[]) {
      if (!plan) return;

      const maxSort = entries.reduce((max, e) => Math.max(max, e.sortOrder), -1);

      for (let i = 0; i < generated.length; i++) {
        const entry = generated[i]!;
        await addPlanEntry.mutateAsync({
          planId: plan.id,
          timeMinutes: entry.timeMinutes,
          fuelSourceIds: entry.fuelSourceIds,
          sortOrder: maxSort + 1 + i,
        });
      }
    },
    [plan, entries, addPlanEntry],
  );

  function handleDeleteEntry(entryId: string) {
    removePlanEntry.mutate(entryId);
  }

  function handleClearAll() {
    if (!plan) return;
    Alert.alert('Clear All', 'Remove all plan entries?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => clearPlanEntries.mutate(plan.id),
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{title: 'Edit Plan'}} />
      <View style={styles.container}>
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.entryCount}</Text>
            <Text style={styles.summaryLabel}>Entries</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalCalories}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalCarbs}g</Text>
            <Text style={styles.summaryLabel}>Carbs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatMinutesAsTime(summary.durationMinutes)}</Text>
            <Text style={styles.summaryLabel}>Duration</Text>
          </View>
        </View>

        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No entries — use Schedule Builder to get started</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => {
              const fuelNames = item.fuelSourceIds
                .map((fsId) => fuelSourceMap.get(fsId)?.name ?? 'Unknown')
                .join(', ');
              const cals = item.fuelSourceIds.reduce(
                (sum, fsId) => sum + (fuelSourceMap.get(fsId)?.calories ?? 0),
                0,
              );

              return (
                <Pressable
                  style={styles.entryCard}
                  onLongPress={() => handleDeleteEntry(item.id)}
                >
                  <Text style={styles.entryTime}>{formatMinutesAsTime(item.timeMinutes)}</Text>
                  <Text style={styles.entryFuels} numberOfLines={1}>
                    {fuelNames}
                  </Text>
                  <Text style={styles.entryStats}>{cals} cal</Text>
                </Pressable>
              );
            }}
          />
        )}

        <View style={[styles.toolbar, {paddingBottom: Math.max(insets.bottom, 16)}]}>
          <Pressable style={styles.toolbarButton} onPress={() => setShowBuilder(true)}>
            <Ionicons name='calendar-outline' size={18} color={colors.primaryText} />
            <Text style={styles.toolbarButtonText}>Schedule Builder</Text>
          </Pressable>
          {entries.length > 0 && (
            <Pressable style={styles.clearButton} onPress={handleClearAll}>
              <Ionicons name='trash-outline' size={18} color={colors.danger} />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </Pressable>
          )}
        </View>

        <ScheduleBuilderModal
          visible={showBuilder}
          fuelSources={fuelSources}
          onApply={handleApplySchedule}
          onClose={() => setShowBuilder(false)}
        />
      </View>
    </>
  );
}
