"use client";
import { Fragment, PropsWithChildren, ReactElement, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Region, { regions } from "~/data/model/Region";
import CombatMastery, { combatMasteries } from "~/data/model/CombatMastery";
import UserSelections from "~/data/model/UserSelections";
import { RouteEquals, RouteFromSelections, SelectionsFromRoute } from "~/data/model/RouteHelper";
import clsx from "clsx";
import SelectedCombatMastery from "~/data/model/SelectedCombatMastery";
import Relic, { relics } from "~/data/model/Relic";
import { skills } from "~/data/model/Skill";
import Activity, { activities, activityPoints, bosses, cleanName, minigames, prayers, runes, slayerMasters, spellbooks, teleports } from "~/data/model/Activity";
import { CombatStyle, GearSlot, GearTier, combatStyles, filterGear, gear, gearSlots, gearTiers } from "~/data/model/Gear";
import images from "~/data/model/Images";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import DisplaySettings, { defaultDisplaySettings } from "~/data/model/DisplaySettings";
import { useWiki } from "./contexts/WikiStateContext";
import openWiki, { wikiClick, wikiLinkProps, wikiPointer } from "./utils/openWiki";
import { newTeleports } from "~/data/model/Teleport";
import { activitiesV2, notedActivityPoints } from "~/data/model/NotedActivity";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";

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

const skillTextColors: Record<number, string> = {
  0: "text-red-700",
  1: "text-orange-700",
  2: "text-yellow-500",
  3: "text-green-700",
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
  const { isWikiActive } = useWiki();

  const [userSelections, setUserSelections] = useState<UserSelections>(SelectionsFromRoute(getSlug(pathname)));
  const [isLocked, setIsLocked] = useLocalStorage("isLocked", false);
  const [_displaySettings, _setDisplaySettings] = useLocalStorage<Partial<DisplaySettings>>("displaySettings", defaultDisplaySettings);

  const displaySettings: DisplaySettings = _displaySettings as DisplaySettings;
  Object.entries(defaultDisplaySettings)
    .map(x => ([x[0] as keyof DisplaySettings, x[1]] as const))
    .forEach(([key, value]) => {
      if (_displaySettings[key] === undefined) {
        _displaySettings[key] = value;
      }
    });

  const setDisplaySettings = (partialSettings: Partial<DisplaySettings>) => {
    Object.entries(partialSettings)
      .map(x => ([x[0] as keyof DisplaySettings, x[1]] as const))
      .forEach(([key, value]) => {
        if (partialSettings[key] !== undefined) {
          _displaySettings[key] = value;
        }
      });
    _setDisplaySettings({ ..._displaySettings });
  }

  const hasSelections = () => {
    return userSelections.regions.length > 0 || userSelections.combatMasteries.length > 0 || userSelections.relics.length > 0;
  }

  const toggleRegion = (region: Region) => {
    if (wikiClick('Raging Echoes League/Areas/' + region.name, isWikiActive)) return;
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
    if (wikiClick(mastery.name, isWikiActive)) return;
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
    if (wikiClick(relic.name, isWikiActive)) return;
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

  return <div className="w-full h-full text-white flex flex-col select-none min-h-screen bg-black">
    <Regions userSelections={userSelections} toggle={toggleRegion} show={displaySettings.regions} setShow={x => setDisplaySettings({ regions: x })} isLocked={isLocked} />
    <Masteries userSelections={userSelections} toggle={toggleCombatMastery} show={displaySettings.masteries} setShow={x => setDisplaySettings({ masteries: x })} isLocked={isLocked} />
    <Relics userSelections={userSelections} toggle={toggleRelic} show={displaySettings.relics} setShow={x => setDisplaySettings({ relics: x })} isLocked={isLocked} setIsLocked={setIsLocked} displaySettings={displaySettings} setDisplaySettings={setDisplaySettings} />

    {/* {!hasSelections() && <>
      <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 max-w-xl place-self-center">
        <h1 className="w-full text-center text-2xl">Raging Echoes League Planner</h1>
        <div className="w-full text-center">
          Welcome to the ultimate league planner for Old School Runescape's Raging Echoes League!<br />
          Select your regions, combat masteries, and relics above to get started.
        </div>
      </div>
    </>} */}
    {hasSelections() && <>
      <div className={displaySettings.regions || displaySettings.masteries || displaySettings.relics ? "spacer h-2" : "h-6"}></div>
      <div className="flex flex-row flex-wrap items-center justify-around">
        <SkillsV2 userSelections={userSelections} show={displaySettings.skills} setShow={x => setDisplaySettings({ skills: x })} />
        <Spellbooks userSelections={userSelections} show={displaySettings.spellbooks} setShow={x => setDisplaySettings({ spellbooks: x })} />
        <Prayers userSelections={userSelections} show={displaySettings.prayers} setShow={x => setDisplaySettings({ prayers: x })} />
        <Runes userSelections={userSelections} show={displaySettings.runes} setShow={x => setDisplaySettings({ runes: x })} />
        <Bosses userSelections={userSelections} show={displaySettings.bosses} setShow={x => setDisplaySettings({ bosses: x })} />
        <SlayerMasters userSelections={userSelections} show={displaySettings.slayerMasters} setShow={x => setDisplaySettings({ teleports: x })} />
        <Minigames userSelections={userSelections} show={displaySettings.minigames} setShow={x => setDisplaySettings({ minigames: x })} />
        {/* <Teleports userSelections={userSelections} show={displaySettings.teleports} setShow={x => setDisplaySettings({ teleports: x })} /> */}
        <NewTeleports userSelections={userSelections} show={displaySettings.teleports} setShow={x => setDisplaySettings({ teleports: x })} />
      </div>
      <Gear userSelections={userSelections} show={displaySettings.gear} setShow={x => setDisplaySettings({ gear: x })} />
    </>}

    <div className="flex flex-grow m-3"></div>
    <WikiButton displaySettings={displaySettings} setDisplaySettings={setDisplaySettings} />
    <Attribution />
  </div>
}


type Toggleable<T> = {
  toggle: (item: T) => void;
}

type Hideable = {
  show: boolean;
  setShow: (show: boolean) => void;
}

type Lockable = {
  isLocked: boolean;
}

type Unlockable = {
  setIsLocked: (locked: boolean) => void;
}

type UsesDisplaySettings = {
  displaySettings: DisplaySettings;
  setDisplaySettings: (settings: Partial<DisplaySettings>) => void;
}

type RegionsProps = Toggleable<Region> & UserSelection & Hideable & Lockable;
function Regions({ userSelections, toggle, show, setShow, isLocked }: RegionsProps) {
  const { isWikiActive } = useWiki();
  const totalRegions = Math.max(...userSelections.regions.filter(x => !x.default && !x.hidden).map(x => x.order));
  {/* regions */ }
  return <div className={"relative"}>
    <div className={clsx("w-full flex flex-row bg-slate-900 items-center py-4 border-b-4 border-cyan-600", !show && "hidden")}>
      <a className={clsx("w-max text-nowrap font-semibold text-center pl-5", wikiPointer(isWikiActive))} {...wikiLinkProps('Raging Echoes League/Areas')}>Regions</a>
      <div className="grid grid-cols-3 lg:grid-cols-9 justify-between items-center w-full px-10 min-w-max">
        {regions.filter(x => !x.default && !x.hidden).sort((a, b) => isLocked && totalRegions === 3 ? (userSelections.regions.find(x => x.code === a.code)?.order ?? 0) - (userSelections.regions.find(x => x.code === b.code)?.order ?? 0) : 0).map(x => {
          const order = userSelections.regions.find(r => r.code === x.code)?.order;
          const hasSelections = true;
          const lockClass = isLocked && !order && totalRegions === 3 ? "hidden" : "";
          return <a key={x.name} className={clsx("flex flex-col items-center w-22 h-14 relative", hasSelections && !order && "opacity-30", lockClass)} onClick={e => { e.preventDefault(); toggle(x) }} {...wikiLinkProps('Raging Echoes League/Areas#' + (x.wikiName ?? x.name), isWikiActive)}>
            <img src={x.image} alt={x.name} className="w-10" />
            {order && <div className="absolute top-3 font-bold text-shadow text-2xl text-cyan-300">
              {order}
            </div>}
            <div className="absolute bottom-0 font-bold text-shadow">{x.name}</div>
          </a>
        })}
      </div>
    </div>
  </div>
}

type MasteriesProps = Toggleable<CombatMastery> & UserSelection & Hideable & Lockable;
function Masteries({ userSelections, toggle, show, setShow, isLocked }: MasteriesProps) {
  const { isWikiActive } = useWiki();
  const totalMasteries = userSelections.combatMasteries.reduce((a, b) => a + b.level, 0);
  {/* combat masteries */ }
  return <div className="relative">
    <div className={clsx("w-full flex flex-row items-center py-2 bg-slate-900 border-b-4 border-cyan-600", !show && "hidden")}>
      <a className={clsx("w-max text-nowrap font-semibold pl-5 text-center", wikiPointer(isWikiActive))} {...wikiLinkProps('Raging Echoes League/Combat Masteries')}>Combat <br />Masteries</a>
      <div className={clsx("grid gap-5 px-5", !isLocked ? "w-full grid-cols-1 lg:grid-cols-3" : "grid-cols-3")}>
        {combatStyles.map(style => {
          const name = CombatStyle[style];
          const hasCombatMastery = userSelections.combatMasteries.length > 0;
          const selectedLevel = userSelections.combatMasteries.find(m => m.style === style)?.level ?? 0;
          const hideClass = isLocked && totalMasteries === 10 ? "hidden" : "opacity-20";
          return <div key={name} className={clsx("flex flex-col items-center", isLocked && selectedLevel == 0 && totalMasteries == 10 && hideClass)}>
            <a className="font-bold" {...wikiLinkProps('Raging Echoes League/Combat Masteries#' + name)}>{name}</a>
            <div className="flex flex-row gap-3">
              {combatMasteries.filter(x => x.style === style).map(x => {
                const masteryClass = clsx("flex flex-col min-w-8", hasCombatMastery && (x.level > selectedLevel || (isLocked && x.level < selectedLevel)) ? hideClass : "");
                return <a key={x.name} className={masteryClass} onClick={e => { e.preventDefault(); toggle(x) }} {...wikiLinkProps('Raging Echoes League/Combat Masteries#' + name, isWikiActive)}>
                  <img src={x.image} alt={x.name} className="w-8" />
                  <div className="mt-[-1rem] text-shadow font-bold">{x.name.split(" ")[1]}</div>
                </a>
              })}
            </div>
          </div>
        })}
      </div>
    </div>
  </div >
}

type RelicsProps = Toggleable<Relic> & UserSelection & Hideable & Lockable & Unlockable & UsesDisplaySettings;
function Relics({ userSelections, toggle, show, setShow, isLocked, setIsLocked, displaySettings, setDisplaySettings }: RelicsProps) {
  const { isWikiActive } = useWiki();
  const toolbarClass = displaySettings.regions || displaySettings.masteries || displaySettings.relics ? "bottom-[-10px]" : "my-2";
  {/* relics */ }
  return <div className="relative">
    <div className={clsx("w-full flex flex-row  items-center py-2 bg-slate-900 border-b-4 border-cyan-600", !show && "hidden")}>
      <a className={clsx("w-max text-nowrap font-semibold text-center pl-5", wikiPointer(isWikiActive))} {...wikiLinkProps('Raging Echoes League/Relics')}>Relics</a>
      <div className={clsx("flex flex-row flex-wrap w-full px-5", isLocked ? "justify-start" : "justify-around")}>
        {[...new Set([...relics.map(x => x.order).sort((a, b) => a - b)])].map(order => {
          const tierName = relics.find(x => x.order === order)?.tier;
          const tierSelections = userSelections.relics.filter(x => x.order === order);
          return <div key={order} className="flex flex-col justify-between items-center border-x-2 m-2 border-cyan-500 rounded-lg">
            <div className="font-bold">{(!isNaN(Number(tierName)) ? "Tier " + tierName : tierName + " Tier")}</div>
            <div className="flex flex-row h-full">
              {relics.filter(x => x.order === order).map(relic => {
                const isSelected = userSelections.relics.find(x => x.code === relic.code);
                const hideClass = isLocked ? "hidden" : "opacity-30";
                return <a key={relic.code} className={clsx("flex flex-col gap-2 w-24 items-center justify-center text-center", tierSelections.length > 0 && !isSelected && hideClass)} onClick={e => { e.preventDefault(); toggle(relic) }} {...wikiLinkProps(relic.name, isWikiActive)}>
                  {relic.image?.length > 0 && <img src={relic.image} alt={relic.name} className="w-14" />}
                  {relic.image.length == 0 && <div className="w-14 h-14"></div>}
                  <div className="mt-[-2rem] text-shadow w-full font-bold">{relic.name}</div>
                </a>
              })}
            </div>
          </div>
        })}
      </div>
    </div>
    <button className={clsx("flex items-center justify-center absolute z-10 bg-cyan-700 rounded-md px-1 ml-1", toolbarClass)} onClick={_ => setIsLocked(!isLocked)}>
      {isLocked ? "🔒" : "🔓"}
    </button>
    <div className={clsx("flex flex-row left-10 absolute z-10 w-max gap-0.5", toolbarClass)}>
      <DisplaySettingsToolbar displaySettings={displaySettings} setDisplaySettings={setDisplaySettings} />
    </div>

  </div>
}


function DisplaySettingsToolbar({ displaySettings, setDisplaySettings }: UsesDisplaySettings) {
  return <>
    <ImageToggleButton show={displaySettings.regions} setShow={x => setDisplaySettings({ regions: x })}>
      <img src={images["regions"]} className="w-4 h-4" />
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.masteries} setShow={x => setDisplaySettings({ masteries: x })}>
      <img src={images["masteries"]} className="w-4 h-4" />
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.relics} setShow={x => setDisplaySettings({ relics: x })}>
      <img src={images["relics"]} className="w-4 h-4" />
    </ImageToggleButton>
    <div className="w-2"></div>
    <ImageToggleButton show={displaySettings.skills} setShow={x => setDisplaySettings({ skills: x })}>
      <img src={images["skills"]} className="w-4 h-4" />
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.spellbooks} setShow={x => setDisplaySettings({ spellbooks: x })}>
      <img src={images["spellbooks"]} className="w-4 h-4" />
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.prayers} setShow={x => setDisplaySettings({ prayers: x })}>
      <img src={images["prayers"]} className="w-4 h-4" />
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.runes} setShow={x => setDisplaySettings({ runes: x })}>
      <img src={images["runes"]} className="w-4 h-4" />
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.bosses} setShow={x => setDisplaySettings({ bosses: x })}>
      <div className="text-xs">💀</div>
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.slayerMasters} setShow={x => setDisplaySettings({ slayerMasters: x })}>
      <img src={images["slayer"]} className="w-4 h-4" />
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.minigames} setShow={x => setDisplaySettings({ minigames: x })}>
      <img src={images["minigames"]} className="w-4 h-4" />
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.teleports} setShow={x => setDisplaySettings({ teleports: x })}>
      <img src={images["teleports"]} className="w-4 h-4" />
    </ImageToggleButton>
    <ImageToggleButton show={displaySettings.gear} setShow={x => setDisplaySettings({ gear: x })}>
      <img src={images["gear"]} className="w-4 h-4" />
    </ImageToggleButton>
  </>
}

