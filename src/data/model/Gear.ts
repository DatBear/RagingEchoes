enum GearSlot {
  Weapon,
  Armour,
}

enum GearTier {
  Early,
  Mid,
  Late,
}

enum CombatStyle {
  Melee,
  Ranged,
  Magic
}

type Gear = {
  name: string;
  isRanged: boolean;
  isMelee: boolean;
  isMagic: boolean;
  slot: GearSlot;
  region: string;
  isSpec: boolean;
  tier: GearTier;
  tickSpeed?: number;
};

import rawGear from "~/data/gear.json";
const gear = rawGear as unknown as Gear[];

const gearSlots = Object.values(GearSlot)
  .map(x => x as GearSlot)
  .filter((v) => !isNaN(Number(v)));

const gearTiers = Object.values(GearTier)
  .map(x => x as GearTier)
  .filter((v) => !isNaN(Number(v)));

const combatStyles = Object.values(CombatStyle)
  .map(x => x as CombatStyle)
  .filter((v) => !isNaN(Number(v)));

const filterGear = (gear: Gear, slot: GearSlot, tier: GearTier, style: CombatStyle) => {
  const isStyle = (gear.isMagic && style === CombatStyle.Magic) || (gear.isMelee && style === CombatStyle.Melee) || (gear.isRanged && style === CombatStyle.Ranged)
  return isStyle && gear.slot === slot && tier === gear.tier;
}

export default Gear;
export { GearSlot, GearTier, CombatStyle, gear, gearSlots, gearTiers, combatStyles, filterGear }