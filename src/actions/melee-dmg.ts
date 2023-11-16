import { enforceExhaustive } from "../util/enforce-exhaustive";
import { LogLineType, Rng, State, SwingRoll } from "../types";
import { getSwingResult } from "./get-swing-result";

export type MeleeDmgArgs = {
  offhand: boolean;
  yellow: boolean;
  critModifier: number;
  name: string;
  rng: Rng;
}

const calculateGlancingDmg = (state: State, baseDmg: number, { offhand, yellow, rng }: MeleeDmgArgs) => {
  // https://github.com/magey/classic-warrior/wiki/Attack-table#glancing-blows
  // Low end: 1.3 - 0.05*(defense-skill) capped at 0.91
  // High end: 1.2 - 0.03*(defense-skill) min of 0.2 and capped at 0.99
  // Average Reduction: (high + low) / 2
  if (yellow) throw new Error('Yellow atk glancing?');
  const weapon = offhand ? state.player.buffedStats.oh : state.player.buffedStats.mh;
  const defense = state.enemy.level * 5;
  const lowEnd = Math.min(1.3 - 0.05 * (defense - weapon.skill), 0.91)
  const highEnd = Math.max(Math.min(1.2 - 0.03 * (defense - weapon.skill), 0.99), 0.2)
  return ~~(baseDmg * rng.nextFloat(lowEnd, highEnd));
}

const calculateMeleeDmg = (
  swingResult: SwingRoll,
  state: State,
  args: MeleeDmgArgs,
  calculateDmg: (state: State, args: MeleeDmgArgs, weaponBaseDmg: number) => number,
): number => {
  const baseDmg = calculateDmg(state, args, calculateAutoAttackBaseDmg(state, args));
  const { critModifier } = args;
  switch (swingResult) {
    case SwingRoll.Crit:
      return ~~(baseDmg * critModifier);
    case SwingRoll.Hit:
      return ~~baseDmg;
    case SwingRoll.Miss:
      return 0;
    case SwingRoll.Dodge:
    case SwingRoll.Parry:
      return 0;
    case SwingRoll.Block:
      throw new Error('Not yet implemented');
    case SwingRoll.Glancing:
      return ~~calculateGlancingDmg(state, baseDmg, args)
    default:
      return enforceExhaustive(swingResult)
  }
}

export type CalculateBaseDmg = (state: State, args: MeleeDmgArgs, baseWeaponDmg: number) => number;

const calculateAutoAttackBaseDmg = (state: State, args: MeleeDmgArgs): number => {
  const weapon = args.offhand ? state.player.buffedStats.oh : state.player.buffedStats.mh;
  const baseModifier = args.offhand ? .5 + (.1 * state.talents.dualWieldSpecialization[0]) : 1;
  return args.rng.nextInt(...weapon.dmg) * baseModifier
}

export const meleeDmg = (
  state: State,
  args: MeleeDmgArgs,
  calculateBaseDmg: CalculateBaseDmg = calculateAutoAttackBaseDmg,
  swingRoll: SwingRoll = getSwingResult(state, args),
): void => {
  const dmg = calculateMeleeDmg(swingRoll, state, args, calculateBaseDmg);
  state.combatLog.push({
    dmg,
    name: args.name,
    type: args.yellow
      ? LogLineType.YellowDmg
      : LogLineType.WhiteDmg,
    roll: swingRoll,
  });
}
