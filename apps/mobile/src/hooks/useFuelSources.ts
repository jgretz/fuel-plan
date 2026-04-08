import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {eq} from 'drizzle-orm';

import {db, schema} from '../db';

const FUEL_SOURCES_KEY = ['fuel-sources'] as const;

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useFuelSources() {
  return useQuery({
    queryKey: FUEL_SOURCES_KEY,
    queryFn: function () {
      return db.select().from(schema.fuelSources).all();
    },
  });
}

export function useFuelSource(id: string) {
  return useQuery({
    queryKey: [...FUEL_SOURCES_KEY, id],
    queryFn: function () {
      return db
        .select()
        .from(schema.fuelSources)
        .where(eq(schema.fuelSources.id, id))
        .get();
    },
  });
}

type CreateFuelSourceInput = {
  name: string;
  calories: number;
  carbs: number;
};

export function useCreateFuelSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (input: CreateFuelSourceInput) {
      const now = new Date().toISOString();
      return db.insert(schema.fuelSources).values({
        id: generateId(),
        name: input.name,
        calories: input.calories,
        carbs: input.carbs,
        createdAt: now,
        updatedAt: now,
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: FUEL_SOURCES_KEY});
    },
  });
}

type UpdateFuelSourceInput = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
};

export function useUpdateFuelSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (input: UpdateFuelSourceInput) {
      return db
        .update(schema.fuelSources)
        .set({
          name: input.name,
          calories: input.calories,
          carbs: input.carbs,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.fuelSources.id, input.id));
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: FUEL_SOURCES_KEY});
    },
  });
}

export function useDeleteFuelSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (id: string) {
      return db.delete(schema.fuelSources).where(eq(schema.fuelSources.id, id));
    },
    onSuccess: function () {
      queryClient.invalidateQueries({queryKey: FUEL_SOURCES_KEY});
    },
  });
}