function ImageToggleButton({ children, show, setShow }: PropsWithChildren<Hideable>) {
  const hideClass = show ? "bg-cyan-700" : "bg-red-700";
  return <button className={clsx("flex items-center justify-center rounded-md p-1 border border-slate-800 shadow-sm", hideClass)} onClick={_ => setShow(!show)}>
    {children}
  </button>
}

type UserSelection = {
  userSelections: UserSelections;
}

function Skills({ userSelections, show, setShow }: UserSelection & Hideable) {
  {/* skills */ }
  const { isWikiActive } = useWiki();
  if (!show) return null;
  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full lg:max-w-96">
    <h1 className="font-bold text-2xl w-full text-center">Skills</h1>
    <div className="flex flex-row gap-4 items-center justify-center h-full flex-wrap">
      {skills.map(x => {
        const activity = activities.find(a => a.name.toLowerCase() === x.toLowerCase());
        if (!activity) return null;
        const pts = activityPoints(activity, userSelections);
        const img = images[x.toLowerCase()];
        return <a key={x} className={clsx("flex w-12 h-12 items-center justify-center rounded-3xl", getColor(skillColors, pts), wikiPointer(isWikiActive))}  {...wikiLinkProps(activity)}>
          <img src={img} alt={x} className="max-w-8 max-h-8" />
        </a>
      })}
    </div>
  </div>
}

