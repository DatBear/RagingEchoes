import UserSelections from "./UserSelections";

import rawActivities from "~/data/generated/rankingsheet.json";
const activities = rawActivities as unknown as Activity[];
import rawBosses from "~/data/generated/bosses.json";
const bosses = rawBosses as unknown as Activity[];
import rawRunes from "~/data/generated/runes.json";
const runes = rawRunes as unknown as Activity[];
import rawPrayers from "~/data/generated/prayers.json";
const prayers = rawPrayers as unknown as Activity[];
import rawSpellbooks from "~/data/generated/spellbooks.json";
const spellbooks = rawSpellbooks as unknown as Activity[];

import rawFaFlTeleports from "~/data/generated/teleports/FaFl.json";
const FaFlTeleports = rawFaFlTeleports as unknown as Activity[];
import rawBHTeleports from "~/data/generated/teleports/BH.json";
const BHTeleports = rawBHTeleports as unknown as Activity[];
import rawCCTeleports from "~/data/generated/teleports/ClCo.json";
const CCTeleports = rawCCTeleports as unknown as Activity[];

import rawSlayerMasters from "~/data/generated/slayerMasters.json";
const slayerMasters = rawSlayerMasters as unknown as Activity[];

const teleports = {
  FaFl: FaFlTeleports,
  BH: BHTeleports,
  ClCo: CCTeleports
};

type Activity = {
  name: string;
  regions: Record<string, number>;
  relics: Record<string, number>;
}

const activityPoints = (activity: Activity, selections: UserSelections) => {
  const regions = selections.regions.map(x => x.name.toLowerCase());
  const relics = selections.relics.map(x => x.name.toLowerCase());
  let pts = 0;
  pts = Object.entries(activity.regions).map(x => regions.includes(x[0]) ? x[1] : 0).reduce((a, b) => Math.max(a, b), pts);
  pts = Object.entries(activity.relics).map(x => relics.includes(x[0]) ? x[1] : 0).reduce((a, b) => Math.max(a, b), pts);
  return pts;
};

const cleanName = (name: string) => {
  return name.toLowerCase().replaceAll("'", "");
}

export default Activity;
export { activities, bosses, runes, prayers, spellbooks, teleports, slayerMasters, activityPoints, cleanName }