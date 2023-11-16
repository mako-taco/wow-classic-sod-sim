import { Rng } from "./types";
import { aleaPRNG } from "./alea-rng";

export const createRng = (seed: number): Rng => new AleaRng(seed);

class AleaRng implements Rng {
  private readonly prng: () => number;

  constructor(seed: number) {
    this.prng = aleaPRNG(String(seed));
  }

  next(): number {
    return this.prng();
  }

  nextInt(minInclusive: number, maxExclusive: number): number {
    if (minInclusive > maxExclusive) throw new Error('Bad args to rng');
    return Math.floor(this.prng() * (maxExclusive - minInclusive) + minInclusive)
  }

  nextFloat(min: number, max: number): number {
    return this.prng() * (max - min) + min
  }
}