function SkillsV2({ userSelections, show, setShow }: UserSelection & Hideable) {
  {/* skills */ }
  const { isWikiActive } = useWiki();
  if (!show) return null;
  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full lg:max-w-96">
    <h1 className="font-bold text-2xl w-full text-center">Skills</h1>
    <div className="text-gray-500 italic text-center w-full py-1">Hover a skill to see available methods.</div>
    <div className="flex flex-row gap-4 items-center justify-center h-full flex-wrap">
      {skills.map(x => {
        const activity = activitiesV2.find(a => a.name.toLowerCase() === x.toLowerCase());
        if (!activity) return null;
        const pts = notedActivityPoints(activity, userSelections);
        const img = images[x.toLowerCase()];

        return <Tooltip key={x}>
          <TooltipTrigger asChild>
            <a className={clsx("flex w-12 h-12 items-center justify-center rounded-3xl", getColor(skillColors, pts), wikiPointer(isWikiActive))}  {...wikiLinkProps(activity)}>
              <img src={img} alt={x} className="max-w-8 max-h-8" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="bottom" alignOffset={20}>
            <div className="flex flex-col w-max z-20 bg-slate-900 border-cyan-900 border rounded-md p-2">
              <div className={clsx("w-full text-center", getColor(skillTextColors, pts))}>{x}</div>
              {Object.entries(activity.regions).concat(Object.entries(activity.relics))
                .filter(x => (x[1].note?.length ?? 0) > 0 && (userSelections.regions.find(r => r.cleanName === cleanName(x[0])) ?? userSelections.relics.find(r => r.cleanName === cleanName(x[0]))))
                .sort((a, b) => b[1].value - a[1].value)
                .map(x => <div key={x[0]} className={clsx(getColor(skillTextColors, x[1].value))}>
                  {x[0]}: {x[1].note}
                </div>)}
            </div>
          </TooltipContent>
        </Tooltip>

      })}
    </div>
  </div>
}

