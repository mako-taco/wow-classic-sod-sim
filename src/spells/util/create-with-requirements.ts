import { Spell, SpellID, State } from "../../types";
import {NOT_ENOUGH_ENERGY, NOT_READY_YET, NO_COMBO_POINTS} from './errors';
import {TICKS_PER_SECOND} from '../../util/time';

export type SpellRequirement<T> = T | ((state: State) => T);

export type WithRequirementsArgs = {
  id: SpellID;
  requiresCp?: boolean;
  offGcd?: boolean;
  cooldown?: SpellRequirement<number>;
  cost?: SpellRequirement<number>;
}

export const createWithRequirements = ({
  id,
  requiresCp = false,
  offGcd = false,
  cooldown = 0,
  cost = 0
}: WithRequirementsArgs, customLogic: Spell): Spell => (state) => {

  if (cost) {
    cost = typeof cost === 'number'
      ? cost
      : cost(state);
    if (state.player.energy < cost) {
      state.player.lastError = NOT_ENOUGH_ENERGY;
      return;
    }
  }

  if (!offGcd) {
    if (state.player.cooldowns.global > 0) {
      state.player.lastError = NOT_READY_YET;
      return;
    }
    state.player.cooldowns.global = TICKS_PER_SECOND;
  }

  if (cooldown) {
    cooldown = typeof cooldown === 'number'
      ? cooldown
      : cooldown(state);
    if (state.player.cooldowns.skills[id] > 0) {
      state.player.lastError = NOT_READY_YET;
      return;
    }
    state.player.cooldowns.skills[id] = cooldown;
  }

  if (requiresCp && state.player.comboPoints < 1) {
    state.player.lastError = NO_COMBO_POINTS;
    return;
  }

  customLogic(state);
}
