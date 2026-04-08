import type {WatchPlanPayload} from '@fuel-plan/types';

type FuelSourceRow = {id: string; name: string; calories: number; carbs: number};
type PlanEntryRow = {id: string; timeMinutes: number; sortOrder: number; fuelSourceIds: string[]};
type RaceRow = {id: string; name: string; date: string};
type PlanRow = {silent: boolean; alarmSound: string};

export function buildWatchPayload(
  race: RaceRow,
  plan: PlanRow,
  entries: PlanEntryRow[],
  fuelSources: FuelSourceRow[],
): WatchPlanPayload {
  const sourceMap = new Map(fuelSources.map((fs) => [fs.id, fs]));

  return {
    raceId: race.id,
    raceName: race.name,
    raceDate: race.date,
    silent: plan.silent,
    alarmSound: plan.alarmSound,
    entries: entries
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(function (entry) {
        return {
          id: entry.id,
          timeMinutes: entry.timeMinutes,
          sortOrder: entry.sortOrder,
          fuelSources: entry.fuelSourceIds
            .map(function (fsId) {
              const fs = sourceMap.get(fsId);
              return fs ? {name: fs.name, calories: fs.calories, carbs: fs.carbs} : null;
            })
            .filter(Boolean) as {name: string; calories: number; carbs: number}[],
        };
      }),
  };
}
