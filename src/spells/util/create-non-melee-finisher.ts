import { getSwingResult } from "../../actions/get-swing-result";
import { Rng, Spell, State, SwingRoll } from "../../types";
import { isMeleeSwingResultHit } from "../../util/is-melee-swing-result-hit";
import {createWithRequirements, WithRequirementsArgs} from './create-with-requirements';

export type WithFinisherArgs = Omit<WithRequirementsArgs, 'requiresCp'> & {
  cost?: number | ((state: State) => number);
};

/**
 * Removes combo points if and only if the spell is cast.
 * Pays energy cost after the spell is cast.
 */
export const createNonMeleeFinisher = ({
  cost = 0,
  ...args
}: WithFinisherArgs,
  base: (state: State) => void
) => (state: State) => {
    const finalCost = typeof cost === 'number'
      ? cost
      : cost(state);

    createWithRequirements({
      ...args,
      cost: finalCost,
      requiresCp: true
    }, (state: State) => {
      base(state);
      state.player.comboPoints = 0;
      state.player.energy -= finalCost;
    })(state);
  };

