"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Region, { regions } from "~/data/model/Region";
import CombatMastery, { combatMasteries } from "~/data/model/CombatMastery";
import UserSelections from "~/data/model/UserSelections";
import { RouteEquals, RouteFromSelections, SelectionsFromRoute } from "~/data/model/RouteHelper";
import clsx from "clsx";
import SelectedCombatMastery from "~/data/model/SelectedCombatMastery";
import Relic, { relics } from "~/data/model/Relic";
import { skills } from "~/data/model/Skill";
import { activities, activityPoints, bosses, cleanName, prayers, runes, spellbooks, teleports } from "~/data/model/Activity";
import { CombatStyle, GearSlot, GearTier, combatStyles, filterGear, gear, gearSlots, gearTiers } from "~/data/model/Gear";
import images from "~/data/model/Images";
import { useLocalStorage } from "~/hooks/useLocalStorage";

const runeColors: Record<number, string> = {
  0: "bg-red-700",
  1: "bg-yellow-700",
  2: "bg-green-700",
};

const prayerColors: Record<number, string> = {
  0: "bg-red-700",
  1: "bg-green-700",
};

const skillColors: Record<number, string> = {
  0: "bg-red-700",
  1: "bg-orange-700",
  2: "bg-yellow-500",
  3: "bg-green-700",
};

const getColor = (map: Record<number, string>, points: number) => {
  const max = Math.max(...Object.keys(map).filter(x => points >= Number(x)).map(x => Number(x)));
  return Object.entries(map)
    .map(x => ([Number(x[0]), x[1]] as const))
    .find(x => x[0] === max)![1];
}

const getSlug = (pathname: string) => {
  return pathname.startsWith('/b/') ? pathname.replace('/b/', '').split('/') : [];
}

export default function HomePage() {
  const pathname = usePathname();

  const [userSelections, setUserSelections] = useState<UserSelections>(SelectionsFromRoute(getSlug(pathname)));
  const [showRegions, setShowRegions] = useLocalStorage("showRegions", true);
  const [showMasteries, setShowMasteries] = useLocalStorage("showMasteries", true);
  const [showRelics, setShowRelics] = useLocalStorage("showRelics", true);

  const hasSelections = () => {
    return userSelections.regions.length > 0 || userSelections.combatMasteries.length > 0 || userSelections.relics.length > 0;
  }

  const toggleRegion = (region: Region) => {
    const hasRegion = userSelections.regions.find(x => x.name === region.name);
    const orders = new Array(3).fill(null).map((_, i) => i + 1);
    const order = orders.find(x => !userSelections.regions.find(r => r.order === x)) ?? 1;
    if (hasRegion) {
      setUserSelections(x => ({ ...x, regions: x.regions.filter(r => r.name !== region.name) }));
    } else {
      if (userSelections.regions.filter(x => !x.default).length >= 3) {
        return;
      }
      setUserSelections(x => ({ ...x, regions: [...x.regions, { ...region, order: order }] }));
    }
  };

  const toggleCombatMastery = (mastery: CombatMastery) => {
    const currentLevel = userSelections.combatMasteries.find(x => x.style === mastery.style)?.level ?? 0;
    const maxLevel = 10 - userSelections.combatMasteries.filter(x => x.style !== mastery.style).map(x => x.level).reduce((a, b) => a + b, 0);
    const selection: SelectedCombatMastery = {
      style: mastery.style,
      level: Math.min(maxLevel, mastery.level <= currentLevel ? mastery.level - 1 : mastery.level)
    };
    userSelections.combatMasteries = [
      ...userSelections.combatMasteries.filter(x => x.style !== selection.style),
      selection
    ];
    setUserSelections({ ...userSelections });
  }

  const toggleRelic = (relic: Relic) => {
    const hasReloaded = !!userSelections.relics.find(x => x.code === "R");
    const isRemovingReloaded = hasReloaded && relic.order === 4;
    const reloadedTier = userSelections.relics
      .filter(x => x.order < 4)
      .find(x => userSelections.relics.filter(s => s.order === x.order).length > 1);


    //console.log('has reloaded', hasReloaded, 'tier', reloadedTier);
    const hasRelic = userSelections.relics.find(x => x.code === relic.code) !== undefined;

    userSelections.relics = [
      ...userSelections.relics.filter(x => {
        if (hasRelic) {
          return x.code !== relic.code;
        }
        if (x.order >= 4) {
          return x.order !== relic.order
        }
        if (isRemovingReloaded && reloadedTier) {
          return x.order !== relic.order && x.order !== reloadedTier.order;
        }
        //console.log(x.name, x.order, relic.order, reloadedTier?.order, (reloadedTier && reloadedTier.order === x.order));
        return x.order !== relic.order || (hasReloaded && !reloadedTier);
      }),
      !hasRelic ? relic : undefined
    ].filter(x => x).map(x => x!);

    setUserSelections({ ...userSelections });
  }

  useEffect(() => {
    const slug = getSlug(pathname);
    //console.log('slug', slug);
    //console.log('eff user selections', userSelections, RouteFromSelections(userSelections).join("/"));
    if (!RouteEquals(slug, userSelections)) {
      window.history.pushState({}, '', '/b/' + RouteFromSelections(userSelections).join("/"));
    }
  }, [userSelections]);

  useEffect(() => {
    //console.log('pathname effect', pathname, RouteFromSelections(userSelections).join("/"));
    const slug = getSlug(pathname);
    if (!RouteEquals(slug, userSelections)) {
      setUserSelections(SelectionsFromRoute(slug));
    }
  }, [pathname]);

  return <div className="w-full h-full text-white flex flex-col select-none min-h-screen">
    <Regions userSelections={userSelections} toggle={toggleRegion} show={showRegions} setShow={setShowRegions} />
    <Masteries userSelections={userSelections} toggle={toggleCombatMastery} show={showMasteries} setShow={setShowMasteries} />
    <Relics userSelections={userSelections} toggle={toggleRelic} show={showRelics} setShow={setShowRelics} />

    {!hasSelections() && <>
      <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 max-w-xl place-self-center">
        <h1 className="w-full text-center text-2xl">Raging Echoes League Planner</h1>
        <div className="w-full text-center">
          Welcome to the ultimate league planner for Old School Runescape's Raging Echoes League!<br />
          Select your regions, combat masteries, and relics above to get started.
        </div>
      </div>
    </>}
    {hasSelections() && <>
      <div className="spacer h-2"></div>
      <div className="flex flex-row flex-wrap items-center justify-around">
        <Skills userSelections={userSelections} />
        <Spellbooks userSelections={userSelections} />
        <Prayers userSelections={userSelections} />
        <Runes userSelections={userSelections} />
        <Bosses userSelections={userSelections} />
        <Teleports userSelections={userSelections} />
      </div>
      <Gear userSelections={userSelections} />

    </>}

    <div className="flex flex-grow"></div>

  </div>
}


