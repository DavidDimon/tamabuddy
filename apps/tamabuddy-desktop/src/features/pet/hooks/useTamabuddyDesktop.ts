import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import type {
  EngineCommandResult,
  TamabuddyCommand,
} from '@tamabuddy/tamabuddy-engine';

import {
  resolveMascotReaction,
  type MascotReaction,
} from '../../mascot/resolveMascotReaction.js';
import { tamabuddyDesktopClient } from '../services/TamabuddyDesktopClient.js';

const REFRESH_INTERVAL_MS = 30_000;
const REACTION_DURATION_MS = 1_500;
const EVOLUTION_DURATION_MS = 2_500;

interface ActiveReaction {
  readonly key: MascotReaction;
  readonly sequence: number;
}

export function useTamabuddyDesktop() {
  const snapshot = useSyncExternalStore(
    tamabuddyDesktopClient.subscribe,
    tamabuddyDesktopClient.getSnapshot,
    tamabuddyDesktopClient.getSnapshot,
  );
  const [reaction, setReaction] = useState<ActiveReaction | null>(null);
  const reactionSequence = useRef(0);
  const previousStage = useRef(snapshot.state.stage);

  const showReaction = useCallback((key: MascotReaction) => {
    reactionSequence.current += 1;
    setReaction({ key, sequence: reactionSequence.current });
  }, []);

  const dispatch = useCallback(
    async (command: TamabuddyCommand): Promise<EngineCommandResult> => {
      const result = await tamabuddyDesktopClient.dispatch(command);
      const nextReaction = resolveMascotReaction(command, result.accepted);
      if (nextReaction !== null) showReaction(nextReaction);
      return result;
    },
    [showReaction],
  );

  useEffect(() => {
    const refresh = () => {
      void tamabuddyDesktopClient.refresh().catch(() => undefined);
    };
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    refresh();

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, []);

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
    reaction,
  };
}
