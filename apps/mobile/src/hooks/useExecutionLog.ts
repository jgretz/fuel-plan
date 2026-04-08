import {useQuery} from '@tanstack/react-query';
import {eq} from 'drizzle-orm';

import {db, schema} from '../db';

const EXECUTION_LOG_KEY = ['execution-log'] as const;

export function useExecutionLog(raceId: string) {
  return useQuery({
    queryKey: [...EXECUTION_LOG_KEY, raceId],
    queryFn: async function () {
      const log = db
        .select()
        .from(schema.executionLogs)
        .where(eq(schema.executionLogs.raceId, raceId))
        .get();

      if (!log) return null;

      const entries = db
        .select()
        .from(schema.executionEntries)
        .where(eq(schema.executionEntries.logId, log.id))
        .all();

      return {...log, entries};
    },
  });
}
