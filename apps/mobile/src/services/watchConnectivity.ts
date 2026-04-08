import {createContext, useContext} from 'react';

import type {WatchPlanPayload, WatchExecutionPayload} from '@fuel-plan/types';

export type WatchStatus = {
  isPaired: boolean;
  isReachable: boolean;
  isWatchAppInstalled: boolean;
};

export type WatchConnectivityContextValue = {
  status: WatchStatus;
  sendPlanToWatch: (payload: WatchPlanPayload) => void;
  onExecutionLogReceived: ((payload: WatchExecutionPayload) => void) | null;
};

const defaultStatus: WatchStatus = {
  isPaired: false,
  isReachable: false,
  isWatchAppInstalled: false,
};

export const WatchConnectivityContext = createContext<WatchConnectivityContextValue>({
  status: defaultStatus,
  sendPlanToWatch: function () {},
  onExecutionLogReceived: null,
});

export function useWatchConnectivity(): WatchConnectivityContextValue {
  return useContext(WatchConnectivityContext);
}
