import { SLICE_AND_DICE_BUFF_ID } from '../buffs/slice-and-dice';
import { AllSpells } from '../spells/util/create-spells';
import { State } from '../types';

export const createDefaultLogic = (spells: AllSpells) => (state: State) => {
  const { sinisterStrike, sliceAndDice, mutilate } = spells;
  if (state.player.comboPoints === 0) return mutilate;

  const activeBuff = state.player.buffs.find(buff => buff.id === SLICE_AND_DICE_BUFF_ID);
  if (!activeBuff) return sliceAndDice;
  if (state.player.energy >= 85) return mutilate;
  return null;
}
