import rawCombatMasteries from "~/data/combatMasteries.json";
import { CombatStyle } from "./Gear";
const combatMasteries = rawCombatMasteries as unknown as CombatMastery[];

type CombatMastery = {
  name: string;
  image: string;
  style: CombatStyle;
  level: number;
  description: string;
}

export default CombatMastery;
export { combatMasteries }