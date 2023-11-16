import { ActiveBuff, Rng, State, SwingRoll } from "../types";
import {SLICE_AND_DICE_BUFF_ID, createSliceAndDiceBuff} from '../buffs/slice-and-dice';
import {TICKS_PER_SECOND} from '../util/time';
import {NOT_ENOUGH_ENERGY, NOT_READY_YET, NO_COMBO_POINTS} from './util/errors';
import { createWithRequirements } from "./util/create-with-requirements";
import { getSwingResult } from "../actions/get-swing-result";
import { isMeleeSwingResultHit } from "../util/is-melee-swing-result-hit";
import { createMeleeFinisher } from "./util/create-melee-finisher";
import { RUPTURE_BUFF_ID, createRuptureBuff } from "../buffs/rupture";

const COST = 30;
const RUPTURE_SPELL_ID = 'RUPTURE_SPELL_ID';

const getDuration = (cp: number): number => 6 + (2 * cp)

const RANK_BASE = [
  0,
  20,
  30,
  46,
  71,
  79,
  108,
] as const;

const getBaseDmg = (rank: number, cp: number) => {
  const rankCoef = (rank + 1) * 2;
  return RANK_BASE[rank] + rankCoef * cp
}

const getRankForLevel = (level: number): number => {
  if (level < 20) throw Error('No such rank')
  if (level < 28) return 1;
  if (level < 36) return 2;
  if (level < 44) return 3;
  if (level < 52) return 4;
  if (level < 60) return 5;
  return 6;
}

const getTotalDmg = (state: State) => {
  const rank = getRankForLevel(state.player.level);
  return getBaseDmg(rank, state.player.comboPoints) + ~~(state.player.buffedStats.ap * 0.24);
}

export const createRupture = (rng: Rng) => createMeleeFinisher({
  id: RUPTURE_SPELL_ID,
  cost: COST,
  rng,
}, (state: State) => {
  state.enemy.buffs.filter(buff => buff.id !== RUPTURE_BUFF_ID)
    .concat(
      createRuptureBuff(
        getTotalDmg(state),
        getDuration(state.player.comboPoints),
      )
    );
});