function Spellbooks({ userSelections, show, setShow }: UserSelection & Hideable) {
  {/* spellbooks */ }
  const { isWikiActive } = useWiki();
  if (!show) return null;
  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-max">
    <h1 className="font-bold text-2xl w-full text-center">Spellbooks</h1>
    <div className="flex flex-row gap-4 items-center justify-center h-full">
      {spellbooks.map(x => {
        const pts = activityPoints(x, userSelections);
        const image = images[x.name.toLowerCase()]
        return <a key={x.name} className={clsx("flex w-12 h-12 items-center justify-center rounded-3xl", getColor(prayerColors, pts), wikiPointer(isWikiActive))} {...wikiLinkProps(x.name + " spellbook")}>
          <img src={image} alt={x.name} className="max-w-10 max-h-10" />
        </a>
      })}
    </div>
  </div>
}

function Prayers({ userSelections, show, setShow }: UserSelection & Hideable) {
  {/* prayers */ }
  const { isWikiActive } = useWiki();
  if (!show) return null;
  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-max">
    <h1 className="font-bold text-2xl w-full text-center">Prayers</h1>
    <div className="flex flex-row gap-4 items-center justify-center h-full">
      {prayers.map(x => {
        const pts = activityPoints(x, userSelections);
        const image = images[x.name.toLowerCase()]
        return <a key={x.name} className={clsx("flex w-12 h-12 items-center justify-center rounded-3xl", getColor(prayerColors, pts), wikiPointer(isWikiActive))} {...wikiLinkProps(x)}>
          <img src={image} alt={x.name} className="max-w-10 max-h-10" />
        </a>
      })}
    </div>
  </div>
}

