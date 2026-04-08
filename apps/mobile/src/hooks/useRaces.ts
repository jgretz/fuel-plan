import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {eq, desc} from 'drizzle-orm';

import {db, schema} from '../db';

const RACES_KEY = ['races'] as const;

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useRaces() {
  return useQuery({
    queryKey: RACES_KEY,
    queryFn: function () {
      return db.select().from(schema.races).orderBy(desc(schema.races.date)).all();
    },
  });
}

export function useRace(id: string) {
  return useQuery({
    queryKey: [...RACES_KEY, id],
    queryFn: function () {
      return db.select().from(schema.races).where(eq(schema.races.id, id)).get();
    },
  });
}

type CreateRaceInput = {
  name: string;
  date: string;
};

export function useCreateRace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async function (input: CreateRaceInput) {
      const now = new Date().toISOString();
      const raceId = generateId();
      const planId = generateId();

      await db.insert(schema.races).values({
        id: raceId,
        name: input.name,
        date: input.date,
        status: 'upcoming',
        createdAt: now,
        updatedAt: now,
      });

      // auto-create the 1:1 race plan
      await db.insert(schema.racePlans).values({
        id: planId,
        raceId,
        silent: false,
        alarmSound: 'default',
      });

      return raceId;
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: RACES_KEY});
    },
  });
}

type UpdateRaceInput = {
  id: string;
  name: string;
  date: string;
};

export function useUpdateRace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (input: UpdateRaceInput) {
      return db
        .update(schema.races)
        .set({
          name: input.name,
          date: input.date,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.races.id, input.id));
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: RACES_KEY});
    },
  });
}

export function useArchiveRace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (id: string) {
      return db
        .update(schema.races)
        .set({status: 'archived', updatedAt: new Date().toISOString()})
        .where(eq(schema.races.id, id));
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: RACES_KEY});
    },
  });
}

export function useDeleteRace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (id: string) {
      return db.delete(schema.races).where(eq(schema.races.id, id));
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: RACES_KEY});
    },
  });
}
