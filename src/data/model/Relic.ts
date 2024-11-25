import rawRelics from "~/data/relics.json";
const relics = rawRelics as unknown as Relic[];

type Relic = {
  name: string;
  image: string;
  tier: string;
  order: number;
  code: string;
}

export default Relic;
export { relics }