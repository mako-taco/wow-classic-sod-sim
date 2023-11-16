import { State } from "../types";

export const diff = (a: {}, b: {}) => {
  return Object.fromEntries(Object.entries(a)
    .filter(([key, valA]) => {
      const valB = (b as any)[key];
      return valA !== valB;
    }))
}
