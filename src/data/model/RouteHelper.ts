import UserSelections from "./UserSelections"

import Region, { regions } from "~/data/model/Region";
import Relic, { relics } from "~/data/model/Relic";
import SelectedRegion from "./SelectedRegion";
import SelectedCombatMastery from "./SelectedCombatMastery";
import { CombatStyle, combatStyles } from "./Gear";

const defaultRegions = regions.filter(x => x.default).map(x => ({ ...x, order: 0 }));

const SelectionsFromRoute = (slug: string[]) => {


  const slugRegions = slug
    .filter((_, idx) => idx < 3)
    .map((x, idx) => {
      const region = regions.find(r => x == r.code);
      return (region && !region.hidden ? { ...region, order: idx + 1 } : undefined) as SelectedRegion | undefined
    })
    .filter(x => x)
    .map(x => x!)
    .concat(defaultRegions);//eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion

  const slugCbMasteries = slug
    .filter((x, idx) => idx >= 3 && idx < 6)
    .map((x, idx) => {
      return {
        style: combatStyles[idx],
        level: Number(x)
      } as SelectedCombatMastery
    })
    .filter(x => x.level > 0);

  const slugRelics = slug
    .filter((x, idx) => idx >= 6)
    .map(x => relics.find(r => r.code === x))
    .filter(x => x)
    .map(x => x!);//eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion

  const selections: UserSelections = {
    regions: slugRegions,
    combatMasteries: slugCbMasteries,
    relics: slugRelics
  };
  //console.log('selectionsfromroute', selections, slug)
  return selections;
}

const RouteFromSelections = (selections: UserSelections) => {
  const slug: string[] = [];
  const minRegions = selections.combatMasteries.length > 0 || selections.relics.length > 0 ? 3 : Math.max(...selections.regions.map(x => x?.order ?? 0));
  for (let i = 1; i <= minRegions; i++) {
    const region = selections.regions.find(x => x.order === i);
    slug.push(region?.code ?? "_");
  }

  if (selections.combatMasteries.length > 0 || selections.relics.length > 0) {
    for (let i = 0; i < 3; i++) {
      const level = selections.combatMasteries.find(x => x.style === combatStyles[i])?.level ?? 0;
      slug.push(level + '');
    }
  }

  if (selections.relics.length > 0) {
    slug.push(...selections.relics.sort((a, b) => a.order - b.order).map(x => x.code));
  }

  //console.log('routefromselections', slug, selections);
  return slug;
}

const RouteEquals = (slug: string[], selections: UserSelections) => {
  const selectionSlug = RouteFromSelections(selections);
  return slug.length === selectionSlug.length && slug.every(function (value, index) { return value === selectionSlug[index] });
}

export { SelectionsFromRoute, RouteFromSelections, RouteEquals }