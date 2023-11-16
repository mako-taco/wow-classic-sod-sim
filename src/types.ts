import { AppDispatch } from "./store";

export type Tick = number;
export type SpellID = string;
export type BuffID = string;

export type Percent = number;

// all times are in Ticks, which are 0.1 seconds
export type State = {
  // current tick of sim
  t: Tick,

  enemy: {
    level: number;
    unbuffedStats: MobStats;
    buffedStats: MobStats;
    buffs: ActiveBuff[];
  }

  player: {

    lastError: string | null;

    cooldowns: {
      global: Tick;
      energyRegen: Tick;
      mhSwing: Tick;
      ohSwing: Tick;
      skills: Record<SpellID, Tick>;
    }

    comboPoints: number;
    energy: number;
    level: number;
    isDualWield: boolean;
    unbuffedStats: PlayerStats;
    buffedStats: PlayerStats;
    buffs: ActiveBuff[];
  }

  talents: {
    sealFate: [number, 5];
    vigor: [number, 1];
    dualWieldSpecialization: [number, 5];
    improvedEviscerate: [number, 3];
    malice: [number, 5];
    precision: [number, 5];
    ruthlessness: [number, 3];
    murder: [number, 2];
    improvedSliceAndDice: [number, 3];
    relentlessStrikes: [number, 1];
    improvedExposeArmor: [number, 1];
    lethality: [number, 5];
    improvedSinisterStrike: [number, 2];
    improvedBackstab: [number, 3];
    deflection: [number, 5];
    riposte: [number, 1];
    daggerSpecialization: [number, 5];
    maceSpecialization: [number, 5];
    swordSpecialization: [number, 5];
    fistSpecialization: [number, 5];
    weaponExpertise: [number, 2];
    aggression: [number, 3];
    addrenalineRush: [number, 1];
    opportunity: [number, 5];
    ghostlyStrike: [number, 1];
    setup: [number, 3];
    serratedBlades: [number, 3];
  }

  combatLog: LogLine[];

}

export enum SwingRoll {
  Miss = 'Miss',
  Dodge = 'Dodge',
  Glancing = 'Glancing',
  Parry = 'Parry',
  Block = 'Block',
  Crit = 'Crit',
  Hit = 'Hit',
}

export enum LogLineType {
  WhiteDmg,
  YellowDmg,
  PlayerApplyBuffToTarget,
  PlayerApplyBuffToSelf,
  PlayerBuffFades,
  EnemyBuffFades,
};

export type LogLine =
  | { type: LogLineType.WhiteDmg; dmg: number; roll: SwingRoll; name: string; }
  | { type: LogLineType.YellowDmg; dmg: number; roll: SwingRoll; name: string; }
  | { type: LogLineType.PlayerApplyBuffToSelf; id: BuffID; }
  | { type: LogLineType.PlayerBuffFades; id: BuffID; }
  | { type: LogLineType.EnemyBuffFades; id: BuffID; }
  | { type: LogLineType.PlayerApplyBuffToTarget; id: BuffID; }
  ;

export type OnHit = {
  chance: number;
  id: SpellID;
}

export type StatBuff = Partial<MobStats> & Partial<PlayerStats>

export type ActiveBuff = {
  id: BuffID;
  duration: Tick;
  additive: Partial<StatBuff>;
  multiplicitive: Partial<StatBuff>;
  onTick?: (state: State, duration: Tick) => void;
  isPoison?: boolean;
}

export type MobStats = {
  armor: number;
  defense: number;
}

export type PlayerStats = {
  agi: number;
  str: number;
  ap: number;
  crit: Percent;
  hit: Percent;
  mh: WeaponStats;
  oh: WeaponStats;
  meleeHaste: number;
  energyMax: number;
}

export type WeaponStats = {
  dmg: [number, number];
  speed: number;
  skill: number;
  onHit: OnHit[]
}

export interface Rng {
  next(): number;
  nextFloat(min: number, max: number): number;
  nextInt(minInclusive: number, maxExclusive: number): number;
}

export type Spell = (state: State) => void;

export type NextSpellLogic = (state: State) => Spell | null;

export enum School {
  Physical,
  Nature,
  Frost,
  Shadow,
  Holy,
  Fire
}
