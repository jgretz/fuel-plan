export type EntryStatus = 'taken' | 'skipped' | 'pending';

export type ExecutionEntry = {
  id: string;
  logId: string;
  planEntryId: string;
  status: EntryStatus;
  actualTimeSeconds: number | null;
};

export type ExecutionLog = {
  id: string;
  raceId: string;
  startedAt: string;
  finishedAt: string | null;
  pauseDurationSeconds: number;
};
