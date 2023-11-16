import {ActiveBuff, MobStats, PlayerStats, State, WeaponStats, StatBuff, Rng, LogLineType, NextSpellLogic} from '../types';
import { TICKS_PER_SECOND } from '../util/time';
import { meleeDmg } from './melee-dmg';

export const createTick = (rng: Rng, getNextSpell: NextSpellLogic) => (state: State) => {
  state.t = state.t + 1;
  state.player.lastError = null;
  state.player.buffedStats = applyBuffToPlayerStats(
    state.player.unbuffedStats,
    accumulateBuffs(state.player.buffs),
    state.talents
  );
  state.enemy.buffedStats = applyBuffToEnemyStats(state.enemy.unbuffedStats, accumulateBuffs(state.enemy.buffs));

  state.player.cooldowns.global = Math.max(0, state.player.cooldowns.global - 1);

  progressEnergyRegen(state);
  progressMainHandSwing(state, rng);
  progressOffHandSwing(state, rng);

  for (let skill in state.player.cooldowns.skills) {
    state.player.cooldowns.skills[skill] -= 1;
  }

  progressPlayerBuffTimers(state);
  progressEnemyBuffTimers(state);

  const nextSpell = getNextSpell(state);
  nextSpell?.(state);
}

function progressOffHandSwing(state: State, rng: Rng) {
  state.player.cooldowns.ohSwing -= 1;
  if (state.player.cooldowns.ohSwing < 0) {
    meleeDmg(state, {
      yellow: false,
      offhand: true,
      critModifier: 2,
      rng,
      name: 'Main-hand auto-attack'
    });
    state.player.cooldowns.ohSwing = (state.player.buffedStats.oh.speed * TICKS_PER_SECOND) / state.player.buffedStats.meleeHaste;
  }
}

function progressMainHandSwing(state: State, rng: Rng) {
  state.player.cooldowns.mhSwing -= 1;
  if (state.player.cooldowns.mhSwing < 0) {
    meleeDmg(state, {
      yellow: false,
      offhand: false,
      critModifier: 2,
      rng,
      name: 'Off-hand auto-attack'
    });
    state.player.cooldowns.mhSwing = (state.player.buffedStats.mh.speed * TICKS_PER_SECOND) / state.player.buffedStats.meleeHaste;
  }
}

function progressEnergyRegen(state: State) {
  state.player.cooldowns.energyRegen -= 1;
  if (state.player.cooldowns.energyRegen < 0) {
    state.player.cooldowns.energyRegen = 2 * TICKS_PER_SECOND
    state.player.energy = Math.max(state.player.buffedStats.energyMax, state.player.energy + 20)
  }
}

function progressPlayerBuffTimers(state: State) {
  for (let i = 0; i < state.player.buffs.length; i++) {
    const buff = state.player.buffs[i];
    buff.duration -= 1;
    if (buff.duration < 0) {
      state.combatLog.push({ type: LogLineType.PlayerBuffFades, id: buff.id })
    } else {
      buff.onTick?.(state, buff.duration);
    }
  }
  state.player.buffs = state.player.buffs.filter(buff => buff.duration >= 0)
}

function progressEnemyBuffTimers(state: State) {
  for (let i = 0; i < state.enemy.buffs.length; i++) {
    const buff = state.enemy.buffs[i];
    buff.duration -= 1;
    if (buff.duration < 0) {
      state.combatLog.push({ type: LogLineType.EnemyBuffFades, id: buff.id })
    }
  }
  state.enemy.buffs = state.enemy.buffs.filter(buff => buff.duration <= 0)
}

function applyBuffToEnemyStats(stats: MobStats, buff: ActiveBuff): MobStats {
  return {
    armor: applyStatBuff(stats.armor, buff.additive.armor ?? 0, buff.multiplicitive.armor ?? 0),
    defense: stats.defense
  };
}

function applyStatBuff(base: number, additive: number, multiplicitive: number): number {
  return (base + additive) * (1 + multiplicitive);
}

