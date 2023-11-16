import {TICKS_PER_SECOND} from '../util/time';
import {State, BuffID, ActiveBuff} from '../types';

export const SLICE_AND_DICE_BUFF_ID: BuffID = 'SLICE_AND_DICE';

const getAttackSpeedModifierForLevel = (level: number): number => {
  if (level < 10) throw new Error('No possible rank');
  if (level < 42) return 0.20;
  return 0.30;
}

export const createSliceAndDiceBuff = (state: State): ActiveBuff => ({
  id: SLICE_AND_DICE_BUFF_ID,
  duration: (3 * state.player.comboPoints + 6) * TICKS_PER_SECOND,
  multiplicitive: {
    meleeHaste: getAttackSpeedModifierForLevel(state.player.level)
  },
  additive: {}
})
