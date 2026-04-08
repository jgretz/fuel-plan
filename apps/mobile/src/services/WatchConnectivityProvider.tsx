import {useEffect, useState, useCallback, type ReactNode} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {
  watchEvents,
  getReachability,
  getIsPaired,
  getIsWatchAppInstalled,
  updateApplicationContext,
} from 'react-native-watch-connectivity';

import type {WatchPlanPayload} from '@fuel-plan/types';

import {db, schema} from '../db';
import {WatchConnectivityContext, type WatchStatus} from './watchConnectivity';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type Props = {
  children: ReactNode;
};

export default function WatchConnectivityProvider({children}: Props) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<WatchStatus>({
    isPaired: false,
    isReachable: false,
    isWatchAppInstalled: false,
  });

  useEffect(function () {
    Promise.all([getIsPaired(), getReachability(), getIsWatchAppInstalled()]).then(
      function ([isPaired, isReachable, isWatchAppInstalled]) {
        setStatus({isPaired, isReachable, isWatchAppInstalled});
      },
    );

    const reachSub = watchEvents.on('reachability', function (reachable) {
      setStatus(function (prev) {
        return {...prev, isReachable: reachable};
      });
    });

    const userInfoSub = watchEvents.on('user-info', function (userInfo: Record<string, unknown>) {
      console.log('[WatchConnectivity] Received user-info:', JSON.stringify(userInfo));
      if (userInfo && 'raceId' in userInfo && 'startedAt' in userInfo) {
        saveExecutionLog(userInfo)
          .then(function () {
            console.log('[WatchConnectivity] Execution log saved');
            queryClient.invalidateQueries({queryKey: ['execution-log']});
            queryClient.invalidateQueries({queryKey: ['races']});
          })
          .catch(function (err) {
            console.error('[WatchConnectivity] Failed to save execution log:', err);
          });
      }
    });

    return function () {
      reachSub();
      userInfoSub();
    };
  }, [queryClient]);

  const sendPlanToWatch = useCallback(function (payload: WatchPlanPayload) {
    updateApplicationContext(payload as unknown as Record<string, unknown>);
  }, []);

  return (
    <WatchConnectivityContext.Provider value={{status, sendPlanToWatch, onExecutionLogReceived: null}}>
      {children}
    </WatchConnectivityContext.Provider>
  );
}

async function saveExecutionLog(payload: Record<string, unknown>) {
  const raceId = payload.raceId as string;
  const startedAt = payload.startedAt as string;
  const finishedAt = payload.finishedAt as string;
  const pauseDurationSeconds = (payload.pauseDurationSeconds as number) ?? 0;
  const entries = (payload.entries as Array<Record<string, unknown>>) ?? [];

  const logId = generateId();

  await db.insert(schema.executionLogs).values({
    id: logId,
    raceId,
    startedAt,
    finishedAt,
    pauseDurationSeconds,
  });

  for (const entry of entries) {
    await db.insert(schema.executionEntries).values({
      id: generateId(),
      logId,
      planEntryId: entry.planEntryId as string,
      status: (entry.status as string) ?? 'pending',
      actualTimeSeconds: (entry.actualTimeSeconds as number) ?? null,
    });
  }

  // mark race as finished
  const {eq} = await import('drizzle-orm');
  await db
    .update(schema.races)
    .set({status: 'finished', updatedAt: new Date().toISOString()})
    .where(eq(schema.races.id, raceId));
}
