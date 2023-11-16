import { SwingRoll } from "../types";

const IS_HIT = {
  [SwingRoll.Hit]: true,
  [SwingRoll.Crit]: true,
  [SwingRoll.Glancing]: true,
  [SwingRoll.Block]: true,

  [SwingRoll.Parry]: false,
  [SwingRoll.Dodge]: false,
  [SwingRoll.Miss]: false,
}

export const isMeleeSwingResultHit = (roll: SwingRoll): boolean => IS_HIT[roll];
