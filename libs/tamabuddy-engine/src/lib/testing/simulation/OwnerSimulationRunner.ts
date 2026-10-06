import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import { TamabuddyState } from '../../domain/models/TamabuddyState.js';
import { assertDuration } from './durations.js';
import {
  LifeSimulationRunner,
  ScheduledCommand,
} from './LifeSimulationRunner.js';
import { LifeTimeline } from './LifeTimeline.js';
import {
  assertOwnerCommand,
  cloneScheduledCommand,
  OwnerStrategy,
} from './strategies/OwnerStrategy.js';

export interface OwnerSimulationPlan {
  readonly initial: Tamabuddy | TamabuddyState;
  readonly owner: OwnerStrategy;
  readonly until: number;
}

const MAXIMUM_PROPOSALS = 10_000;

export class OwnerSimulationRunner {
  async run(plan: OwnerSimulationPlan): Promise<LifeTimeline> {
    assertDuration(plan.until, 'owner simulation until');
    const runner = new LifeSimulationRunner();
    const proposals: ScheduledCommand[] = [];
    let timeline = await runner.run({
      initial: plan.initial,
      commands: proposals,
      until: plan.until,
    });

    while (proposals.length < MAXIMUM_PROPOSALS) {
      const proposal = plan.owner.propose({
        timeline,
        proposals: proposals.map(cloneScheduledCommand),
        until: plan.until,
      });
      if (proposal === null) return timeline;
      validateProposal(proposal, proposals, timeline, plan.until);
      proposals.push(cloneScheduledCommand(proposal));
      timeline = await runner.run({
        initial: plan.initial,
        commands: proposals,
        until: plan.until,
      });
    }

    throw new RangeError(
      `Owner strategy ${plan.owner.name} exceeded ${MAXIMUM_PROPOSALS} proposals`,
    );
  }
}

function validateProposal(
  proposal: ScheduledCommand,
  previous: readonly ScheduledCommand[],
  timeline: LifeTimeline,
  until: number,
): void {
  assertDuration(proposal.at, 'owner proposal time');
  assertOwnerCommand(proposal.command);
  const lastAt = previous.at(-1)?.at ?? 0;
  if (proposal.at < lastAt) {
    throw new RangeError('Owner proposals must be monotonic');
  }
  if (proposal.at > until) {
    throw new RangeError('Owner proposal exceeds the simulation duration');
  }
  const death = timeline.events('died')[0];
  if (
    timeline.at(proposal.at).behavior === 'dead' ||
    (death !== undefined && proposal.at >= death.offset)
  ) {
    throw new RangeError('Owner cannot propose commands after death');
  }
}