function Runes({ userSelections, show, setShow }: UserSelection & Hideable) {
  {/* runes */ }
  const { isWikiActive } = useWiki();
  if (!show) return null;
  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-max">
    <h1 className="font-bold text-2xl w-full text-center">Runes</h1>
    <div className="flex flex-row gap-4 items-center justify-center h-full">
      {runes.map(x => {
        const pts = activityPoints(x, userSelections);
        const image = images[x.name.toLowerCase()]
        return <a key={x.name} className={clsx("flex w-12 h-12 items-center justify-center rounded-3xl", getColor(runeColors, pts), wikiPointer(isWikiActive))} {...wikiLinkProps(x.name + " rune")}>
          <img src={image} alt={x.name} className="max-w-10 max-h-10" />
        </a>
      })}
    </div>
  </div>
}



function Bosses({ userSelections, show, setShow }: UserSelection & Hideable) {
  {/* bosses */ }
  const { isWikiActive } = useWiki();
  if (!show) return null;
  const filteredBosses = bosses.filter(x => activityPoints(x, userSelections)).sort((a, b) => a.name.localeCompare(b.name));
  return <div className="border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full md:max-w-xl flex flex-col">
    <h1 className="font-bold text-2xl w-full text-center">Bosses</h1>
    <div className="text-center">
      {filteredBosses.length === 0 && <div className="text-gray-500 italic text-center w-full">None</div>}
      {[...new Set(filteredBosses.map(x => x.name))].map((x, idx) => <Fragment key={idx}>
        <a className={clsx("inline", wikiPointer(isWikiActive))} {...wikiLinkProps(x)}>{x}</a>
        {Separator(idx, filteredBosses)}
      </Fragment>)}
    </div>
  </div>
}

