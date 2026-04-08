// Phone -> Watch: denormalized plan for offline use
export type WatchFuelSource = {
  name: string;
  calories: number;
  carbs: number;
};

export type WatchPlanEntry = {
  id: string;
  timeMinutes: number;
  sortOrder: number;
  fuelSources: WatchFuelSource[];
};

export type WatchPlanPayload = {
  raceId: string;
  raceName: string;
  raceDate: string;
  silent: boolean;
  alarmSound: string;
  entries: WatchPlanEntry[];
};

// Watch -> Phone: execution results
export type WatchExecutionEntry = {
  planEntryId: string;
  status: 'taken' | 'skipped';
  actualTimeSeconds: number | null;
};

export type WatchExecutionPayload = {
  raceId: string;
  startedAt: string;
  finishedAt: string;
  pauseDurationSeconds: number;
  entries: WatchExecutionEntry[];
};
