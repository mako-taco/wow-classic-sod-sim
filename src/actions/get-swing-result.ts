import {Rng, State, SwingRoll} from '../types';

export type GetSwingResultArgs = {
  bonusCrit?: number;
  offhand: boolean;
  yellow: boolean;
  rng: Rng;
}

export const getSwingResult = (state: State, { offhand, yellow, rng, bonusCrit = 0 }: GetSwingResultArgs) => {
  const roll = rng.nextInt(0, 1000);
  const { hit, crit } = state.player.buffedStats;
  const weapon = offhand ? state.player.buffedStats.oh : state.player.buffedStats.mh;
  const defense = state.enemy.buffedStats.defense;

  const defenseSkillDelta = defense - weapon.skill;
  const isUnderskilled = defenseSkillDelta >= 11;

  // https://github.com/magey/classic-warrior/wiki/Attack-table#miss
  const skillGapMissChance = isUnderskilled
    ? 5 + defenseSkillDelta * 0.2
    : 5 + defenseSkillDelta * 0.1
    ;
  const dualWieldMissChance = state.player.isDualWield && !yellow
    ? 19
    : 0
    ;
  const hitFromAuras = state.player.unbuffedStats.hit - state.player.buffedStats.hit;
  const hitSupression = Math.max(
    isUnderskilled
      ? (defenseSkillDelta - 10) * 0.2
      : 0,
    hitFromAuras
  );
  const hitChance = Math.max(hit - hitSupression, 0)
  const missChance = Math.max(skillGapMissChance + dualWieldMissChance - hitChance, 0);

  // https://github.com/magey/classic-warrior/wiki/Attack-table#dodge
  const dodgeChance = Math.max(5 + defenseSkillDelta * 0.1, 0);

  // https://github.com/magey/classic-warrior/wiki/Attack-table#glancing-blows
  const cappedPlayerWeaponSkill = Math.min(state.player.level * 5, weapon.skill);
  const glancingChance = Math.max(yellow
    ? 0
    : 10 + (defense - cappedPlayerWeaponSkill) * 2, 0);

  // https://github.com/magey/classic-warrior/wiki/Attack-table#critical-strike
  // This is speculative, based on the 1.8% crit supression seen in mobs 3 levels above a player
  const critSupression = Math.max(state.enemy.level - state.player.level, 0) * 0.6
  const baseAttackRating = Math.min(state.player.level * 5, weapon.skill);
  const critChance = (
    baseAttackRating - defense < 0
      ? crit + (baseAttackRating - defense) * 0.2
      : crit + (baseAttackRating - defense) * 0.04
  ) + bonusCrit - critSupression;

  const table = {} as Record<SwingRoll, number>;
  table[SwingRoll.Miss] = ~~(missChance * 10);
  table[SwingRoll.Dodge] = table[SwingRoll.Miss] + ~~(dodgeChance * 10)
  table[SwingRoll.Glancing] = table[SwingRoll.Dodge] + ~~(glancingChance * 10)
  table[SwingRoll.Crit] = table[SwingRoll.Glancing] + ~~(critChance * 10)

  if (roll <= table[SwingRoll.Miss]) {
    return SwingRoll.Miss;
  }

  if (roll <= table[SwingRoll.Dodge]) {
    return SwingRoll.Dodge;
  }

  if (roll <= table[SwingRoll.Glancing]) {
    return SwingRoll.Glancing;
  }

  if (roll <= table[SwingRoll.Crit]) {
    return SwingRoll.Crit;
  }

  return SwingRoll.Hit;

}
