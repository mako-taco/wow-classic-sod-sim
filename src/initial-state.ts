import { PlayerStats, State } from "./types";

const unbuffedStats: PlayerStats = {
  agi: 0,
  str: 0,
  ap: 0,
  crit: 0,
  hit: 0,
  energyMax: 100,
  mh: {
    dmg: [1, 10],
    speed: 2.5,
    skill: 125,
    onHit: [],
  },
  oh: {
    dmg: [1, 10],
    speed: 1.5,
    skill: 125,
    onHit: [],
  },
  meleeHaste: 1
};

const enemyUnbuffedStats = {
  armor: 0,
  defense: 28 * 5
}

export const initialState: State = {
  t: 0,
  enemy: {
    level: 28,
    unbuffedStats: enemyUnbuffedStats,
    buffedStats: enemyUnbuffedStats,
    buffs: []
  },
  player: {
    comboPoints: 0,
    lastError: null,
    cooldowns: {
      global: 0,
      energyRegen: 0,
      mhSwing: 0,
      ohSwing: 0,
      skills: {}
    },
    energy: 0,
    level: 25,
    isDualWield: false,
    unbuffedStats: unbuffedStats,
    buffedStats: unbuffedStats,
    buffs: []
  },
  talents: {
    sealFate: [0, 5],
    vigor: [0, 1],
    precision: [0, 5],
    dualWieldSpecialization: [0, 5],
    improvedEviscerate: [0, 3],
    malice: [0, 5],
    ruthlessness: [0, 3],
    murder: [0, 2],
    improvedSliceAndDice: [0, 3],
    relentlessStrikes: [0, 1],
    improvedExposeArmor: [0, 1],
    lethality: [0, 5],
    improvedSinisterStrike: [0, 2],
    improvedBackstab: [0, 3],
    deflection: [0, 5],
    riposte: [0, 1],
    daggerSpecialization: [0, 5],
    maceSpecialization: [0, 5],
    swordSpecialization: [0, 5],
    fistSpecialization: [0, 5],
    weaponExpertise: [0, 2],
    aggression: [0, 3],
    addrenalineRush: [0, 1],
    opportunity: [0, 5],
    ghostlyStrike: [0, 1],
    setup: [0, 3],
    serratedBlades: [0, 3],
  },
  combatLog: []
}
