import rawRegions from "~/data/regions.json";
const regions = rawRegions as unknown as Region[];

type Region = {
  name: string;
  image: string;
  default?: boolean;
  hidden?: boolean;
  code?: string;
}

export default Region;
export { regions }