function Teleports({ userSelections, show, setShow }: UserSelection & Hideable) {
  const { isWikiActive } = useWiki();
  if (!show) return null;
  {/* teleports */ }
  const filteredTeleports = Object.entries(teleports)
    .filter(x => userSelections.relics.find(r => r.code === x[0])).flatMap(x => x[1])
    .filter(x => activityPoints(x, userSelections))
    .sort((a, b) => a.name.localeCompare(b.name));
  return <div className="border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full md:max-w-xl flex flex-col">
    <h1 className="font-bold text-2xl w-full text-center">Teleports</h1>
    <div className="text-center">
      {filteredTeleports.length === 0 && <div className="text-gray-500 italic text-center w-full">None</div>}
      {[...new Set(filteredTeleports.map(x => x.name))].map((x, idx) => <Fragment key={idx}>
        <a className={clsx("inline", wikiPointer(isWikiActive))} {...wikiLinkProps(x)}>{x}</a>
        {Separator(idx, filteredTeleports)}
      </Fragment>)}
    </div>
  </div>
}

function NewTeleports({ userSelections, show, setShow }: UserSelection & Hideable) {
  const { isWikiActive } = useWiki();
  if (!show) return null;
  const allTeleports = newTeleports
    .filter(x => userSelections.relics.find(r => r.cleanName === x.relicCleanName))
    .filter(x => userSelections.regions.filter(r => x.cleanRegions.includes(r.cleanName)).length === x.regions.length);
  const categories = [...new Set(allTeleports.map(x => x.category))];

  return <div className="flex flex-col border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full">
    <h1 className="font-bold text-2xl w-full text-center">Teleports</h1>
    {categories.map(category => {
      const filteredTeleports = allTeleports.filter(x => x.category === category)
      return <div key={category} className="flex flex-row gap-5 items-center justify-left w-full h-full border border-cyan-900">
        <div className="h-full flex items-center justify-center min-w-20 p-2">
          <img src={images[category.toLowerCase()]} alt={category} className="max-w-16 max-h-16" />
        </div>
        <div className="p-2 w-full h-full text-center border-cyan-900 border-l">
          {filteredTeleports.map((x, idx) => <Fragment key={idx}>
            <a className={clsx("inline", wikiPointer(isWikiActive))} {...wikiLinkProps(x.wikiLink)}>{x.location}</a>
            {Separator(idx, filteredTeleports)}
          </Fragment>)}
        </div>
      </div>
    })}
  </div>
}

function SlayerMasters({ userSelections, show, setShow }: UserSelection & Hideable) {
  const { isWikiActive } = useWiki();
  if (!show) return null;
  {/* slayer masters */ }
  const filteredSlayerMasters = slayerMasters.filter(x => activityPoints(x, userSelections)).sort((a, b) => a.name.localeCompare(b.name));
  return <div className="border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full md:max-w-xl flex flex-col">
    <h1 className="font-bold text-2xl w-full text-center">Slayer Masters</h1>
    <div className="text-center">
      {filteredSlayerMasters.length === 0 && <div className="text-gray-500 italic text-center w-full">None</div>}
      {[...new Set(filteredSlayerMasters.map(x => x.name))].map((x, idx) => <Fragment key={idx}>
        <a className={clsx("inline", wikiPointer(isWikiActive))} {...wikiLinkProps(x)}>{x}</a>
        {Separator(idx, filteredSlayerMasters)}
      </Fragment>)}
    </div>
  </div>
}

