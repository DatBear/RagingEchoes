import rawRegions from "~/data/regions.json";
import { cleanName } from "./Activity";
const regions = (rawRegions as unknown as Region[]).map(processRawRegion);

type Region = {
  name: string;
  image: string;
  default?: boolean;
  hidden?: boolean;
  code?: string;
  wikiName?: string;

  cleanName: string;
}

function processRawRegion(region: Region) {
  region.cleanName = cleanName(region.name);
  return region;
}

export default Region;
export { regions }