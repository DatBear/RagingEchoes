import SelectedCombatMastery from "./SelectedCombatMastery";
import SelectedRegion from "./SelectedRegion";
import SelectedRelic from "./SelectedRelic";

type UserSelections = {
  regions: SelectedRegion[];
  combatMasteries: SelectedCombatMastery[];
  relics: SelectedRelic[];
}

export default UserSelections;