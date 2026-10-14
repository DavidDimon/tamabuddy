import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  getHatchDeadline,
  type EngineCommandResult,
} from '@tamabuddy/tamabuddy-engine';

import type { DesktopPetAction } from '../../../entities/pet/index.js';
import {
  resolveMascotReaction,
  type MascotReaction,
} from '../../mascot/index.js';
import { toDesktopPet, toTamabuddyCommand } from '../model/toDesktopPet.js';
import { tamabuddyDesktopClient } from '../services/TamabuddyDesktopClient.js';

const REFRESH_INTERVAL_MS = 30_000;
const REACTION_DURATION_MS = 1_500;
const EVOLUTION_DURATION_MS = 2_500;

export interface DesktopReaction {
  readonly key: MascotReaction;
  readonly sequence: number;
}

export function useTamabuddyDesktop() {
  const snapshot = useSyncExternalStore(
    tamabuddyDesktopClient.subscribe,
    tamabuddyDesktopClient.getSnapshot,
    tamabuddyDesktopClient.getSnapshot,
  );
  const [reaction, setReaction] = useState<DesktopReaction | null>(null);
  const reactionSequence = useRef(0);
  const previousStage = useRef(snapshot.state.stage);

  const showReaction = useCallback((key: MascotReaction) => {
    reactionSequence.current += 1;
    setReaction({ key, sequence: reactionSequence.current });
  }, []);

  const dispatch = useCallback(
    async (action: DesktopPetAction): Promise<EngineCommandResult> => {
      const command = toTamabuddyCommand(action);
      const result = await tamabuddyDesktopClient.dispatch(command);
      const nextReaction = resolveMascotReaction(action, result.accepted);
      if (nextReaction !== null) showReaction(nextReaction);
      return result;
    },
    [showReaction],
  );

  const refresh = useCallback(() => tamabuddyDesktopClient.refresh(), []);
  const hatchNow = useCallback(async () => {
    const result = await tamabuddyDesktopClient.hatchNow();
    if (result.hatched) showReaction('evolving');
    return result;
  }, [showReaction]);
  const reset = useCallback(async () => {
    setReaction(null);
    await tamabuddyDesktopClient.reset();
  }, []);

  useEffect(() => {
    const requestRefresh = () => {
      void refresh().catch(() => undefined);
    };
    const interval = window.setInterval(requestRefresh, REFRESH_INTERVAL_MS);
    window.addEventListener('focus', requestRefresh);
    requestRefresh();

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', requestRefresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (snapshot.state.stage === previousStage.current) return;
    previousStage.current = snapshot.state.stage;
    showReaction('evolving');
  }, [showReaction, snapshot.state.stage]);

  useEffect(() => {
    if (reaction === null) return;
    const duration =
      reaction.key === 'evolving'
        ? EVOLUTION_DURATION_MS
        : REACTION_DURATION_MS;
    const timeout = window.setTimeout(() => setReaction(null), duration);
    return () => window.clearTimeout(timeout);
  }, [reaction]);

  useEffect(() => {
    const cancelReaction = () => setReaction(null);
    window.addEventListener('blur', cancelReaction);
    return () => window.removeEventListener('blur', cancelReaction);
  }, []);

  return {
    ...snapshot,
    dispatch,
    hatchDeadline: getHatchDeadline(snapshot.state),
    hatchNow,
    refresh,
    reaction,
    reset,
    state: toDesktopPet(snapshot.state),
  };
}
