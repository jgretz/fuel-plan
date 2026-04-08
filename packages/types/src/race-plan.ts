export type PlanEntryFuelSource = {
  planEntryId: string;
  fuelSourceId: string;
};

export type PlanEntry = {
  id: string;
  planId: string;
  timeMinutes: number;
  sortOrder: number;
};

export type RacePlan = {
  id: string;
  raceId: string;
  silent: boolean;
  alarmSound: string;
};

export type PlanSummary = {
  totalCalories: number;
  totalCarbs: number;
  entryCount: number;
  durationMinutes: number;
};
