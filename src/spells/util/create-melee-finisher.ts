import { getSwingResult } from "../../actions/get-swing-result";
import { Rng, Spell, State, SwingRoll } from "../../types";
import { isMeleeSwingResultHit } from "../../util/is-melee-swing-result-hit";
import {createWithRequirements, WithRequirementsArgs} from './create-with-requirements';

export type WithFinisherArgs = Omit<WithRequirementsArgs, 'requiresCp'> & {
  cost?: number | ((state: State) => number);
  rng: Rng;
};

/**
 * Sets combo points to zero if and only if the base spell hits.
 * Pays energy cost after the spell is cast.
 */
export const createMeleeFinisher = ({
  cost = 0,
  rng,
  ...args
}: WithFinisherArgs,
  base: (state: State, swingRoll: SwingRoll) => void
) => (state: State) => {
    const finalCost = typeof cost === 'number'
      ? cost
      : cost(state);

    createWithRequirements({
      ...args,
      cost: finalCost,
      requiresCp: true
    }, (state: State) => {
      const swingResult = getSwingResult(state, { offhand: false, yellow: true, rng });
      base(state, swingResult);
      if (isMeleeSwingResultHit(swingResult)) {
        state.player.comboPoints = 0;
      }
      state.player.energy -= finalCost;
    });
  };

