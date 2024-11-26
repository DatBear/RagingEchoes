import rawRelics from "~/data/relics.json";
import { cleanName } from "./Activity";
const relics = (rawRelics as unknown as Relic[]).map(processRawRelic);

type Relic = {
  name: string;
  image: string;
  tier: string;
  order: number;
  code: string;

  cleanName: string;
}

function processRawRelic(region: Relic) {
  region.cleanName = cleanName(region.name);
  return region;
}

export default Relic;
export { relics }