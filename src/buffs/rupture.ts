import { ActiveBuff, LogLineType, School, State, SwingRoll, Tick } from "../types";
import { TICKS_PER_SECOND } from "../util/time";

type CreateDoTArgs = {
  name: string;
  dmgPerTrigger: number;
  ticksPerTrigger: Tick;
  school: School;
}

const createDoT = ({
  name,
  dmgPerTrigger,
  ticksPerTrigger
}: CreateDoTArgs) => (state: State, duration: Tick) => {
  if (duration % ticksPerTrigger !== 0) {
    return;
  }

  // TODO: schools + hits + resists

  state.combatLog.push({
    type: LogLineType.YellowDmg,
    name,
    dmg: dmgPerTrigger,
    roll: SwingRoll.Hit
  });
}

const NAME = 'Rupture';
export const RUPTURE_BUFF_ID = 'RUPTURE_BUFF_ID';
export const createRuptureBuff = (totalDamage: number, duration: Tick): ActiveBuff => {
  const ticksPerTrigger = 3 * TICKS_PER_SECOND;
  const numTriggers = ~~(duration / ticksPerTrigger);
  const dmgPerTrigger = ~~(totalDamage / numTriggers);
  return {
    id: RUPTURE_BUFF_ID,
    additive: {},
    multiplicitive: {},
    duration,
    onTick: createDoT({name: NAME, dmgPerTrigger, ticksPerTrigger, school: School.Physical })
  }
}
