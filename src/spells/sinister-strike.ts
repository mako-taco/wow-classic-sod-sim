import { Rng, Spell, State, SwingRoll } from "../types";
import { meleeDmg } from "../actions/melee-dmg";
import {isMeleeSwingResultHit} from '../util/is-melee-swing-result-hit';
import { createCpGenerator } from "./util/create-cp-generator";

const COST_WITH_IMP_SS = [
  45,
  42,
  40
];

const getBonusDmgForLevel = (level: number) => {
  if (level >= 54) return 68;
  if (level >= 46) return 52;
  if (level >= 38) return 33;
  if (level >= 30) return 22;
  if (level >= 22) return 15;
  if (level >= 14) return 10;
  if (level >= 6) return 6;
  return 3;
}
const SINISTER_STRIKE_SPELL_ID = 'SINISTER_STRIKE_SPEL_ID';

export const createSinisterStrike = (rng: Rng): Spell => createCpGenerator({
  id: SINISTER_STRIKE_SPELL_ID,
  cost: (state: State) => COST_WITH_IMP_SS[state.talents.improvedSinisterStrike[0]],
  rng,
  numCp: 1,
}, (state: State, swingRoll: SwingRoll): void => {

  meleeDmg(
    state,
    {
      yellow: true,
      offhand: false,
      critModifier: 2 + (state.talents.lethality[0] * 0.06),
      rng,
      name: 'Sinister Strike'
    },
    (state, _, weaponBaseDmg) => weaponBaseDmg + getBonusDmgForLevel(state.player.level),
    swingRoll,
  )

  if (isMeleeSwingResultHit(swingRoll)) {
    state.player.comboPoints = Math.min(5, state.player.comboPoints + 1)
  }

})
