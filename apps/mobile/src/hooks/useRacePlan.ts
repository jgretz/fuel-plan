import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {eq, asc} from 'drizzle-orm';

import {db, schema} from '../db';

const PLAN_KEY = ['race-plan'] as const;

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useRacePlan(raceId: string) {
  return useQuery({
    queryKey: [...PLAN_KEY, raceId],
    queryFn: function () {
      return db
        .select()
        .from(schema.racePlans)
        .where(eq(schema.racePlans.raceId, raceId))
        .get();
    },
  });
}

type PlanEntryWithFuel = {
  id: string;
  planId: string;
  timeMinutes: number;
  sortOrder: number;
  fuelSourceIds: string[];
};

export function usePlanEntries(planId: string | undefined) {
  return useQuery({
    queryKey: [...PLAN_KEY, 'entries', planId],
    enabled: !!planId,
    queryFn: async function () {
      if (!planId) return [];

      const entries = await db
        .select()
        .from(schema.planEntries)
        .where(eq(schema.planEntries.planId, planId))
        .orderBy(asc(schema.planEntries.sortOrder))
        .all();

      const junctions = await db
        .select()
        .from(schema.planEntryFuelSources)
        .all();

      const junctionMap = new Map<string, string[]>();
      for (const j of junctions) {
        const list = junctionMap.get(j.planEntryId) ?? [];
        list.push(j.fuelSourceId);
        junctionMap.set(j.planEntryId, list);
      }

      return entries.map(function (entry): PlanEntryWithFuel {
        return {
          ...entry,
          fuelSourceIds: junctionMap.get(entry.id) ?? [],
        };
      });
    },
  });
}

type AddPlanEntryInput = {
  planId: string;
  timeMinutes: number;
  fuelSourceIds: string[];
  sortOrder: number;
};

export function useAddPlanEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async function (input: AddPlanEntryInput) {
      const entryId = generateId();

      await db.insert(schema.planEntries).values({
        id: entryId,
        planId: input.planId,
        timeMinutes: input.timeMinutes,
        sortOrder: input.sortOrder,
      });

      if (input.fuelSourceIds.length > 0) {
        await db.insert(schema.planEntryFuelSources).values(
          input.fuelSourceIds.map(function (fuelSourceId) {
            return {planEntryId: entryId, fuelSourceId};
          }),
        );
      }

      return entryId;
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: PLAN_KEY});
    },
  });
}

export function useRemovePlanEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (entryId: string) {
      return db.delete(schema.planEntries).where(eq(schema.planEntries.id, entryId));
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: PLAN_KEY});
    },
  });
}

export function useClearPlanEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (planId: string) {
      return db.delete(schema.planEntries).where(eq(schema.planEntries.planId, planId));
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: PLAN_KEY});
    },
  });
}

type UpdatePlanSettingsInput = {
  planId: string;
  silent: boolean;
  alarmSound: string;
};

export function useUpdatePlanSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (input: UpdatePlanSettingsInput) {
      return db
        .update(schema.racePlans)
        .set({silent: input.silent, alarmSound: input.alarmSound})
        .where(eq(schema.racePlans.id, input.planId));
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: PLAN_KEY});
    },
  });
}