function applyBuffToPlayerStats(stats: PlayerStats, buff: ActiveBuff, talents: State['talents']): PlayerStats {
  const agi = applyStatBuff(stats.agi ?? 0, buff.additive.agi ?? 0, buff.multiplicitive.agi ?? 0);
  const str = applyStatBuff(stats.str ?? 0, buff.additive.str ?? 0, buff.multiplicitive.str ?? 0);

  return {
    agi,
    ap: applyStatBuff((stats.ap ?? 0) + agi + str, buff.additive.ap ?? 0, buff.multiplicitive.ap ?? 0),
    crit: talents.malice[0] + applyStatBuff((stats.crit ?? 0) + + (agi / 29), buff.additive.crit ?? 0, buff.multiplicitive.crit ?? 0),
    hit: talents.precision[0] + applyStatBuff(stats.hit ?? 0, buff.additive.hit ?? 0, buff.multiplicitive.hit ?? 0),
    meleeHaste: applyStatBuff(stats.meleeHaste ?? 0, buff.additive.meleeHaste ?? 0, buff.multiplicitive.meleeHaste ?? 0),
    str,
    energyMax: stats.energyMax + (talents.vigor[0] === 1 ? 20 : 0),
    mh: {
      speed: stats.mh.speed,
      dmg: [
        stats.mh.dmg[0] + (buff.additive.mh?.dmg[0] ?? 0),
        stats.mh.dmg[1] + (buff.additive.mh?.dmg[1] ?? 0)
      ],
      onHit: stats.mh.onHit,
      skill: stats.mh.skill //todo: expertise
    },
    oh: {
      speed: stats.oh.speed,
      dmg: [
        stats.oh.dmg[0] + (buff.additive.oh?.dmg[0] ?? 0),
        stats.oh.dmg[1] + (buff.additive.oh?.dmg[1] ?? 0)
      ],
      onHit: stats.oh.onHit,
      skill: stats.oh.skill //todo: expertise
    }
  };
}

function mergeWeaponStatBuffs(next: WeaponStats| undefined, target: WeaponStats | undefined): WeaponStats | undefined {
  if (next === undefined) {
    return target;
  }

  if (target === undefined) {
    return {
      speed: next.speed,
      dmg: [next.dmg[0], next.dmg[1]],
      onHit: next.onHit,
      skill: next.skill
    }
  }

  target.dmg[0] += next.dmg[0];
  target.dmg[1] += next.dmg[1];
  target.onHit = next.onHit.length
    ? target.onHit.concat(next.onHit)
    : target.onHit
  target.skill += next.skill;
  return target;
}

function mergeStatBuffs(next: StatBuff, target: StatBuff): StatBuff {
  target.agi = (target.agi ?? 0) + (next.agi ?? 0)
  target.ap = (target.ap ?? 0) + (next.ap ?? 0)
  target.armor = (target.armor ?? 0) + (next.armor ?? 0)
  target.crit = (target.crit ?? 0) + (next.crit ?? 0)
  target.defense = (target.defense ?? 0) + (next.defense ?? 0)
  target.hit = (target.hit ?? 0) + (next.hit ?? 0)
  target.meleeHaste = (target.meleeHaste ?? 0) + (next.meleeHaste ?? 0)
  target.str = (target.str ?? 0) + (next.str ?? 0)

  target.oh = mergeWeaponStatBuffs(next.oh, target.oh);
  target.mh = mergeWeaponStatBuffs(next.mh, target.mh);

  return target;
}

const ACCUMULATED_BUFF = 'ACCUMULATED_BUFF';
function accumulateBuffs(buffs: ActiveBuff[]): ActiveBuff {
  const emptyBuff: ActiveBuff = {
    additive: {},
    multiplicitive: {},
    duration: 0,
    id: ACCUMULATED_BUFF
  }

  return buffs.reduce((acc, next) => {
    acc.additive = mergeStatBuffs(next.additive, acc.additive);
    acc.multiplicitive = mergeStatBuffs(next.multiplicitive, acc.multiplicitive);
    return acc;
  }, emptyBuff);
}
