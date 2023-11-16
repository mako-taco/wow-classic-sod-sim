import { Rng, School, Spell, State, SwingRoll } from "../types";
import { CalculateBaseDmg, meleeDmg } from "../actions/melee-dmg";
import {isMeleeSwingResultHit} from '../util/is-melee-swing-result-hit';
import { createCpGenerator } from "./util/create-cp-generator";
import { getSwingResult } from "../actions/get-swing-result";
import { createWithRequirements } from "./util/create-with-requirements";

const MUTILATE_SPELL_ID = 'MUTILATE_SPELL_ID';
const COST = 60;

export const createMutilate = (rng: Rng): Spell => createWithRequirements({
  id: MUTILATE_SPELL_ID,
  cost: COST,
}, (state: State): void => {

  const isEnemyPoisoned = state.enemy.buffs.find(buff => buff.isPoison);

  // todo: dont count opportunity when attacking from front
  const dmgMultiplier = 1
    + (isEnemyPoisoned ? 0.2 : 0)
    + (state.talents.opportunity[0] * 0.04);

  const calculateDmg: CalculateBaseDmg = (_, __, weaponBaseDmg) =>
    (weaponBaseDmg + 20) * dmgMultiplier;

  const mhArgs = {
    yellow: true,
    offhand: false,
    critModifier: 2 + (state.talents.lethality[0] * 0.06),
    bonusCrit: state.talents.improvedBackstab[0] * 10,
    rng,
    name: 'Mutilate'
  };

  const ohArgs = {
    ...mhArgs,
    offhand: true,
  };

  const mhSwingRoll = getSwingResult(state, mhArgs);
  meleeDmg(
    state,
    mhArgs,
    calculateDmg,
    mhSwingRoll,
  )

  const ohSwingResult = getSwingResult(state, ohArgs);
  meleeDmg(
    state,
    ohArgs,
    calculateDmg,
    ohSwingResult,
  )

  if (isMeleeSwingResultHit(mhSwingRoll) || isMeleeSwingResultHit(ohSwingResult)) {
    const bonusCp = (mhSwingRoll === SwingRoll.Crit || ohSwingResult === SwingRoll.Crit)
      && state.talents.sealFate[0]
      && rng.next() < state.talents.sealFate[0] * .2
      ? 1
      : 0;
    state.player.comboPoints = Math.min(5, state.player.comboPoints + 2 + bonusCp)
    state.player.energy -= COST;
  } else {
    state.player.energy -= ~~(.2 * COST)
  }

})