function Minigames({ userSelections, show, setShow }: UserSelection & Hideable) {
  const { isWikiActive } = useWiki();
  if (!show) return null;
  {/* minigames */ }
  const filteredMinigames = minigames.filter(x => activityPoints(x, userSelections)).sort((a, b) => a.name.localeCompare(b.name));
  return <a className={clsx("border border-cyan-900 p-2 rounded-md bg-slate-900 m-5 w-full md:max-w-xl flex flex-col", wikiPointer(isWikiActive))} {...wikiLinkProps('Raging_Echoes_League#Boosted_minigame_points')}>
    <h1 className="font-bold text-2xl w-full text-center">Boosted Minigames</h1>
    <div className="text-gray-500 italic text-center w-full">All of these minigames have boosted rewards.<br />Minigame Reward Rates: 4x at Tier 1, 8x at Tier 4</div>
    <div className="text-center">
      {filteredMinigames.length === 0 && <div className="text-gray-500 italic text-center w-full">None</div>}
      {[...new Set(filteredMinigames.map(x => x.name))].join(" | ")}
    </div>
  </a>
}

function Gear({ userSelections, show, setShow }: UserSelection & Hideable) {
  {/* gear */ }
  const { isWikiActive } = useWiki();
  if (!show) return null;
  return <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-0 mb-10">
    {gearSlots.map(slot => {
      const slotImg = images[GearSlot[slot].toLowerCase()];
      return <div key={slot} className="flex flex-col justify-between gap-3 items-start border border-cyan-900 m-5 p-2 rounded-md bg-slate-900 h-full">
        <img src={slotImg} alt={GearSlot[slot]} className="w-8 h-8 place-self-center" />

        {slot === GearSlot.Weapon && <div className="w-full text-center">
          <span className="text-gray-500">Special attack weapons are shown in </span><span className=" text-green-500">green</span>.
        </div>}
        {combatStyles.map(style => {
          const styleImg = images[CombatStyle[style].toLowerCase()];
          return <div key={style} className="flex flex-col w-full">
            <div className="flex flex-row gap-2 items-center">
              <img src={styleImg} alt={CombatStyle[style]} className="w-8 h-8" />
              <div className="grid grid-rows-3 w-full">
                {gearTiers.map(tier => {
                  const gearNames = [...new Set(gear.filter(x => filterGear(x, slot, tier, style))
                    .filter(x => userSelections.regions.find(r => cleanName(r.name) === cleanName(x.region))).map(x => x.name))];
                  const filteredGear = gearNames.map(x => gear.find(g => g.name === x)).filter(x => x).map(x => x!);
                  return <div key={tier}>
                    <div className="flex flex-row gap-5 p-2 border border-cyan-900 h-full justify-start items-center">
                      <div className="font-bold text-center">{GearTier[tier]}</div>
                      <div className="flex flex-row gap-1 flex-wrap text-center w-full">
                        {filteredGear.map((x, idx) => <Fragment key={idx}>
                          <a className={clsx("inline", wikiPointer(isWikiActive), x.isSpec && "font-bold text-green-500")} {...wikiLinkProps(x.name)}>{x.name}</a>
                          {Separator(idx, filteredGear)}
                        </Fragment>)}
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

function WikiButton({ displaySettings, setDisplaySettings }: UsesDisplaySettings) {
  const { isWikiActive, setIsWikiActive } = useWiki();
  return <div className="fixed bottom-0 right-0" title="Hold Shift and click on an item to open it on the OSRS Wiki.">
    <button className={clsx("w-14 h-14 m-4 rounded-3xl bg-black border-2 p-1 flex justify-center items-center", isWikiActive ? "border-green-800" : "border-stone-700 ")} onClick={_ => setIsWikiActive(!isWikiActive)}>
      <img src={images["wiki"]} alt={"OSRS Wiki"} />
    </button>
  </div>
}

function Attribution() {
  return <div className="fixed bottom-0 left-0 p-1 h-10 bg-black px-2 rounded-sm">
    Some data was originally sourced from <a className="underline" href="https://np.reddit.com/r/2007scape/comments/1guzfo9/leagues_5_planning_sheet/" target="_blank">this spreadsheet</a>.
  </div>
}

function Coffee() {
  return <div className="w-full text-center my-5 flex flex-col items-center justify-center">
    <div>Enjoying this website?</div>
    <a className="py-2 px-2 bg-cyan-900 rounded-md w-max" href="https://buymeacoffee.com/datbear?utm_source=ragingechoes.com" target="_blank"> ☕Buy me a coffee</a>
  </div>
}

function Separator(idx: number, array: { length: number }) {
  return idx + 1 < array.length ? " | " : "";
}
