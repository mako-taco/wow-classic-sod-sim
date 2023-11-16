import { SLICE_AND_DICE_BUFF_ID, createSliceAndDiceBuff } from "../buffs/slice-and-dice";
import { BuffID, State } from "../types";
import { TICKS_PER_SECOND } from "../util/time";
import { createNonMeleeFinisher } from "./util/create-non-melee-finisher";
import { createWithRequirements } from "./util/create-with-requirements";
import { NOT_ENOUGH_ENERGY, NOT_READY_YET, NO_COMBO_POINTS } from "./util/errors";

const COST = 25;
export const SLICE_AND_DICE_SPELL_ID = 'SLICE_AND_DICE_SPELL_ID';

export const createSliceAndDice = () => createNonMeleeFinisher({
  id: SLICE_AND_DICE_BUFF_ID,
}, (state: State) => {
  state.player.buffs = state.player.buffs
    .filter(buff => buff.id !== SLICE_AND_DICE_BUFF_ID)
    .concat(createSliceAndDiceBuff(state));
})
