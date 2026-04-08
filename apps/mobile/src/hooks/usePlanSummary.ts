import {useMemo} from 'react';

import type {PlanSummary} from '@fuel-plan/types';

type FuelSourceRow = {id: string; calories: number; carbs: number};
type PlanEntryWithFuel = {timeMinutes: number; fuelSourceIds: string[]};

export function usePlanSummary(
  entries: PlanEntryWithFuel[],
  fuelSources: FuelSourceRow[],
): PlanSummary {
  return useMemo(
    function () {
      const sourceMap = new Map(fuelSources.map((fs) => [fs.id, fs]));

      let totalCalories = 0;
      let totalCarbs = 0;
      let maxTime = 0;

      for (const entry of entries) {
        for (const fsId of entry.fuelSourceIds) {
          const source = sourceMap.get(fsId);
          if (source) {
            totalCalories += source.calories;
            totalCarbs += source.carbs;
          }
        }
        if (entry.timeMinutes > maxTime) {
          maxTime = entry.timeMinutes;
        }
      }

      return {
        totalCalories,
        totalCarbs,
        entryCount: entries.length,
        durationMinutes: maxTime,
      };
    },
    [entries, fuelSources],
  );
}