type Toggleable<T> = {
  toggle: (item: T) => void;
}

type Hideable = {
  show: boolean;
  setShow: (show: boolean) => void;
}

type RegionsProps = Toggleable<Region> & UserSelectionProps & Hideable;
function Regions({ userSelections, toggle, show, setShow }: RegionsProps) {
  {/* regions */ }
  return <div className={"relative"}>
    <div className={clsx("w-full flex flex-row bg-slate-900 items-center py-4 border-b-4 border-cyan-600", !show && "hidden")}>
      <div className="w-max text-nowrap font-semibold text-center pl-5">Regions</div>
      <div className="grid grid-cols-3 lg:grid-cols-9 justify-between items-center w-full px-10 min-w-max">
        {regions.filter(x => !x.default && !x.hidden).map(x => {
          const order = userSelections.regions.find(r => r.code === x.code)?.order;
          const hasSelections = userSelections.regions.length > 0;
          return <button key={x.name} className={clsx("flex flex-col items-center w-22 h-14 relative", hasSelections && !order && "opacity-30")} onClick={() => toggle(x)}>
            <img src={x.image} alt={x.name} className="w-10" />
            {order && <div className="absolute top-3 font-bold text-shadow text-2xl text-cyan-300">
              {order}
            </div>}
            <div className="absolute bottom-0 font-bold text-shadow">{x.name}</div>
          </button>
        })}
      </div>

    </div>
    <button className={clsx("flex items-center justify-center absolute z-10 bg-cyan-700 rounded-md px-1 right-4", show ? "bottom-[-10px]" : "")} onClick={_ => setShow(!show)}>
      {show ? "x" : "v"}
    </button>
  </div>
}

