type Teleport = {
  relic: string;
  category: string;
  regions: string[];
  location: string;
  code?: string;
  distance: string;

  relicCleanName: string;
  cleanRegions: string[];
  wikiLink: string;
}

import rawTeleports from "~/data/generated/teleports.json";
import { cleanName } from "./Activity";
const newTeleports = (rawTeleports as unknown as Teleport[]).map(processRawTeleport);

function processRawTeleport(teleport: Teleport) {
  teleport.relicCleanName = cleanName(teleport.relic);
  teleport.wikiLink = teleportWikiLink(teleport);
  teleport.cleanRegions = teleport.regions.map(x => cleanName(x));
  return teleport;
}

function teleportWikiLink(teleport: Teleport) {
  switch (teleport.relicCleanName) {
    case "fairys flight":
      return teleport.relic + "#" + teleport.category + "s";
    case "bank heist":
      return teleport.relic + "#" + teleport.regions[0];
    case "clue compass":
      return teleport.relic + "#" + teleport.regions[0];
  }
  return "";
}

export default Teleport;
export { newTeleports }