import { getSwingResult } from "../../actions/get-swing-result";
import { Rng, State, SwingRoll } from "../../types";
import { isMeleeSwingResultHit } from "../../util/is-melee-swing-result-hit";
import {createWithRequirements, WithRequirementsArgs} from './create-with-requirements';

export type WithCpGeneratorArgs = Omit<WithRequirementsArgs, 'requiresCp'> & {
  numCp?: number;
  cost?: number | ((state: State) => number);
  rng: Rng;
};

/**
 * Adds combo points if and only if the spell hits. Accounts for Seal Fate.
 * Pays energy cost after the spell is cast, but only pays 20% of the energy cost if the spell misses.
 */
export const createCpGenerator = ({
  rng,
  numCp = 1,
  cost = 0,
  ...args
}: WithCpGeneratorArgs,
  base: (state: State, swingRoll: SwingRoll) => void
) => (state: State) => {
    const finalCost = typeof cost === 'number'
      ? cost
      : cost(state);

    createWithRequirements({
      ...args,
      cost: finalCost,
      requiresCp: false
    }, (state: State) => {
      const swingResult = getSwingResult(state, { offhand: false, yellow: true, rng });
      base(state, swingResult);
      if (isMeleeSwingResultHit(swingResult)) {
        const bonusCp = state.talents.sealFate[0]
          && swingResult === SwingRoll.Crit
          && rng.next() < (state.talents.sealFate[0] * 0.2)
          ? 1
          : 0;

        state.player.comboPoints = Math.min(5, state.player.comboPoints + numCp + bonusCp)
        state.player.energy -= finalCost;
      } else {
        state.player.energy -= ~~(.2 * finalCost)
      }
    })(state);
  };

