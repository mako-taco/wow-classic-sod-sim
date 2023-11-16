import { Rng } from "../../types";
import { createMutilate } from "../mutilate";
import { createRupture } from "../rupture";
import { createSinisterStrike } from "../sinister-strike";
import { createSliceAndDice } from "../slice-and-dice";

export const createSpells = (rng: Rng) => ({
  sliceAndDice: createSliceAndDice(),
  sinisterStrike: createSinisterStrike(rng),
  rupture: createRupture(rng),
  mutilate: createMutilate(rng),
})

export type AllSpells = ReturnType<typeof createSpells>;
