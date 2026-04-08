export type RotationStrategy = 'round-robin' | 'all-each-time';

export type SchedulePattern = {
  intervalMinutes: number;
  startMinutes: number;
  fuelSourceIds: string[];
  iterations: number;
  rotationStrategy: RotationStrategy;
};

export type GeneratedEntry = {
  timeMinutes: number;
  fuelSourceIds: string[];
};

export function buildSchedule(pattern: SchedulePattern): GeneratedEntry[] {
  const {intervalMinutes, startMinutes, fuelSourceIds, iterations, rotationStrategy} = pattern;

  if (iterations <= 0 || fuelSourceIds.length === 0) {
    return [];
  }

  return Array.from({length: iterations}, (_, i) => ({
    timeMinutes: startMinutes + i * intervalMinutes,
    fuelSourceIds:
      rotationStrategy === 'all-each-time'
        ? [...fuelSourceIds]
        : [fuelSourceIds[i % fuelSourceIds.length]!],
  }));
}

export function mergeSchedules(schedules: GeneratedEntry[][]): GeneratedEntry[] {
  const byTime = new Map<number, Set<string>>();

  for (const schedule of schedules) {
    for (const entry of schedule) {
      const existing = byTime.get(entry.timeMinutes);
      if (existing) {
        for (const id of entry.fuelSourceIds) {
          existing.add(id);
        }
      } else {
        byTime.set(entry.timeMinutes, new Set(entry.fuelSourceIds));
      }
    }
  }

  return Array.from(byTime.entries())
    .sort(([a], [b]) => a - b)
    .map(([timeMinutes, ids]) => ({
      timeMinutes,
      fuelSourceIds: [...ids],
    }));
}