type MasteriesProps = Toggleable<CombatMastery> & UserSelectionProps & Hideable;
function Masteries({ userSelections, toggle, show, setShow }: MasteriesProps) {
  {/* combat masteries */ }
  return <div className="relative">
    <div className={clsx("w-full flex flex-row  items-center py-2 bg-slate-900 border-b-4 border-cyan-600", !show && "hidden")}>
      <div className="w-max text-nowrap font-semibold pl-5 text-center">Combat <br />Masteries</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center justify-between w-full px-5">
        {combatStyles.map(style => {
          const name = CombatStyle[style];
          const hasCombatMastery = userSelections.combatMasteries.length > 0;
          const level = userSelections.combatMasteries.find(m => m.style === style)?.level ?? 0;
          return <div key={name} className="flex flex-col items-center">
            <div className="font-bold">{name}</div>
            <div className="flex flex-row gap-3">
              {combatMasteries.filter(x => x.style === style).map(x => {
                return <button key={x.name} className={clsx("flex flex-col min-w-8", hasCombatMastery && level < x.level && "opacity-20")} onClick={() => toggle(x)}>
                  <img src={x.image} alt={x.name} className="w-8" />
                  <div className="mt-[-1rem] text-shadow font-bold">{x.name.split(" ")[1]}</div>
                </button>
              })}
            </div>
          </div>
        })}
      </div>
    </div>
    <button className={clsx("flex items-center justify-center absolute z-10 bg-cyan-700 rounded-md px-1 right-10", show ? "bottom-[-10px]" : "")} onClick={_ => setShow(!show)}>
      {show ? "x" : "v"}
    </button>
  </div>
}

type RelicsProps = Toggleable<Relic> & UserSelectionProps & Hideable;
function Relics({ userSelections, toggle, show, setShow }: RelicsProps) {
  {/* relics */ }
  return <div className="relative">
    <div className={clsx("w-full flex flex-row  items-center py-2 bg-slate-900 border-b-4 border-cyan-600", !show && "hidden")}>
      <div className="w-max text-nowrap font-semibold text-center pl-5">Relics</div>
      <div className="flex flex-row flex-wrap justify-around w-full px-5">
        {[...new Set([...relics.map(x => x.order).sort((a, b) => a - b)])].map(order => {
          const tierName = relics.find(x => x.order === order)?.tier;
          const tierSelections = userSelections.relics.filter(x => x.order === order);
          return <div key={order} className="flex flex-col justify-between items-center border-x-2 m-2 border-cyan-500 rounded-lg">
            <div className="font-bold">{(!isNaN(Number(tierName)) ? "Tier " + tierName : tierName + " Tier")}</div>
            <div className="flex flex-row h-full">
              {relics.filter(x => x.order === order).map(relic => {
                const isSelected = userSelections.relics.find(x => x.code === relic.code);
                return <button key={relic.code} className={clsx("flex flex-col gap-2 w-24 items-center justify-center", tierSelections.length > 0 && !isSelected && "opacity-30")} onClick={_ => toggle(relic)}>
                  {relic.image?.length > 0 && <img src={relic.image} alt={relic.name} className="w-14" />}
                  {relic.image.length == 0 && <div className="w-14 h-14"></div>}
                  <div className="mt-[-2rem] text-shadow w-full font-bold">{relic.name}</div>
                </button>
              })}
            </div>
          </div>
        })}
      </div>
    </div>
    <button className={clsx("flex items-center justify-center absolute z-10 bg-cyan-700 rounded-md px-1 right-16", show ? "bottom-[-10px]" : "")} onClick={_ => setShow(!show)}>
      {show ? "x" : "v"}
    </button>
  </div>
}


type UserSelectionProps = {
  userSelections: UserSelections;
}

function Spellbooks({ userSelections }: UserSelectionProps) {
  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-max">
    <h1 className="font-bold text-2xl w-full text-center">Spellbooks</h1>
    <div className="flex flex-row gap-4 items-center justify-center h-full">
      {spellbooks.map(x => {
        const pts = activityPoints(x, userSelections);
        const image = images[x.name.toLowerCase()]
        return <div key={x.name} className={clsx("flex w-12 h-12 items-center justify-center rounded-3xl", getColor(prayerColors, pts))}>
          <img src={image} alt={x.name} className="max-w-10 max-h-10" />
        </div>
      })}
    </div>
  </div>
}
function Prayers({ userSelections }: UserSelectionProps) {
  {/* prayers */ }
  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-max">
    <h1 className="font-bold text-2xl w-full text-center">Prayers</h1>
    <div className="flex flex-row gap-4 items-center justify-center h-full">
      {prayers.map(x => {
        const pts = activityPoints(x, userSelections);
        const image = images[x.name.toLowerCase()]
        return <div key={x.name} className={clsx("flex w-12 h-12 items-center justify-center rounded-3xl", getColor(prayerColors, pts))}>
          <img src={image} alt={x.name} className="max-w-10 max-h-10" />
        </div>
      })}
    </div>
  </div>
}

function Runes({ userSelections }: UserSelectionProps) {
  {/* runes */ }
  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-max">
    <h1 className="font-bold text-2xl w-full text-center">Runes</h1>
    <div className="flex flex-row gap-4 items-center justify-center h-full">
      {runes.map(x => {
        const pts = activityPoints(x, userSelections);
        const image = images[x.name.toLowerCase()]
        return <div key={x.name} className={clsx("flex w-12 h-12 items-center justify-center rounded-3xl", getColor(runeColors, pts))}>
          <img src={image} alt={x.name} className="max-w-10 max-h-10" />
        </div>
      })}
    </div>
  </div>
}

