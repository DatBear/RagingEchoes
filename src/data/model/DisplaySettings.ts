import { regions } from "./Region";

type DisplaySettings = {
  regions: boolean;
  masteries: boolean;
  relics: boolean;

  skills: boolean;
  prayers: boolean;
  spellbooks: boolean;
  runes: boolean;
  bosses: boolean;
  teleports: boolean;
  gear: boolean;
  coffee: boolean;
};

const defaultDisplaySettings: DisplaySettings = {
  regions: true,
  masteries: true,
  relics: true,

  skills: true,
  prayers: true,
  spellbooks: true,
  runes: true,
  bosses: true,
  teleports: true,
  gear: true,

  coffee: true,
};

export default DisplaySettings;
export { defaultDisplaySettings }