function Skills({ userSelections }: UserSelectionProps) {
  {/* skills */ }
  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full">
    <h1 className="font-bold text-2xl w-full text-center">Skills</h1>
    <div className="flex flex-row gap-4 items-center justify-center h-full flex-wrap">
      {skills.map(x => {
        const activity = activities.find(a => a.name.toLowerCase() === x.toLowerCase());
        if (!activity) return null;
        const pts = activityPoints(activity, userSelections);
        const img = images[x.toLowerCase()];
        return <div key={x} className={clsx("flex w-12 h-12 items-center justify-center rounded-3xl", getColor(skillColors, pts))}>
          <img src={img} alt={x} className="max-w-8 max-h-8" />
        </div>
      })}
    </div>
  </div>
}

function Bosses({ userSelections }: UserSelectionProps) {
  {/* bosses */ }
  const filteredBosses = bosses.filter(x => activityPoints(x, userSelections)).sort((a, b) => a.name.localeCompare(b.name));
  return <div className="border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full md:max-w-xl flex flex-col">
    <h1 className="font-bold text-2xl w-full text-center">Bosses</h1>
    <div className="text-center">
      {filteredBosses.length === 0 && <div className="text-gray-500 italic text-center w-full">None</div>}
      {filteredBosses.map(x => x.name).join(" | ")}
    </div>
  </div>
}

function Teleports({ userSelections }: UserSelectionProps) {
  {/* teleports */ }
  const filteredTeleports = Object.entries(teleports)
    .filter(x => userSelections.relics.find(r => r.code === x[0])).flatMap(x => x[1])
    .filter(x => activityPoints(x, userSelections))
    .sort((a, b) => a.name.localeCompare(b.name));
  return <div className="border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full md:max-w-xl flex flex-col">
    <h1 className="font-bold text-2xl w-full text-center">Teleports</h1>
    <div className="text-center">
      {filteredTeleports.length === 0 && <div className="text-gray-500 italic text-center w-full">None</div>}
      {[...new Set(filteredTeleports.map(x => x.name))].join(" | ")}
    </div>
  </div>
}

function Gear({ userSelections }: UserSelectionProps) {
  {/* gear */ }
  return <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-0 mb-10">
    {gearSlots.map(slot => {
      const slotImg = images[GearSlot[slot].toLowerCase()];
      return <div key={slot} className="flex flex-col justify-between gap-3 items-start border border-cyan-900 m-5 p-2 rounded-md bg-slate-900 h-full">
        <img src={slotImg} alt={GearSlot[slot]} className="w-8 h-8 place-self-center" />
        {combatStyles.map(style => {
          const styleImg = images[CombatStyle[style].toLowerCase()];
          return <div key={style} className="flex flex-col w-full">
            <div className="flex flex-row gap-2 items-center">
              <img src={styleImg} alt={CombatStyle[style]} className="w-8 h-8" />
              <div className="grid grid-rows-3 w-full">
                {gearTiers.map(tier => {
                  const filteredGear = gear.filter(x => filterGear(x, slot, tier, style))
                    .filter(x => userSelections.regions.find(r => cleanName(r.name) === cleanName(x.region)));
                  return <div key={tier}>
                    <div className="flex flex-row gap-5 p-2 border border-cyan-900 h-full justify-start items-center">
                      <div className="font-bold text-center">{GearTier[tier]}</div>
                      <div className="flex flex-row gap-1 flex-wrap justify-around w-full">
                        {[...new Set(filteredGear.map(x => x.name).sort((a, b) => a.localeCompare(b)))].join(" | ")}
                        {/* {filteredGear.map((x, idx) => {
                          return <div key={x.name + x.region} className={clsx("text-center w-full lg:w-24 flex items-center justify-center")}>
                            {x.name}
                          </div>
                        })} */}
                        {filteredGear.length === 0 && <div className="text-gray-500 italic">None</div>}
                      </div>
                    </div>
                  </div>
                })}
              </div>
            </div>
          </div>
        })}
      </div>
    })}
  </div>
}

function Coffee() {
  return <div className="w-full text-center my-5 flex flex-col items-center justify-center">
    <div>Loving this website?</div>
    <a className="py-2 px-2 bg-cyan-900 rounded-md w-max" href="https://buymeacoffee.com/datbear" target="_blank"> ☕Buy me a coffee</a>
  </div>
}

